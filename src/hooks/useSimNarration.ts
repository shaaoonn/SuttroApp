'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ─────────────────────────────────────────────
// useSimNarration — Text-to-Speech narration hook
// Web Speech API based. Speaks welcome on mount,
// contextual feedback 3s after slider change.
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
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speechSynthesis ref (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak function
  const speak = useCallback((text: string) => {
    const synth = synthRef.current;
    if (!synth || !soundEnabled) return;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD'; // Bangla
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Try to find a Bangla voice
    const voices = synth.getVoices();
    const banglaVoice = voices.find(
      (v) => v.lang.startsWith('bn') || v.lang.startsWith('ben')
    );
    if (banglaVoice) {
      utterance.voice = banglaVoice;
    }

    synth.speak(utterance);
  }, [soundEnabled]);

  // Stop speech
  const stopSpeech = useCallback(() => {
    const synth = synthRef.current;
    if (synth) synth.cancel();
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
    setSoundEnabled((prev) => {
      if (prev && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }, []);

  return { soundEnabled, toggleSound };
}
