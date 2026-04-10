'use client';

import { useEffect, useState, useCallback } from 'react';

// ─────────────────────────────────────────────
// Site Content Management — Edit all page texts
// Organized by page tabs
// ─────────────────────────────────────────────

interface ContentItem {
  page: string;
  key: string;
  value: string;
  label: string;
  sort_order: number;
}

const PAGE_TABS: { key: string; label: string; icon: string }[] = [
  { key: 'home', label: 'হোম', icon: '🏠' },
  { key: 'about', label: 'সম্পর্কে', icon: '📄' },
  { key: 'guide', label: 'গাইড', icon: '📚' },
  { key: 'exams', label: 'পরীক্ষা', icon: '📝' },
  { key: 'simulations', label: 'সিমুলেশন', icon: '🔬' },
  { key: 'classes', label: 'ক্লাস', icon: '📹' },
  { key: 'nav', label: 'নেভিগেশন', icon: '🧭' },
  { key: 'footer', label: 'ফুটার', icon: '🔻' },
  { key: 'quicklinks', label: 'কুইক লিংক', icon: '⚡' },
  { key: 'subjects', label: 'বিষয়', icon: '📖' },
];

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/site-content');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        const vals: Record<string, string> = {};
        for (const item of data) {
          vals[`${item.page}:${item.key}`] = item.value;
        }
        setEditValues(vals);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  async function handleSave(page: string, key: string) {
    const id = `${page}:${key}`;
    const value = editValues[id];
    if (value === undefined) return;

    setSaving(id);
    setSaved(null);

    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, key, value }),
      });
      if (res.ok) {
        setSaved(id);
        setTimeout(() => setSaved(null), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  }

  const filtered = items.filter((i) => i.page === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-3" style={{ borderColor: 'var(--admin-primary)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--admin-muted)' }}>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
          সাইট কন্টেন্ট
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--admin-muted)' }}>
          ওয়েবসাইটের সব পেজের লেখা এখান থেকে পরিবর্তন করো
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = items.filter((i) => i.page === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: isActive ? 'var(--admin-primary)' : 'var(--admin-card)',
                color: isActive ? 'white' : 'var(--admin-text)',
                border: isActive ? 'none' : '1px solid var(--admin-border)',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--admin-bg)',
                    color: isActive ? 'white' : 'var(--admin-muted)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Fields */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)' }}
          >
            <p style={{ color: 'var(--admin-muted)' }}>এই পেজের কোনো কন্টেন্ট নেই</p>
          </div>
        ) : (
          filtered.map((item) => {
            const id = `${item.page}:${item.key}`;
            const currentValue = editValues[id] ?? item.value;
            const isChanged = currentValue !== item.value;
            const isSaving = saving === id;
            const isSaved = saved === id;
            const isLong = item.value.length > 80;

            return (
              <div
                key={id}
                className="rounded-xl p-5"
                style={{
                  background: 'var(--admin-card)',
                  border: `1px solid ${isChanged ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
                    {item.label || item.key}
                  </label>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--admin-bg)', color: 'var(--admin-muted)' }}>
                    {item.key}
                  </span>
                </div>

                {isLong ? (
                  <textarea
                    value={currentValue}
                    onChange={(e) => setEditValues({ ...editValues, [id]: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-y"
                    style={{
                      background: 'var(--admin-bg)',
                      color: 'var(--admin-text)',
                      border: '1px solid var(--admin-border)',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setEditValues({ ...editValues, [id]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--admin-bg)',
                      color: 'var(--admin-text)',
                      border: '1px solid var(--admin-border)',
                    }}
                  />
                )}

                {isChanged && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleSave(item.page, item.key)}
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity"
                      style={{ background: 'var(--admin-primary)', opacity: isSaving ? 0.6 : 1 }}
                    >
                      {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
                    </button>
                    <button
                      onClick={() => setEditValues({ ...editValues, [id]: item.value })}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style={{ color: 'var(--admin-muted)', border: '1px solid var(--admin-border)' }}
                    >
                      বাতিল
                    </button>
                  </div>
                )}

                {isSaved && (
                  <p className="text-sm mt-2 font-medium" style={{ color: '#10B981' }}>
                    ✓ সংরক্ষণ হয়েছে
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
