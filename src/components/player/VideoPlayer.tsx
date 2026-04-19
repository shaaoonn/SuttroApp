'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { useFullscreen } from '@/hooks/useFullscreen';

// ─────────────────────────────────────────────
// HLS Video Player - সূত্র | suttro.app
// YouTube-style controls, same player shell as sim
// ─────────────────────────────────────────────

interface VideoPlayerProps {
  src: string;
  title: string;
  chapterTag?: string;
  poster?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ src, title, chapterTag, poster }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // ── HLS setup ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('নেটওয়ার্ক সমস্যা - আবার চেষ্টা করো');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('ভিডিও লোড করা যায়নি');
              hls.destroy();
              break;
          }
        }
      });
      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = src;
    }
  }, [src]);

  // ── Time updates ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setShowControls(true); };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('progress', onProgress);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  // ── Auto-hide controls ──
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [playing, showControls]);

  // ── Playback controls ──
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    setShowControls(true);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
  }, [duration]);

  const changeVolume = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    setMuted(val === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const changeSpeed = useCallback((s: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="suttro-player relative overflow-hidden select-none"
      style={{
        background: 'var(--player-bg)',
        borderRadius: isFullscreen ? 0 : 'var(--player-radius, 10px)',
        aspectRatio: isFullscreen ? 'auto' : '16/9',
        width: '100%',
        height: isFullscreen ? '100vh' : 'auto',
      }}
      onMouseMove={() => setShowControls(true)}
      onClick={(e) => {
        // Only toggle play on video area click, not controls
        if ((e.target as HTMLElement).closest('.player-controls')) return;
        togglePlay();
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        preload="metadata"
      />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-white/80 text-sm">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setError(null); }}
              className="mt-3 px-4 py-2 rounded-lg text-sm text-white"
              style={{ background: 'var(--suttro-primary)' }}
            >
              আবার চেষ্টা করো
            </button>
          </div>
        </div>
      )}

      {/* Big play button (when paused) */}
      {!playing && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(27, 107, 74, 0.9)' }}
          >
            <span className="text-white text-2xl ml-1">▶</span>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div
        className="player-controls absolute top-0 left-0 right-0 z-10 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
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
      </div>

      {/* Bottom bar */}
      <div
        className="player-controls absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-1 mx-4 cursor-pointer group"
          onClick={(e) => { e.stopPropagation(); seek(e); }}
        >
          <div className="absolute inset-0 rounded-full bg-white/20" />
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-white/30"
            style={{ width: `${bufferedProgress}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'var(--suttro-primary)' }}
          />
          {/* Hover thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${progress}%`,
              transform: `translate(-50%, -50%)`,
              background: 'var(--suttro-primary)',
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Play/Pause */}
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="text-white hover:text-white/80 text-lg"
          >
            {playing ? '⏸' : '▶'}
          </button>

          {/* Time */}
          <span className="text-white/60 text-xs font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="text-white/70 hover:text-white text-sm"
            >
              {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-16 h-1 accent-green-600 cursor-pointer"
            />
          </div>

          {/* Speed */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded"
              style={{ background: speed !== 1 ? 'var(--suttro-primary)' : 'transparent' }}
            >
              {speed}x
            </button>
            {showSpeedMenu && (
              <div
                className="absolute bottom-full right-0 mb-2 rounded-lg py-1 min-w-[80px]"
                style={{ background: 'rgba(0,0,0,0.9)' }}
              >
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); changeSpeed(s); }}
                    className={`block w-full text-left px-3 py-1.5 text-xs ${
                      s === speed ? 'text-white font-bold' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand */}
          <span className="text-white/20 text-xs hidden sm:inline font-mono">
            সূত্র
          </span>

          {/* Fullscreen */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="text-white/70 hover:text-white text-base"
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>
    </div>
  );
}
