// ─────────────────────────────────────────────
// Firebase Admin SDK — lazy initialization
// Used for server-side push notification sending
// Dynamic import to prevent build-time crash
// ─────────────────────────────────────────────

let _admin: typeof import('firebase-admin') | null = null;

async function getFirebaseAdmin() {
  if (!_admin) {
    _admin = (await import('firebase-admin')).default as typeof import('firebase-admin');
  }

  const admin = _admin as typeof import('firebase-admin') & { apps: unknown[]; initializeApp: (...args: unknown[]) => void; credential: { cert: (config: Record<string, string>) => unknown }; messaging: () => { sendEachForMulticast: (msg: unknown) => Promise<{ successCount: number; failureCount: number; responses: Array<{ success: boolean; error?: { code: string } }> }> }; };

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

/**
 * Send push notification to specific FCM tokens
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failure: number }> {
  const firebaseAdmin = await getFirebaseAdmin();
  if (!firebaseAdmin) throw new Error('Firebase Admin not initialized');
  if (tokens.length === 0) return { success: 0, failure: 0 };

  const message = {
    tokens,
    notification: { title, body },
    data: data || {},
    android: {
      priority: 'high' as const,
      notification: {
        channelId: data?.channel || 'suttro_general',
        icon: 'ic_launcher',
        color: '#0d9488',
      },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (firebaseAdmin as any).messaging().sendEachForMulticast(message);

  // Clean up invalid tokens
  if (response.failureCount > 0) {
    const invalidTokens: string[] = [];
    response.responses.forEach((resp: { success: boolean; error?: { code: string } }, idx: number) => {
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
