import admin from 'firebase-admin';

// ─────────────────────────────────────────────
// Firebase Admin SDK — singleton initialization
// Used for server-side push notification sending
// ─────────────────────────────────────────────

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK env vars missing');
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  return admin;
}

export const firebaseAdmin = getFirebaseAdmin();

/**
 * Send push notification to specific FCM tokens
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failure: number }> {
  if (!firebaseAdmin) throw new Error('Firebase Admin not initialized');
  if (tokens.length === 0) return { success: 0, failure: 0 };

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: { title, body },
    data: data || {},
    android: {
      priority: 'high',
      notification: {
        channelId: data?.channel || 'suttro_general',
        icon: 'ic_launcher',
        color: '#0d9488',
      },
    },
  };

  const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

  // Clean up invalid tokens
  if (response.failureCount > 0) {
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (
        !resp.success &&
        resp.error &&
        (resp.error.code === 'messaging/invalid-registration-token' ||
          resp.error.code === 'messaging/registration-token-not-registered')
      ) {
        invalidTokens.push(tokens[idx]);
      }
    });

    // Remove invalid tokens from DB
    if (invalidTokens.length > 0) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await sb.from('push_tokens').delete().in('fcm_token', invalidTokens);
        console.log(`Cleaned up ${invalidTokens.length} invalid FCM tokens`);
      } catch (e) {
        console.error('Failed to clean up invalid tokens:', e);
      }
    }
  }

  return {
    success: response.successCount,
    failure: response.failureCount,
  };
}
