import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldFiles } from '@/lib/google-drive';

// ─────────────────────────────────────────────
// Cleanup API — Delete Google Drive files older than 30 days
// Called by: cron job (daily at 3 AM Bangladesh time)
//
// Setup cron (use external cron service like cron-job.org):
//   URL: https://suttro.app/api/upload/cleanup
//   Method: POST
//   Header: x-cron-secret: <your-secret>
//   Schedule: Daily at 3:00 AM (21:00 UTC previous day)
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await cleanupOldFiles(30);

    return NextResponse.json({
      success: true,
      deletedFolders: result.deletedFolders,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Cleanup failed',
    }, { status: 500 });
  }
}
