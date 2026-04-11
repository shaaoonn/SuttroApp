'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isNativeApp, notifyPageChange, notifyReady } from '@/lib/native-bridge';

/**
 * Syncs page navigation with the native Android shell.
 * Notifies SuttroBridge of route changes so native toolbar/bottomnav update.
 */
export default function NativeBridgeSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isNativeApp()) return;
    notifyReady();
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;
    notifyPageChange(pathname);
  }, [pathname]);

  return null;
}
