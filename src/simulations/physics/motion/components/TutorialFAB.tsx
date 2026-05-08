'use client';

import { useState } from 'react';

interface Props {
  videoUrl?: string; // YouTube embed URL — when set, opens modal
}

export default function TutorialFAB({ videoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const placeholder = !videoUrl;

  return (
    <>
      <button
        onClick={() => {
          if (placeholder) {
            // For now, show a friendly placeholder toast — Suttro YouTube channel
            // not yet created (user noted: "আলাদা ইউটিউব চ্যানেল করব পরে")
            return;
          }
          setOpen(true);
        }}
        className="fixed right-4 bottom-4 lg:right-6 lg:bottom-6 z-20 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105"
        style={{
          width: '52px',
          height: '52px',
          background: placeholder ? 'rgba(255, 255, 255, 0.08)' : '#FF0000',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          opacity: placeholder ? 0.4 : 1,
          cursor: placeholder ? 'not-allowed' : 'pointer',
        }}
        title={placeholder ? 'ভিডিও টিউটোরিয়াল শীঘ্রই' : 'ভিডিও টিউটোরিয়াল'}
        aria-label="Tutorial video"
        disabled={placeholder}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {open && videoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
              aria-label="Close"
            >
              ✕
            </button>
            <iframe
              src={videoUrl}
              title="ভিডিও টিউটোরিয়াল"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
