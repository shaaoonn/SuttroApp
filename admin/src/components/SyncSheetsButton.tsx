'use client';

import { useState } from 'react';

export default function SyncSheetsButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; synced?: number; url?: string; error?: string } | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);

    try {
      // Call the main app's sync endpoint
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suttro.app';
      const res = await fetch(`${appUrl}/api/sheets/sync-profiles`, {
        method: 'POST',
        headers: {
          'x-cron-secret': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || '',
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || ''}`,
        },
      });

      // If direct call fails, try via admin's own API proxy
      if (!res.ok) {
        const adminRes = await fetch('/api/sheets-sync', { method: 'POST' });
        const data = await adminRes.json();
        setResult(adminRes.ok
          ? { success: true, synced: data.synced, url: data.spreadsheetUrl }
          : { error: data.error || 'Sync failed' }
        );
      } else {
        const data = await res.json();
        setResult({ success: true, synced: data.synced, url: data.spreadsheetUrl });
      }
    } catch {
      // Fallback: try admin proxy
      try {
        const adminRes = await fetch('/api/sheets-sync', { method: 'POST' });
        const data = await adminRes.json();
        setResult(adminRes.ok
          ? { success: true, synced: data.synced, url: data.spreadsheetUrl }
          : { error: data.error || 'Sync failed' }
        );
      } catch {
        setResult({ error: 'Network error — sync failed' });
      }
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="admin-btn flex items-center gap-2"
        style={{ fontSize: '13px' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
        {syncing ? 'সিংক হচ্ছে...' : 'Google Sheets-এ সিংক'}
      </button>

      {result?.success && (
        <span className="text-xs" style={{ color: '#16a34a' }}>
          {result.synced}জন সিংক হয়েছে
          {result.url && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
              style={{ color: 'var(--admin-primary)' }}
            >
              শীট দেখুন
            </a>
          )}
        </span>
      )}
      {result?.error && (
        <span className="text-xs" style={{ color: '#dc2626' }}>{result.error}</span>
      )}
    </div>
  );
}
