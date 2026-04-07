'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

const SUBJECTS = [
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

export default function NewCQCollectionPage() {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState('physics');
  const [classLevel, setClassLevel] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subjectBn = SUBJECTS.find((s) => s.value === subjectId)?.label || subjectId;
  const collectionId = `cq-${subjectId}`;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: dbErr } = await supabase
      .from('cq_collections')
      .insert({
        id: collectionId,
        subject_id: subjectId,
        subject_bn: subjectBn,
        class_level: classLevel,
        is_published: false,
      });

    if (dbErr) {
      if (dbErr.message.includes('duplicate') || dbErr.message.includes('unique')) {
        setError(`"${collectionId}" ID-তে কালেকশন আগে থেকে আছে।`);
      } else {
        setError(dbErr.message);
      }
      setSaving(false);
      return;
    }

    router.push(`/cq/${collectionId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">নতুন সৃজনশীল কালেকশন</h2>

      <form onSubmit={handleCreate} className="admin-card p-6 max-w-lg space-y-5">
        <div>
          <label className="admin-label">বিষয়</label>
          <select
            className="admin-input"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-label">শ্রেণি</label>
          <select
            className="admin-input"
            value={classLevel}
            onChange={(e) => setClassLevel(Number(e.target.value))}
          >
            <option value={9}>৯</option>
            <option value={10}>১০</option>
          </select>
        </div>

        <div>
          <label className="admin-label">Collection ID (auto)</label>
          <input
            className="admin-input"
            value={collectionId}
            disabled
            style={{ opacity: 0.6 }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--admin-muted)' }}>
            একটি বিষয়ে একটি কালেকশন — প্রশ্ন এডিট পেজে যোগ করতে পারবেন।
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3">
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving ? 'তৈরি হচ্ছে...' : 'তৈরি করো'}
          </button>
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => router.push('/cq')}
          >
            বাতিল
          </button>
        </div>
      </form>
    </div>
  );
}
