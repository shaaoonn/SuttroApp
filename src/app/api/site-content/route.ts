import { NextResponse } from 'next/server';
import { getAllSiteContent } from '@/lib/site-content';

// ─────────────────────────────────────────────
// Site Content API - public read-only
// Returns all content grouped by page
// Used by client components to get dynamic text
// ─────────────────────────────────────────────

export async function GET() {
  const content = await getAllSiteContent();
  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
