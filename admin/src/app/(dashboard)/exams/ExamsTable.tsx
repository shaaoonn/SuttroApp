'use client';

import Link from 'next/link';
import { useState } from 'react';
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

export default function ExamsTable({ exams: initial }: { exams: ExamRow[] }) {
  const [exams, setExams] = useState(initial);

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

  return (
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
            {exams.map((exam) => (
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
                  <Link
                    href={`/exams/${exam.id}`}
                    className="text-sm font-medium"
                    style={{ color: 'var(--admin-primary)' }}
                  >
                    এডিট
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
