'use client';

import Link from 'next/link';
import { useState } from 'react';
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

export default function ClassesTable({ classes: initial }: { classes: ClassRow[] }) {
  const [classes, setClasses] = useState(initial);

  async function toggleAvailable(id: string, current: boolean) {
    // Optimistic update
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, available: !current } : c)),
    );
    const { error } = await supabase
      .from('class_recordings')
      .update({ available: !current })
      .eq('id', id);
    if (error) {
      // Revert on failure
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, available: current } : c)),
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
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>অধ্যায়</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>তারিখ</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সময়কাল</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>সোর্স</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
              <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
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
                  {cls.youtube_id ? '🔴 YouTube' : cls.hls_src ? '🟢 HLS' : '—'}
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
                  <Link
                    href={`/classes/${cls.id}`}
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
