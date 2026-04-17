'use client';

import Link from 'next/link';
import { type ComponentProps, type ReactNode } from 'react';
import { useHaptic } from './Toast';

// ─────────────────────────────────────────────
// PressableLink — Link with built-in tap feedback + haptic
// Drop-in replacement for next/link that adds:
//  • active:scale-[0.96] press feedback
//  • light haptic vibration on tap
//  • Material-style ripple effect (optional)
// ─────────────────────────────────────────────

interface Props extends ComponentProps<typeof Link> {
  haptic?: boolean;
  ripple?: boolean;
  children: ReactNode;
}

export default function PressableLink({
  haptic = true,
  ripple = false,
  className = '',
  onClick,
  children,
  ...rest
}: Props) {
  const vibrate = useHaptic();
  return (
    <Link
      {...rest}
      className={`tappable ${ripple ? 'ripple' : ''} ${className}`}
      onClick={(e) => {
        if (haptic) vibrate(8);
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
