import { NextRequest, NextResponse } from 'next/server';
import { syncAllProfiles, isSheetsConfigured } from '@/lib/google-sheets';

// ─────────────────────────────────────────────
// Google Sheets Profile Sync API
//
// POST: Full sync all profiles to Google Sheet
// Protected by cron secret or admin auth
//
// Can be triggered by:
//   1. External cron (every 6 hours)
//   2. Admin panel manually
//   3. After significant profile changes
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth: cron secret or admin service role
  const cronSecret = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('authorization');

  const validCron = cronSecret === process.env.SUPABASE_SERVICE_ROLE_KEY;
  const validAdmin = authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

  if (!validCron && !validAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSheetsConfigured()) {
    return NextResponse.json({
      error: 'Google Sheets not configured',
      message: 'Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, and GOOGLE_DRIVE_ROOT_FOLDER_ID',
    }, { status: 503 });
  }

  try {
    const result = await syncAllProfiles();
    return NextResponse.json({
      success: true,
      synced: result.synced,
      spreadsheetId: result.spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Sheets Sync Error]', err);
    return NextResponse.json({
      error: 'Sync failed',
      message: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET: Check sync status
export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({
    configured: true,
    endpoint: '/api/sheets/sync-profiles',
    method: 'POST',
    auth: 'x-cron-secret or Bearer token (service role key)',
  });
}
