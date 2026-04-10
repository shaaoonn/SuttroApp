import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────
// On-demand Revalidation API
// Called by admin panel after CMS content update
// Refreshes cached pages immediately
// ─────────────────────────────────────────────

const PAGE_MAP: Record<string, string[]> = {
  home: ['/'],
  about: ['/about'],
  guide: ['/guide'],
  exams: ['/exams'],
  simulations: ['/simulations'],
  classes: ['/classes'],
  nav: ['/'],
  footer: ['/'],
  quicklinks: ['/'],
  subjects: ['/'],
};

export async function POST(req: NextRequest) {
  // Simple secret check
  const secret = req.headers.get('x-revalidate-secret');
  const expectedSecret = process.env.REVALIDATE_SECRET || 'suttro-revalidate-2026';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { page } = body;

    if (page && PAGE_MAP[page]) {
      // Revalidate specific pages
      for (const path of PAGE_MAP[page]) {
        revalidatePath(path);
      }
    } else {
      // Revalidate all CMS-powered pages
      revalidatePath('/');
      revalidatePath('/about');
      revalidatePath('/guide');
      revalidatePath('/exams');
      revalidatePath('/simulations');
      revalidatePath('/classes');
    }

    // Clear in-memory cache
    const { clearCache } = await import('@/lib/site-content');
    clearCache();

    return NextResponse.json({ ok: true, revalidated: page || 'all' });
  } catch (err) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
