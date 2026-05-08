'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import type { SimRow } from './page';

interface Row extends SimRow {
  subjectBn: string;
}

const STATUS_LABEL: Record<Row['status'], string> = {
  public: 'পাবলিক',
  private: 'প্রাইভেট',
  deleted: 'ডিলিট',
};

const STATUS_COLOR: Record<Row['status'], { bg: string; fg: string }> = {
  public: { bg: '#dcfce7', fg: '#16a34a' },
  private: { bg: '#fef3c7', fg: '#a16207' },
  deleted: { bg: '#fef2f2', fg: '#dc2626' },
};

const SUBJECT_OPTIONS = [
  { value: '', label: 'সব বিষয়' },
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

export default function SimulationsTable({ simulations: initial }: { simulations: Row[] }) {
  const router = useRouter();
  const [sims, setSims] = useState(initial);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function cycleStatus(slug: string, current: Row['status']) {
    // public → private → public (deleted is separate via soft-delete button)
    const next: Row['status'] = current === 'public' ? 'private' : 'public';
    setSims((prev) =>
      prev.map((s) => (s.slug === slug ? { ...s, status: next } : s)),
    );
    const { error } = await supabase
      .from('simulations')
      .update({ status: next })
      .eq('slug', slug);
    if (error) {
      // revert
      setSims((prev) =>
        prev.map((s) => (s.slug === slug ? { ...s, status: current } : s)),
      );
    }
  }

  async function handleSoftDelete() {
    if (!deleteSlug) return;
    setBusy(true);
    const { error } = await supabase
      .from('simulations')
      .update({ status: 'deleted' })
      .eq('slug', deleteSlug);
    if (!error) {
      setSims((prev) => prev.filter((s) => s.slug !== deleteSlug));
    }
    setDeleteSlug(null);
    setBusy(false);
    router.refresh();
  }

  const filtered = sims.filter((s) => {
    if (subjectFilter && s.subject !== subjectFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.title_bn.toLowerCase().includes(q) || s.slug.includes(q);
    }
    return true;
  });

  return (
    <>
      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="admin-input"
          style={{ maxWidth: 300 }}
          placeholder="শিরোনাম বা slug দিয়ে খুঁজো..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input"
          style={{ maxWidth: 200 }}
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {SUBJECT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="text-sm self-center" style={{ color: 'var(--admin-muted)' }}>
          {filtered.length}/{sims.length}টি
        </span>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সিরিয়াল</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শিরোনাম</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>Slug</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বিষয়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>অধ্যায়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>মিডিয়া</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const color = STATUS_COLOR[s.status];
                return (
                  <tr
                    key={s.slug}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: 'var(--admin-border)' }}
                  >
                    <td className="px-4 py-3 text-sm font-mono">{s.order_index}</td>
                    <td className="px-4 py-3 text-sm font-medium">{s.title_bn}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{s.slug}</td>
                    <td className="px-4 py-3 text-sm">{s.subjectBn}</td>
                    <td className="px-4 py-3 text-sm">
                      ক্লাস {s.nctb_class} · অ. {s.nctb_chapter}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {s.youtube_url && <span title="YouTube">🔴</span>}
                        {s.thumbnail_url && <span title="Thumbnail">🖼</span>}
                        {!s.youtube_url && !s.thumbnail_url && (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => cycleStatus(s.slug, s.status)}
                        className="px-2.5 py-1 rounded text-xs font-medium"
                        style={{ background: color.bg, color: color.fg }}
                      >
                        {STATUS_LABEL[s.status]}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/simulations/${s.slug}`}
                          className="text-sm font-medium"
                          style={{ color: 'var(--admin-primary)' }}
                        >
                          এডিট
                        </Link>
                        <a
                          href={`https://suttro.app/sim/${s.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          ↗ View
                        </a>
                        <button
                          onClick={() => setDeleteSlug(s.slug)}
                          className="text-sm font-medium"
                          style={{ color: '#dc2626' }}
                        >
                          ডিলিট
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--admin-muted)' }}>
                    কোনো সিমুলেশন পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soft-delete confirm */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">সিমুলেশন hide করবেন?</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--admin-muted)' }}>
              &quot;{sims.find((s) => s.slug === deleteSlug)?.title_bn}&quot; — সিমুলেশনটি public থেকে সরে যাবে। কোডে data থাকবে; পরে restore করা যাবে। সম্পূর্ণ delete করতে DB থেকে row remove করতে হবে।
            </p>
            <div className="flex gap-3 justify-end">
              <button className="admin-btn-outline" onClick={() => setDeleteSlug(null)} disabled={busy}>
                বাতিল
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: '#dc2626' }}
                onClick={handleSoftDelete}
                disabled={busy}
              >
                {busy ? 'প্রসেস হচ্ছে...' : 'Hide করো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
