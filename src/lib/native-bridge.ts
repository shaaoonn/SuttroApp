/**
 * Native bridge for communication between WebView and native Android shell.
 * The native app injects `window.SuttroBridge` via @JavascriptInterface.
 */

interface SuttroBridgeInterface {
  getSession(): string;
  onPageChanged(path: string): void;
  logout(): void;
  onReady(): void;
  isNativeApp(): boolean;
}

declare global {
  interface Window {
    SuttroBridge?: SuttroBridgeInterface;
  }
}

/** Returns true if running inside the native Android shell */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    !!window.SuttroBridge ||
    navigator.userAgent.includes('SuttroApp')
  );
}

/** Notify native shell of page navigation */
export function notifyPageChange(path: string): void {
  try {
    window.SuttroBridge?.onPageChanged(path);
  } catch {
    // Bridge not available
  }
}

/** Notify native shell that web content is ready */
export function notifyReady(): void {
  try {
    window.SuttroBridge?.onReady();
  } catch {
    // Bridge not available
  }
}

/** Trigger native logout flow */
export function nativeLogout(): void {
  try {
    window.SuttroBridge?.logout();
  } catch {
    // Bridge not available
  }
}
