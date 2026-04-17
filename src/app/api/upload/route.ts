import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadSubmission, uploadContent } from '@/lib/google-drive';

// ─────────────────────────────────────────────
// File Upload API → Google Drive
// Handles: student photo submissions + admin content uploads
// Files stored in Google Drive, URLs stored in database
// ─────────────────────────────────────────────

async function getVerifiedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  try {
    const token = auth.replace('Bearer ', '');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  const userId = await getVerifiedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('type') as string; // 'submission' | 'content'
    const date = formData.get('date') as string;
    const studentName = formData.get('studentName') as string;
    const subjectId = formData.get('subjectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'ফাইল ২০MB এর বেশি হতে পারবে না' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get today's date in Bangladesh timezone if not provided
    const uploadDate = date || (() => {
      const now = new Date();
      const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      return bdTime.toISOString().split('T')[0];
    })();

    let result;

    if (uploadType === 'submission') {
      // Student photo upload
      result = await uploadSubmission(
        buffer,
        file.name,
        uploadDate,
        studentName || userId.slice(0, 8),
      );
    } else {
      // Admin content upload (PDF, image, video)
      result = await uploadContent(buffer, file.name, uploadDate, subjectId);
    }

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
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';

    // If Google Drive is not configured, fall back gracefully
    if (message.includes('not configured')) {
      return NextResponse.json({
        error: 'Google Drive সেটআপ করা হয়নি। অ্যাডমিনকে জানাও।',
        fallback: true,
      }, { status: 503 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
