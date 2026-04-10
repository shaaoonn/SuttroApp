import { google, sheets_v4 } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Google Sheets — User Profile Auto-Sync
//
// Automatically syncs all user profiles to a Google Sheet
// whenever profiles are created/updated. Uses OAuth2 refresh
// token to authenticate as the user's own Google account.
//
// Sheet structure:
//   Row 1: Headers
//   Row 2+: One row per user (sorted by created_at desc)
//
// Columns: ID | নাম | ফোন | ইমেইল | ক্লাস | সাবস্ক্রিপশন | সাবস্ক্রিপশন মেয়াদ | যোগদান | আপডেট
// ─────────────────────────────────────────────

let sheetsClient: sheets_v4.Sheets | null = null;

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Google OAuth2 credentials not configured. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN'
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function getSheets(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;
  const auth = getOAuth2Client();
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

function getDrive() {
  const auth = getOAuth2Client();
  return google.drive({ version: 'v3', auth });
}

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

/**
 * Get or create the user profiles spreadsheet in the Suttro folder.
 * Returns the spreadsheet ID.
 */
async function getOrCreateSpreadsheet(): Promise<string> {
  const sheetId = process.env.GOOGLE_SHEETS_PROFILE_ID;
  if (sheetId) return sheetId;

  const drive = getDrive();
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!rootFolderId) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID not configured');

  // Check if spreadsheet already exists in Suttro folder
  const existing = await drive.files.list({
    q: `name='${SHEET_TITLE}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  // Create new spreadsheet in Suttro folder
  const sheets = getSheets();
  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: SHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: 'Users',
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    },
  });

  const newId = res.data.spreadsheetId!;

  // Move to Suttro folder
  await drive.files.update({
    fileId: newId,
    addParents: rootFolderId,
    removeParents: 'root',
    fields: 'id, parents',
  });

  // Set headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: newId,
    range: 'Users!A1:I1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [HEADERS],
    },
  });

  // Format header row (bold, background color)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: newId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.13, green: 0.55, blue: 0.13 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 11,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        // Auto-resize columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 9,
            },
          },
        },
      ],
    },
  });

  return newId;
}

/**
 * Format a date for display in Bengali-friendly format
 */
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

const PLAN_LABELS: Record<string, string> = {
  free: 'ফ্রি',
  premium: 'প্রিমিয়াম',
  pro: 'প্রো',
};

/**
 * Sync ALL user profiles to the Google Sheet.
 * Replaces all data (except header) with fresh data from DB.
 * Called by cron or after profile changes.
 */
export async function syncAllProfiles(): Promise<{ synced: number; spreadsheetId: string }> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all profiles
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);

  // Fetch auth users for email info
  const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map<string, { email?: string }>();
  for (const u of users || []) {
    userMap.set(u.id, { email: u.email });
  }

  const spreadsheetId = await getOrCreateSpreadsheet();
  const sheets = getSheets();

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

  // Clear existing data (keep header)
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: 'Users!A2:I',
  });

  // Write all rows
  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A2:I',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });
  }

  // Auto-resize columns
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 9,
              },
            },
          },
        ],
      },
    });
  } catch {
    // Non-critical
  }

  return { synced: rows.length, spreadsheetId };
}

/**
 * Check if Google Sheets integration is configured
 */
export function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  );
}
