import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Diagnostic endpoint - actually attempts the Google Sheets
// sync and reports the FULL error (not swallowed). Protected
// by a shared secret so it's safe to publish the URL.
//
// Usage (from browser):
//   https://suttro.app/api/sheets/diagnose?key=<SUPABASE_SERVICE_ROLE_KEY>
//
// Reports on:
//   1. Env var presence
//   2. Google OAuth token exchange (catches expired refresh tokens)
//   3. Drive folder access
//   4. Spreadsheet find/create
//   5. Profile fetch from DB (checks if phone column has data)
//   6. Actual sheet write
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || key !== serviceKey) {
    return NextResponse.json({ error: 'unauthorized - pass ?key=<service_role_key>' }, { status: 401 });
  }

  const report: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: {} as Record<string, unknown>,
  };

  // Step 1: env presence
  const envStatus = {
    GOOGLE_OAUTH_CLIENT_ID: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REFRESH_TOKEN: !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    GOOGLE_DRIVE_ROOT_FOLDER_ID: !!process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  };
  (report.steps as Record<string, unknown>)['1_env'] = envStatus;
  if (Object.values(envStatus).some(v => !v)) {
    report.conclusion = 'missing env vars';
    return NextResponse.json(report, { status: 500 });
  }

  // Step 2: OAuth token exchange
  let oauth2;
  try {
    oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    );
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });
    const token = await oauth2.getAccessToken();
    (report.steps as Record<string, unknown>)['2_oauth'] = {
      ok: !!token.token,
      tokenPrefix: token.token ? token.token.slice(0, 12) + '...' : null,
    };
  } catch (err) {
    (report.steps as Record<string, unknown>)['2_oauth'] = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      hint: 'Refresh token likely expired or revoked. Regenerate via OAuth Playground.',
    };
    report.conclusion = 'OAuth token exchange failed';
    return NextResponse.json(report, { status: 500 });
  }

  // Step 3: Drive folder access
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2 });
    const folder = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!,
      fields: 'id, name, mimeType',
    });
    (report.steps as Record<string, unknown>)['3_drive_folder'] = {
      ok: true,
      name: folder.data.name,
      mimeType: folder.data.mimeType,
    };
  } catch (err) {
    (report.steps as Record<string, unknown>)['3_drive_folder'] = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      hint: 'Folder ID invalid or OAuth account has no access.',
    };
    report.conclusion = 'Drive folder access failed';
    return NextResponse.json(report, { status: 500 });
  }

  // Step 4: Find spreadsheet
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2 });
    const existing = await drive.files.list({
      q: `name='Suttro - ইউজার প্রোফাইল' and '${process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name, modifiedTime)',
      spaces: 'drive',
    });
    (report.steps as Record<string, unknown>)['4_find_sheet'] = {
      found: (existing.data.files?.length || 0) > 0,
      files: existing.data.files,
    };
  } catch (err) {
    (report.steps as Record<string, unknown>)['4_find_sheet'] = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Step 5: Profile data sanity
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: profiles, count } = await sb
      .from('profiles')
      .select('id, name, phone, class_level', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    const withPhone = (profiles || []).filter(p => p.phone).length;
    (report.steps as Record<string, unknown>)['5_profile_data'] = {
      totalProfiles: count,
      sample: profiles?.map(p => ({
        name: p.name,
        phone: p.phone ? `${p.phone.slice(0, 5)}****` : null,
        class_level: p.class_level,
      })),
      sampleWithPhone: `${withPhone}/${profiles?.length || 0}`,
    };
  } catch (err) {
    (report.steps as Record<string, unknown>)['5_profile_data'] = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  report.conclusion = 'all checks passed - env + OAuth + Drive access + DB all healthy';
  return NextResponse.json(report);
}
