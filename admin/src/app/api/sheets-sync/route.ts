import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ─────────────────────────────────────────────
// Admin — Google Sheets Profile Sync
// Server-side sync (no CORS issues)
// ─────────────────────────────────────────────

const SHEET_TITLE = 'Suttro — ইউজার প্রোফাইল';
const HEADERS = [
  'ID',
  'নাম (Name)',
  'ফোন (Phone)',
  'ইমেইল (Email)',
  'ক্লাস (Class)',
  'সাবস্ক্রিপশন (Plan)',
  'মেয়াদ (Expires)',
  'যোগদান (Joined)',
  'আপডেট (Updated)',
];

const PLAN_LABELS: Record<string, string> = {
  free: 'ফ্রি',
  premium: 'প্রিমিয়াম',
  pro: 'প্রো',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth2 credentials not configured');
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export async function POST() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken || !rootFolderId) {
    return NextResponse.json({ error: 'Google OAuth2 credentials not configured' }, { status: 503 });
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Find or create spreadsheet
    let spreadsheetId: string;
    const existing = await drive.files.list({
      q: `name='${SHEET_TITLE}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (existing.data.files && existing.data.files.length > 0) {
      spreadsheetId = existing.data.files[0].id!;
    } else {
      // Create new
      const res = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: SHEET_TITLE },
          sheets: [{ properties: { title: 'Users', gridProperties: { frozenRowCount: 1 } } }],
        },
      });
      spreadsheetId = res.data.spreadsheetId!;

      // Move to Suttro folder
      await drive.files.update({
        fileId: spreadsheetId,
        addParents: rootFolderId,
        removeParents: 'root',
        fields: 'id, parents',
      });

      // Make accessible
      try {
        await drive.permissions.create({
          fileId: spreadsheetId,
          requestBody: { role: 'writer', type: 'anyone' },
        });
      } catch { /* non-critical */ }

      // Set headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!A1:I1',
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      });

      // Format header
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.13, green: 0.55, blue: 0.13 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
          ],
        },
      });
    }

    // Fetch profiles
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Fetch auth users for emails
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const userMap = new Map<string, { email?: string }>();
    for (const u of users || []) {
      userMap.set(u.id, { email: u.email });
    }

    // Build rows
    const rows = (profiles || []).map(p => {
      const authUser = userMap.get(p.id);
      return [
        p.id,
        p.name || '—',
        p.phone || '—',
        authUser?.email || '—',
        p.class_level?.toString() || '—',
        PLAN_LABELS[p.subscription_plan] || p.subscription_plan || 'ফ্রি',
        formatDate(p.subscription_expires_at),
        formatDate(p.created_at),
        formatDate(p.updated_at),
      ];
    });

    // Clear and write
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Users!A2:I',
    });

    if (rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!A2:I',
        valueInputOption: 'RAW',
        requestBody: { values: rows },
      });
    }

    return NextResponse.json({
      success: true,
      synced: rows.length,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (err) {
    console.error('[Admin Sheets Sync]', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Sync failed',
    }, { status: 500 });
  }
}
