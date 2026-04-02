'use client';

import { useState, useCallback, useEffect } from 'react';

export type InteractionMode = 'mouse' | 'hand';

export function useInteractionMode() {
  const [mode, setMode] = useState<InteractionMode>('mouse');
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);

  // Spacebar hold = temporary hand mode (like Photoshop)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && e.target === document.body) {
        e.preventDefault();
        setIsSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'mouse' ? 'hand' : 'mouse'));
  }, []);

  const setMouseMode = useCallback(() => setMode('mouse'), []);
  const setHandMode = useCallback(() => setMode('hand'), []);

  // Effective mode: space held overrides to hand
  const effectiveMode: InteractionMode = isSpaceHeld ? 'hand' : mode;

  const cursor =
    effectiveMode === 'hand'
      ? isSpaceHeld
        ? 'grabbing'
        : 'grab'
      : 'default';

  return {
    mode,
    effectiveMode,
    cursor,
    toggleMode,
    setMouseMode,
    setHandMode,
    isSpaceHeld,
  };
}
