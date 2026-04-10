'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

interface LessonRow {
  id: string;
  lesson_date: string;
  title: string;
  subject_id: string | null;
  chapter_num: number | null;
  class_level: number;
  total_marks: number;
  is_published: boolean;
  item_count: number;
}

export default function DailyLessonsTable({ lessons: initial }: { lessons: LessonRow[] }) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initial);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function togglePublished(id: string, current: boolean) {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, is_published: !current } : l));
    const { error } = await supabase
      .from('daily_lessons')
      .update({ is_published: !current })
      .eq('id', id);
    if (error) {
      setLessons(prev => prev.map(l => l.id === id ? { ...l, is_published: current } : l));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from('daily_lessons')
      .delete()
      .eq('id', deleteId);
    if (!error) {
      setLessons(prev => prev.filter(l => l.id !== deleteId));
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>তারিখ</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শিরোনাম</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বিষয়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>আইটেম</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>নম্বর</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map(lesson => {
                const isToday = lesson.lesson_date === today;
                return (
                  <tr
                    key={lesson.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: 'var(--admin-border)',
                      background: isToday ? '#eff6ff' : undefined,
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {lesson.lesson_date}
                      {isToday && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-700 bg-blue-100">
                          আজ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{lesson.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {lesson.subject_id ? SUBJECT_LABELS[lesson.subject_id] || lesson.subject_id : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">{lesson.item_count}টি</td>
                    <td className="px-4 py-3 text-sm">{lesson.total_marks}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(lesson.id, lesson.is_published)}
                        className="px-2.5 py-1 rounded text-xs font-medium"
                        style={{
                          background: lesson.is_published ? '#dcfce7' : '#fef2f2',
                          color: lesson.is_published ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {lesson.is_published ? 'প্রকাশিত' : 'ড্রাফট'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/daily-lessons/${lesson.id}`}
                          className="text-sm font-medium"
                          style={{ color: 'var(--admin-primary)' }}
                        >
                          এডিট
                        </Link>
                        <button
                          onClick={() => setDeleteId(lesson.id)}
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
              {lessons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--admin-muted)' }}>
                    কোনো পড়া তৈরি হয়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">পড়া ডিলিট করবেন?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--admin-muted)' }}>
              এই পড়া এবং এর সব আইটেম স্থায়ীভাবে মুছে যাবে।
            </p>
            <div className="flex gap-3 justify-end">
              <button className="admin-btn-outline" onClick={() => setDeleteId(null)} disabled={deleting}>
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
