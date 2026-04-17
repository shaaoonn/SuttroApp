'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ─────────────────────────────────────────────
// Toast — native-style transient notifications
// Slides up from bottom, auto-dismisses, doesn't block interaction.
// Usage:
//   const toast = useToast();
//   toast.success('সফলভাবে সংরক্ষিত হয়েছে');
//   toast.error('কিছু একটা সমস্যা হয়েছে');
// ─────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContext {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const Ctx = createContext<ToastContext | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bg: string; text: string; icon: string }> = {
  success: { bg: '#10B981', text: '#FFFFFF', icon: '✓' },
  error: { bg: '#EF4444', text: '#FFFFFF', icon: '✕' },
  info: { bg: '#0D9488', text: '#FFFFFF', icon: 'ℹ' },
  warning: { bg: '#F59E0B', text: '#FFFFFF', icon: '⚠' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  const ctx: ToastContext = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
    warning: (m) => show(m, 'warning'),
  };

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div
        className="fixed left-0 right-0 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {toasts.map((t) => {
          const v = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className="slide-up pointer-events-auto px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 max-w-sm w-full"
              style={{
                background: v.bg,
                color: v.text,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
              onClick={() => dismiss(t.id)}
            >
              <span className="text-base font-bold flex-shrink-0">{v.icon}</span>
              <span className="text-sm font-medium flex-1">{t.message}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastContext {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Fallback no-op if provider not mounted (SSR safety)
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return ctx;
}

/** Hook for haptic feedback — no-op if not in WebView with vibrate support */
export function useHaptic() {
  return useCallback((duration: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // ignore
      }
    }
  }, []);
}

/** Auto-mark page as loaded once (for page-enter animation) */
export function usePageReady() {
  useEffect(() => {
    document.body.classList.add('page-ready');
    return () => document.body.classList.remove('page-ready');
  }, []);
}
