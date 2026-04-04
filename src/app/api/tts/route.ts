import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────
// TTS API Route — Google Translate TTS proxy
// Natural Bangla pronunciation via Google's neural TTS
// GET /api/tts?text=...&lang=bn
// Returns audio/mpeg
// ─────────────────────────────────────────────

const MAX_CHUNK_LENGTH = 200; // Google TTS character limit per request

/** Split text into chunks at sentence boundaries (। or .) */
function splitText(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK_LENGTH) {
      chunks.push(remaining);
      break;
    }

    // Find the best split point within limit
    let splitIdx = -1;

    // Try Bangla sentence ender (।)
    const banglaPeriodIdx = remaining.lastIndexOf('।', MAX_CHUNK_LENGTH);
    if (banglaPeriodIdx > 0) splitIdx = banglaPeriodIdx + 1;

    // Try regular period
    if (splitIdx < 0) {
      const periodIdx = remaining.lastIndexOf('.', MAX_CHUNK_LENGTH);
      if (periodIdx > 0) splitIdx = periodIdx + 1;
    }

    // Try comma
    if (splitIdx < 0) {
      const commaIdx = remaining.lastIndexOf(',', MAX_CHUNK_LENGTH);
      if (commaIdx > 0) splitIdx = commaIdx + 1;

      // Try Bangla comma
      const banglaCommaIdx = remaining.lastIndexOf(',', MAX_CHUNK_LENGTH);
      if (banglaCommaIdx > splitIdx) splitIdx = banglaCommaIdx + 1;
    }

    // Try space as last resort
    if (splitIdx < 0) {
      const spaceIdx = remaining.lastIndexOf(' ', MAX_CHUNK_LENGTH);
      if (spaceIdx > 0) splitIdx = spaceIdx + 1;
    }

    // Hard split if nothing found
    if (splitIdx < 0) splitIdx = MAX_CHUNK_LENGTH;

    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

/** Fetch a single TTS chunk from Google Translate */
async function fetchTTSChunk(
  text: string,
  lang: string,
  chunkIdx: number,
  totalChunks: number
): Promise<ArrayBuffer> {
  const url = new URL('https://translate.google.com/translate_tts');
  url.searchParams.set('ie', 'UTF-8');
  url.searchParams.set('q', text);
  url.searchParams.set('tl', lang);
  url.searchParams.set('total', totalChunks.toString());
  url.searchParams.set('idx', chunkIdx.toString());
  url.searchParams.set('textlen', text.length.toString());
  url.searchParams.set('client', 'tw-ob');
  url.searchParams.set('prev', 'input');
  url.searchParams.set('ttsspeed', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
    },
  });

  if (!res.ok) {
    throw new Error(`Google TTS returned ${res.status}`);
  }

  return res.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');
  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  const lang = req.nextUrl.searchParams.get('lang') || 'bn';

  try {
    const chunks = splitText(text);

    if (chunks.length === 1) {
      // Single chunk — stream directly
      const audio = await fetchTTSChunk(chunks[0], lang, 0, 1);
      return new NextResponse(audio, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    }

    // Multiple chunks — concatenate audio buffers
    const audioBuffers = await Promise.all(
      chunks.map((chunk, i) => fetchTTSChunk(chunk, lang, i, chunks.length))
    );

    // Combine all buffers
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new NextResponse(combined.buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err) {
    console.error('TTS error:', err);
    return NextResponse.json(
      { error: 'TTS generation failed' },
      { status: 500 }
    );
  }
}
