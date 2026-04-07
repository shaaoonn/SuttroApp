'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

interface CQRow {
  id: string;
  subject_id: string;
  subjectBn: string;
  class_level: number;
  is_published: boolean;
  questionCount: number;
}

export default function CQCollectionsTable({ collections: initial }: { collections: CQRow[] }) {
  const router = useRouter();
  const [collections, setCollections] = useState(initial);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function togglePublished(id: string, current: boolean) {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_published: !current } : c)),
    );
    const { error } = await supabase
      .from('cq_collections')
      .update({ is_published: !current })
      .eq('id', id);
    if (error) {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_published: current } : c)),
      );
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    // creative_questions have ON DELETE CASCADE, cq_parts cascade from creative_questions
    const { error } = await supabase
      .from('cq_collections')
      .delete()
      .eq('id', deleteId);
    if (!error) {
      setCollections((prev) => prev.filter((c) => c.id !== deleteId));
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>বিষয়</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>শ্রেণি</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>প্রশ্ন সংখ্যা</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}>স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: 'var(--admin-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <td className="px-4 py-3 text-sm font-mono">{c.id}</td>
                  <td className="px-4 py-3 text-sm">{c.subjectBn}</td>
                  <td className="px-4 py-3 text-sm">{c.class_level}</td>
                  <td className="px-4 py-3 text-sm">{c.questionCount}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(c.id, c.is_published)}
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{
                        background: c.is_published ? '#dcfce7' : '#fef2f2',
                        color: c.is_published ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {c.is_published ? 'প্রকাশিত' : 'ড্রাফট'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cq/${c.id}`}
                        className="text-sm font-medium"
                        style={{ color: 'var(--admin-primary)' }}
                      >
                        এডিট
                      </Link>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="text-sm font-medium"
                        style={{ color: '#dc2626' }}
                      >
                        ডিলিট
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--admin-muted)' }}>
                    কোনো কালেকশন নেই
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
            <h3 className="text-lg font-semibold mb-2">কালেকশন ডিলিট করবেন?</h3>
            <p className="text-sm mb-1" style={{ color: 'var(--admin-muted)' }}>
              ID: {deleteId}
            </p>
            <p className="text-sm mb-5" style={{ color: '#dc2626' }}>
              এই কালেকশন ও এর সব সৃজনশীল প্রশ্ন স্থায়ীভাবে মুছে যাবে।
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
