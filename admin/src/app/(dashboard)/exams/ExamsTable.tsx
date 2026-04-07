'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface ExamRow {
  id: string;
  title: string;
  subject_id: string;
  subjectBn: string;
  year: number;
  board: string | null;
  duration: number;
  total_marks: number;
  is_published: boolean;
  questionCount: number;
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

export default function ExamsTable({ exams: initial }: { exams: ExamRow[] }) {
  const router = useRouter();
  const [exams, setExams] = useState(initial);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function togglePublished(id: string, current: boolean) {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_published: !current } : e)),
    );
    const { error } = await supabase
      .from('exam_papers')
      .update({ is_published: !current })
      .eq('id', id);
    if (error) {
      setExams((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_published: current } : e)),
      );
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    // mcq_questions have ON DELETE CASCADE, so deleting exam paper removes questions too
    const { error } = await supabase
      .from('exam_papers')
      .delete()
      .eq('id', deleteId);
    if (!error) {
      setExams((prev) => prev.filter((e) => e.id !== deleteId));
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  const filtered = exams.filter((exam) => {
    if (subjectFilter && exam.subject_id !== subjectFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return exam.title.toLowerCase().includes(q) || exam.id.toLowerCase().includes(q);
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
          placeholder="শিরোনাম বা ID দিয়ে খুঁজো..."
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
          {filtered.length}/{exams.length}টি পরীক্ষা
        </span>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শিরোনাম</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বিষয়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বছর</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>প্রশ্ন</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সময়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>নম্বর</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <td className="px-4 py-3 text-sm font-medium">{exam.title}</td>
                  <td className="px-4 py-3 text-sm">{exam.subjectBn}</td>
                  <td className="px-4 py-3 text-sm">{exam.year}</td>
                  <td className="px-4 py-3 text-sm">{exam.questionCount}</td>
                  <td className="px-4 py-3 text-sm">{exam.duration} মি.</td>
                  <td className="px-4 py-3 text-sm">{exam.total_marks}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(exam.id, exam.is_published)}
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{
                        background: exam.is_published ? '#dcfce7' : '#fef2f2',
                        color: exam.is_published ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {exam.is_published ? 'প্রকাশিত' : 'ড্রাফট'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/exams/${exam.id}`}
                        className="text-sm font-medium"
                        style={{ color: 'var(--admin-primary)' }}
                      >
                        এডিট
                      </Link>
                      <button
                        onClick={() => setDeleteId(exam.id)}
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
                    কোনো পরীক্ষা পাওয়া যায়নি
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
            <h3 className="text-lg font-semibold mb-2">পরীক্ষা ডিলিট করবেন?</h3>
            <p className="text-sm mb-1" style={{ color: 'var(--admin-muted)' }}>
              &quot;{exams.find((e) => e.id === deleteId)?.title}&quot;
            </p>
            <p className="text-sm mb-5" style={{ color: '#dc2626' }}>
              এই পরীক্ষা ও এর সব MCQ প্রশ্ন স্থায়ীভাবে মুছে যাবে।
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
