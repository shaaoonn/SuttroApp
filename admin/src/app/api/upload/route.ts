import { NextRequest, NextResponse } from 'next/server';
import { uploadAdminContent, isGDriveConfigured } from '@/lib/google-drive';

// ─────────────────────────────────────────────
// Admin File Upload → Google Drive
// Handles: PDF, image, video uploads for daily lessons
// ─────────────────────────────────────────────

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for admin (videos can be large)

export async function POST(req: NextRequest) {
  try {
    if (!isGDriveConfigured()) {
      return NextResponse.json({
        error: 'Google Drive সেটআপ করা হয়নি',
        hint: 'GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_DRIVE_ROOT_FOLDER_ID সেট করুন',
      }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0];
    const subjectId = formData.get('subjectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'কোনো ফাইল দেওয়া হয়নি' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'ফাইল ১০০MB এর বেশি হতে পারবে না' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadAdminContent(buffer, file.name, date, subjectId);

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      url: result.directUrl,
      viewUrl: result.viewUrl,
      downloadUrl: result.downloadUrl,
      fileName: result.fileName,
      mimeType: result.mimeType,
      size: result.size,
    });
  } catch (err: unknown) {
    console.error('Admin upload error:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'আপলোড ব্যর্থ',
    }, { status: 500 });
  }
}
