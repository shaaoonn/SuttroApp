'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface ClassRow {
  id: string;
  slug: string;
  title: string;
  subject_id: string;
  subjectBn: string;
  chapter_num: number;
  class_level: string;
  date_label: string;
  duration: string;
  available: boolean;
  youtube_id: string | null;
  hls_src: string | null;
}

const SUBJECT_OPTIONS = [
  { value: '', label: 'সব বিষয়' },
  { value: 'physics', label: 'পদার্থবিজ্ঞান' },
  { value: 'chemistry', label: 'রসায়ন' },
  { value: 'biology', label: 'জীববিজ্ঞান' },
  { value: 'math', label: 'সাধারণ গণিত' },
  { value: 'higher-math', label: 'উচ্চতর গণিত' },
  { value: 'english', label: 'ইংরেজি' },
];

export default function ClassesTable({ classes: initial }: { classes: ClassRow[] }) {
  const router = useRouter();
  const [classes, setClasses] = useState(initial);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function toggleAvailable(id: string, current: boolean) {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, available: !current } : c)),
    );
    const { error } = await supabase
      .from('class_recordings')
      .update({ available: !current })
      .eq('id', id);
    if (error) {
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, available: current } : c)),
      );
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from('class_recordings')
      .delete()
      .eq('id', deleteId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== deleteId));
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  const filtered = classes.filter((cls) => {
    if (subjectFilter && cls.subject_id !== subjectFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return cls.title.toLowerCase().includes(q) || cls.slug.includes(q);
    }
    return true;
  });

  return (
    <>
      {/* Search & Filter */}
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
          {filtered.length}/{classes.length}টি ক্লাস
        </span>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শিরোনাম</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বিষয়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>অধ্যায়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>তারিখ</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সময়কাল</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সোর্স</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cls) => (
                <tr
                  key={cls.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <td className="px-4 py-3 text-sm font-medium">{cls.title}</td>
                  <td className="px-4 py-3 text-sm">{cls.subjectBn}</td>
                  <td className="px-4 py-3 text-sm">{cls.chapter_num}</td>
                  <td className="px-4 py-3 text-sm">{cls.date_label}</td>
                  <td className="px-4 py-3 text-sm">{cls.duration}</td>
                  <td className="px-4 py-3 text-sm">
                    {cls.youtube_id ? '🔴 YouTube' : cls.hls_src ? '🟢 HLS' : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailable(cls.id, cls.available)}
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{
                        background: cls.available ? '#dcfce7' : '#fef2f2',
                        color: cls.available ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {cls.available ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/classes/${cls.id}`}
                        className="text-sm font-medium"
                        style={{ color: 'var(--admin-primary)' }}
                      >
                        এডিট
                      </Link>
                      <button
                        onClick={() => setDeleteId(cls.id)}
                        className="text-sm font-medium"
                        style={{ color: '#dc2626' }}
                      >
                        ডিলিট
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--admin-muted)' }}>
                    কোনো ক্লাস পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">ক্লাস ডিলিট করবেন?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--admin-muted)' }}>
              &quot;{classes.find((c) => c.id === deleteId)?.title}&quot; — এই ক্লাসটি স্থায়ীভাবে মুছে যাবে।
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="admin-btn-outline"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                বাতিল
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: '#dc2626' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'ডিলিট হচ্ছে...' : 'ডিলিট করো'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
