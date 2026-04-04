'use client';

import { useRef } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';

// ─────────────────────────────────────────────
// YouTube Embed Player — সূত্র | suttro.app
// Responsive iframe embed with fullscreen
// ─────────────────────────────────────────────

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  chapterTag?: string;
}

export default function YouTubePlayer({ videoId, title, chapterTag }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div
      ref={containerRef}
      className="suttro-player relative overflow-hidden select-none"
      style={{
        background: 'var(--player-bg)',
        borderRadius: isFullscreen ? 0 : 'var(--player-radius, 10px)',
        width: '100%',
      }}
    >
      {/* Top bar overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 min-w-0">
          {chapterTag && (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium shrink-0"
              style={{ background: 'var(--suttro-primary)', color: 'white' }}
            >
              {chapterTag}
            </span>
          )}
          <span className="text-white/80 text-sm truncate">{title}</span>
        </div>
      </div>

      {/* YouTube iframe */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&color=white`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          style={{ border: 0 }}
        />
      </div>

      {/* Bottom branding bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        <span className="text-white/30 text-xs font-mono">সূত্র</span>
        <button
          onClick={toggleFullscreen}
          className="text-white/50 hover:text-white text-sm transition-colors"
          title="ফুলস্ক্রিন"
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </div>
    </div>
  );
}
