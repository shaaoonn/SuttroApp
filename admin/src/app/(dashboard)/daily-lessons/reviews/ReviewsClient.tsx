'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

// ─────────────────────────────────────────────
// ReviewsClient — Admin reviews student submissions
// Mark written/photo answers, give feedback
// ─────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  study:     { bg: '#EFF6FF', text: '#1E40AF' },
  memorize:  { bg: '#F5F3FF', text: '#5B21B6' },
  homework:  { bg: '#FFF7ED', text: '#EA580C' },
  challenge: { bg: '#FEF2F2', text: '#DC2626' },
};

const CATEGORY_LABELS: Record<string, string> = {
  study: 'পড়া', memorize: 'মুখস্ত', homework: 'বাড়ির কাজ', challenge: 'চ্যালেঞ্জ',
};

interface Submission {
  id: string;
  user_id: string;
  text_answer: string | null;
  photo_urls: string[] | null;
  submitted_at: string;
  marks_given: number | null;
  feedback: string | null;
  reviewed_at: string | null;
  daily_lesson_items: {
    id: number;
    title: string;
    category: string;
    item_type: string;
    marks: number;
    daily_lessons: { id: string; lesson_date: string; title: string };
  };
  student: { name: string; phone: string; class_level?: number };
}

export default function ReviewsClient({
  pending: initialPending,
  reviewed,
}: {
  pending: Submission[];
  reviewed: Submission[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(initialPending);
  const [tab, setTab] = useState<'pending' | 'reviewed'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSubmitReview(sub: Submission) {
    const marksVal = parseFloat(marks[sub.id] || '0');
    const feedbackVal = feedbacks[sub.id] || '';
    const maxMarks = sub.daily_lesson_items.marks;

    if (marksVal < 0 || marksVal > maxMarks) {
      alert(`নম্বর ০ থেকে ${maxMarks} এর মধ্যে হতে হবে`);
      return;
    }

    setSaving(sub.id);

    const { error } = await supabase
      .from('daily_submissions')
      .update({
        marks_given: marksVal,
        feedback: feedbackVal || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    if (!error) {
      // Recompute daily score
      const lesson = sub.daily_lesson_items.daily_lessons;
      await supabase.rpc('compute_daily_score', {
        p_user_id: sub.user_id,
        p_lesson_id: lesson.id,
        p_date: lesson.lesson_date,
      });

      setPending(prev => prev.filter(p => p.id !== sub.id));
    }

    setSaving(null);
    router.refresh();
  }

  const list = tab === 'pending' ? pending : reviewed;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('pending')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: tab === 'pending' ? 'var(--admin-primary)' : 'white',
            color: tab === 'pending' ? 'white' : 'var(--admin-text)',
            border: '1px solid var(--admin-border)',
          }}
        >
          ⏳ মূল্যায়ন বাকি ({pending.length})
        </button>
        <button
          onClick={() => setTab('reviewed')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: tab === 'reviewed' ? 'var(--admin-success)' : 'white',
            color: tab === 'reviewed' ? 'white' : 'var(--admin-text)',
            border: '1px solid var(--admin-border)',
          }}
        >
          ✅ মূল্যায়ন সম্পন্ন ({reviewed.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="admin-card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
              {tab === 'pending' ? 'কোনো জমা মূল্যায়নের জন্য নেই' : 'এখনো কোনো মূল্যায়ন হয়নি'}
            </p>
          </div>
        ) : (
          list.map(sub => {
            const item = sub.daily_lesson_items;
            const lesson = item.daily_lessons;
            const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.study;
            const isExpanded = expandedId === sub.id;

            return (
              <div key={sub.id} className="admin-card overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
                        {sub.student.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ background: catColor.bg, color: catColor.text }}>
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      {sub.photo_urls && sub.photo_urls.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">
                          📷 ছবি
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                      {lesson.lesson_date} — {item.title}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {sub.marks_given != null ? (
                      <span className="text-sm font-bold" style={{ color: 'var(--admin-success)' }}>
                        {sub.marks_given}/{item.marks}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        মূল্যায়ন বাকি
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-3" style={{ borderColor: 'var(--admin-border)', background: '#fafafa' }}>
                    {/* Student Answer */}
                    {sub.text_answer && (
                      <div>
                        <label className="text-xs font-semibold" style={{ color: 'var(--admin-muted)' }}>
                          লিখিত উত্তর:
                        </label>
                        <div className="mt-1 p-3 rounded-lg text-sm whitespace-pre-wrap"
                          style={{ background: 'white', border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}>
                          {sub.text_answer}
                        </div>
                      </div>
                    )}

                    {sub.photo_urls && sub.photo_urls.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold" style={{ color: 'var(--admin-muted)' }}>
                          ছবি:
                        </label>
                        <div className="mt-1 flex gap-2 flex-wrap">
                          {sub.photo_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`উত্তর ${i + 1}`}
                                className="rounded-lg border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ maxWidth: 300, maxHeight: 200, borderColor: 'var(--admin-border)' }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Marking Form (only for pending) */}
                    {tab === 'pending' && (
                      <div className="flex items-end gap-3 pt-2">
                        <div>
                          <label className="admin-label text-xs">নম্বর (/{item.marks})</label>
                          <input
                            type="number"
                            className="admin-input"
                            style={{ width: 100 }}
                            min={0}
                            max={item.marks}
                            value={marks[sub.id] || ''}
                            onChange={e => setMarks(prev => ({ ...prev, [sub.id]: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="admin-label text-xs">মন্তব্য (ঐচ্ছিক)</label>
                          <input
                            className="admin-input"
                            value={feedbacks[sub.id] || ''}
                            onChange={e => setFeedbacks(prev => ({ ...prev, [sub.id]: e.target.value }))}
                            placeholder="ভালো হয়েছে, আরো চেষ্টা করো..."
                          />
                        </div>
                        <button
                          onClick={() => handleSubmitReview(sub)}
                          disabled={saving === sub.id || !marks[sub.id]}
                          className="admin-btn-primary whitespace-nowrap disabled:opacity-50"
                        >
                          {saving === sub.id ? 'সংরক্ষণ...' : '✓ মার্ক দাও'}
                        </button>
                      </div>
                    )}

                    {/* Show feedback for reviewed */}
                    {tab === 'reviewed' && sub.feedback && (
                      <div className="p-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                        <span className="text-xs font-bold" style={{ color: '#166534' }}>মন্তব্য: </span>
                        <span className="text-sm" style={{ color: '#166534' }}>{sub.feedback}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
