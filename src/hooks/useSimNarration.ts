'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ─────────────────────────────────────────────
// useSimNarration — Text-to-Speech narration hook
// Uses Google Translate TTS via /api/tts proxy
// for natural Bangla pronunciation.
//
// Speaks welcome on mount, contextual feedback
// 3s after slider change (debounced).
// ─────────────────────────────────────────────

export interface NarrationTemplate {
  /** Welcome message — spoken once on mount */
  welcome: string;
  /** Generate contextual message from current variable values */
  generateMessage: (values: Record<string, number>) => string;
}

interface UseSimNarrationOptions {
  /** Narration template for this simulation */
  template: NarrationTemplate;
  /** Current variable values */
  values: Record<string, number>;
  /** Whether sound is enabled */
  soundEnabled: boolean;
}

export function useSimNarration({ template, values, soundEnabled }: UseSimNarrationOptions) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeSpokenRef = useRef(false);
  const prevValuesRef = useRef<Record<string, number> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Speak function — uses Google TTS via /api/tts
  const speak = useCallback((text: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;

    // Cancel any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    // Abort any pending fetch
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    // Build TTS URL via our API proxy
    const ttsUrl = `/api/tts?lang=bn&text=${encodeURIComponent(text)}`;

    const audio = new Audio(ttsUrl);
    audio.volume = 0.9;
    audioRef.current = audio;

    audio.play().catch(() => {
      // Autoplay blocked or audio error — silently ignore
    });
  }, [soundEnabled]);

  // Stop speech
  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  // Welcome message — spoken once on mount
  useEffect(() => {
    if (!soundEnabled || welcomeSpokenRef.current) return;

    // Small delay to let the page settle
    const timeout = setTimeout(() => {
      if (soundEnabled && !welcomeSpokenRef.current) {
        speak(template.welcome);
        welcomeSpokenRef.current = true;
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [soundEnabled, template.welcome, speak]);

  // Debounced variable change narration (3s after last change)
  useEffect(() => {
    // Skip initial render
    if (prevValuesRef.current === null) {
      prevValuesRef.current = { ...values };
      return;
    }

    // Check if values actually changed
    const prev = prevValuesRef.current;
    const changed = Object.keys(values).some(
      (k) => values[k] !== prev[k]
    );

    if (!changed) return;

    prevValuesRef.current = { ...values };

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce — 3 seconds after last change
    debounceRef.current = setTimeout(() => {
      if (soundEnabled) {
        const msg = template.generateMessage(values);
        speak(msg);
      }
    }, 3000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [values, soundEnabled, template, speak]);

  // Stop playback immediately when sound is toggled off
  useEffect(() => {
    if (!soundEnabled) {
      stopSpeech();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    }
  }, [soundEnabled, stopSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [stopSpeech]);

  return { speak, stopSpeech };
}

// ─────────────────────────────────────────────
// useSoundToggle — manages sound on/off state
// Default: ON
// ─────────────────────────────────────────────

export function useSoundToggle(defaultOn = true) {
  const [soundEnabled, setSoundEnabled] = useState(defaultOn);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return { soundEnabled, toggleSound };
}
