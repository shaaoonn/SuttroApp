'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

// ─────────────────────────────────────────────
// Simulation edit form (admin-editable text + media + visibility)
// Code-side: title/description in this DB row override config.ts.
// ─────────────────────────────────────────────

interface SimRecord {
  id: number;
  slug: string;
  title_bn: string;
  title_en: string | null;
  description_bn: string | null;
  description_en: string | null;
  long_description_bn: string | null;
  subject: string;
  nctb_class: number;
  nctb_chapter: number;
  nctb_section: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  thumbnail_svg: string | null;
  status: 'public' | 'private' | 'deleted';
  order_index: number;
  tags: string[] | null;
  duration_minutes: number | null;
  difficulty: number | null;
}

const SUBJECT_OPTIONS = [
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

export default function SimulationEditForm({ initial }: { initial: SimRecord }) {
  const router = useRouter();
  const [form, setForm] = useState<SimRecord>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof SimRecord>(key: K, value: SimRecord[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      title_bn: form.title_bn,
      title_en: form.title_en,
      description_bn: form.description_bn,
      description_en: form.description_en,
      long_description_bn: form.long_description_bn,
      subject: form.subject,
      nctb_class: form.nctb_class,
      nctb_chapter: form.nctb_chapter,
      nctb_section: form.nctb_section,
      youtube_url: form.youtube_url,
      thumbnail_url: form.thumbnail_url,
      thumbnail_svg: form.thumbnail_svg,
      status: form.status,
      order_index: form.order_index,
      tags: form.tags,
      duration_minutes: form.duration_minutes,
      difficulty: form.difficulty,
    };
    const { error: err } = await supabase
      .from('simulations')
      .update(payload)
      .eq('slug', form.slug);
    if (err) {
      setError(err.message);
    } else {
      setSavedAt(new Date());
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
          {form.title_bn}
        </h1>
        <p className="text-sm font-mono mt-1" style={{ color: 'var(--admin-muted)' }}>
          slug: {form.slug}  ·  /sim/{form.slug}
        </p>
      </div>

      {/* ─── Title + Description ─── */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
          শিরোনাম ও বিবরণ
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="বাংলা শিরোনাম *">
            <input
              className="admin-input"
              value={form.title_bn}
              onChange={(e) => update('title_bn', e.target.value)}
            />
          </Field>
          <Field label="English Title">
            <input
              className="admin-input"
              value={form.title_en ?? ''}
              onChange={(e) => update('title_en', e.target.value || null)}
            />
          </Field>
        </div>
        <Field label="সংক্ষিপ্ত বিবরণ (গ্যালারি কার্ড + SEO)" hint="১-২ লাইন। গ্যালারি কার্ডে আর /sim page-এ দেখাবে।">
          <textarea
            className="admin-input"
            rows={2}
            value={form.description_bn ?? ''}
            onChange={(e) => update('description_bn', e.target.value || null)}
          />
        </Field>
        <Field label="English Description">
          <textarea
            className="admin-input"
            rows={2}
            value={form.description_en ?? ''}
            onChange={(e) => update('description_en', e.target.value || null)}
          />
        </Field>
        <Field label="পূর্ণ বিবরণ" hint="player-এর নিচে দেখাবে — পাঠ্যবইয়ের ভাষায় বিস্তারিত। multi-line OK।">
          <textarea
            className="admin-input"
            rows={5}
            value={form.long_description_bn ?? ''}
            onChange={(e) => update('long_description_bn', e.target.value || null)}
          />
        </Field>
      </div>

      {/* ─── Curriculum mapping ─── */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
          NCTB ম্যাপিং
        </h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <Field label="বিষয় *">
            <select
              className="admin-input"
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="ক্লাস *">
            <select
              className="admin-input"
              value={form.nctb_class}
              onChange={(e) => update('nctb_class', Number(e.target.value))}
            >
              <option value={9}>৯</option>
              <option value={10}>১০</option>
            </select>
          </Field>
          <Field label="অধ্যায় *">
            <input
              className="admin-input"
              type="number"
              min={1}
              value={form.nctb_chapter}
              onChange={(e) => update('nctb_chapter', Number(e.target.value))}
            />
          </Field>
          <Field label="সেকশন">
            <input
              className="admin-input"
              value={form.nctb_section ?? ''}
              onChange={(e) => update('nctb_section', e.target.value || null)}
            />
          </Field>
        </div>
      </div>

      {/* ─── Media ─── */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
          মিডিয়া
        </h2>
        <Field
          label="YouTube ভিডিও URL"
          hint="player-এর নিচে FAB icon দিয়ে modal-এ দেখাবে। youtube.com/watch?v=… বা youtu.be/… দিতে পারো।"
        >
          <input
            className="admin-input"
            value={form.youtube_url ?? ''}
            onChange={(e) => update('youtube_url', e.target.value || null)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Field>
        <Field
          label="থামনেল URL"
          hint="external image URL (Drive / CDN)। দিলে gallery card-এ এই image দেখাবে।"
        >
          <input
            className="admin-input"
            value={form.thumbnail_url ?? ''}
            onChange={(e) => update('thumbnail_url', e.target.value || null)}
            placeholder="https://..."
          />
        </Field>
        <Field
          label="থামনেল SVG (inline)"
          hint="যদি image না দাও, এখানে inline SVG কোড দিতে পারো। কোড না দিলে default fallback ব্যবহার হবে।"
        >
          <textarea
            className="admin-input font-mono text-xs"
            rows={4}
            value={form.thumbnail_svg ?? ''}
            onChange={(e) => update('thumbnail_svg', e.target.value || null)}
            placeholder="<svg ...></svg>"
          />
        </Field>
      </div>

      {/* ─── Visibility + ordering ─── */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
          দৃশ্যমানতা ও অর্ডার
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="স্ট্যাটাস">
            <select
              className="admin-input"
              value={form.status}
              onChange={(e) => update('status', e.target.value as SimRecord['status'])}
            >
              <option value="public">পাবলিক — সবাই দেখবে</option>
              <option value="private">প্রাইভেট — শুধু admin</option>
              <option value="deleted">ডিলিট — gallery থেকে সরবে</option>
            </select>
          </Field>
          <Field label="সিরিয়াল নম্বর" hint="ছোট মানে আগে দেখাবে।">
            <input
              className="admin-input"
              type="number"
              value={form.order_index}
              onChange={(e) => update('order_index', Number(e.target.value))}
            />
          </Field>
          <Field label="আনুমানিক সময় (মিনিট)">
            <input
              className="admin-input"
              type="number"
              min={1}
              value={form.duration_minutes ?? ''}
              onChange={(e) =>
                update('duration_minutes', e.target.value ? Number(e.target.value) : null)
              }
            />
          </Field>
          <Field label="কঠিনতা (১-৫)">
            <input
              className="admin-input"
              type="number"
              min={1}
              max={5}
              value={form.difficulty ?? ''}
              onChange={(e) =>
                update('difficulty', e.target.value ? Number(e.target.value) : null)
              }
            />
          </Field>
          <Field label="ট্যাগ" hint="কমা দিয়ে আলাদা: kinematics, NCTB, SSC">
            <input
              className="admin-input"
              value={(form.tags ?? []).join(', ')}
              onChange={(e) =>
                update(
                  'tags',
                  e.target.value
                    ? e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                    : null,
                )
              }
            />
          </Field>
        </div>
      </div>

      {/* ─── Save bar ─── */}
      <div
        className="sticky bottom-0 admin-card p-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: '#FFFFFF' }}
      >
        <div className="flex items-baseline gap-3 text-sm">
          {error && <span style={{ color: '#dc2626' }}>⚠ {error}</span>}
          {savedAt && !error && (
            <span style={{ color: '#16a34a' }}>
              ✓ সংরক্ষিত {savedAt.toLocaleTimeString('bn-BD')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={`https://suttro.app/sim/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-outline"
          >
            ↗ Preview
          </a>
          <button
            className="admin-btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text)' }}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}
