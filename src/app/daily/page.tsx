'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// আজকের পড়া — Daily Lesson Page
// Content sections: study, memorize, homework, challenge
// Supports: video, sim, PDF, image, note, MCQ, written Q
// ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  study:     { label: 'পড়া', icon: '📖', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
  memorize:  { label: 'মুখস্ত', icon: '🧠', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  homework:  { label: 'বাড়ির কাজ', icon: '✏️', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  challenge: { label: 'চ্যালেঞ্জ', icon: '🏆', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const ITEM_TYPE_ICONS: Record<string, string> = {
  video: '▶', simulation: '🔬', pdf: '📄', image: '🖼️',
  note: '📝', mcq_set: '✅', written_question: '✍️',
};

const SUBJECT_LABELS: Record<string, { label: string; color: string }> = {
  physics: { label: 'পদার্থবিজ্ঞান', color: '#1E40AF' },
  chemistry: { label: 'রসায়ন', color: '#166534' },
  biology: { label: 'জীববিজ্ঞান', color: '#9D174D' },
  math: { label: 'গণিত', color: '#9A3412' },
  'higher-math': { label: 'উচ্চতর গণিত', color: '#7E22CE' },
  english: { label: 'ইংরেজি', color: '#991B1B' },
};

interface McqQuestion {
  id: number;
  question: string;
  option_ka: string;
  option_kha: string;
  option_ga: string;
  option_gha: string;
  correct: number;
  explanation: string | null;
  marks: number;
}

interface Submission {
  id: string;
  is_completed: boolean;
  mcq_score?: number;
  mcq_total?: number;
  marks_given?: number;
  feedback?: string;
  text_answer?: string;
  photo_urls?: string[];
}

interface LessonItem {
  id: number;
  item_type: string;
  category: string;
  title: string;
  description?: string;
  content_ref?: string;
  media_url?: string;
  content_body?: string;
  marks: number;
  subject_id?: string;
  chapter_num?: number;
  mcqs: McqQuestion[];
  submission: Submission | null;
}

interface Lesson {
  id: string;
  lesson_date: string;
  title: string;
  subject_id: string;
  total_marks: number;
  class_level?: number;
}

interface DailyScore {
  marks_earned: number;
  marks_possible: number;
  score_pct: number;
  items_completed: number;
  items_total: number;
}

type Phase = 'loading' | 'no_lesson' | 'lesson';

export default function DailyLessonPage() {
  const { session } = useAuth();
  const [phase, setPhase] = useState<Phase>('loading');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [items, setItems] = useState<LessonItem[]>([]);
  const [dailyScore, setDailyScore] = useState<DailyScore | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const loadLesson = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    try {
      const res = await fetch('/api/daily-lesson', { headers });
      const data = await res.json();
      if (!data.lesson) {
        setPhase('no_lesson');
        return;
      }
      setLesson(data.lesson);
      setItems(data.items || []);
      setDailyScore(data.dailyScore);
      setPhase('lesson');
    } catch {
      setPhase('no_lesson');
    }
  }, [session]);

  useEffect(() => { loadLesson(); }, [loadLesson]);

  // Group items by category
  const grouped = items.reduce<Record<string, LessonItem[]>>((acc, item) => {
    const cat = item.category || 'study';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Calculate completion stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.submission?.is_completed).length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (phase === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="animate-spin h-8 w-8 border-3 rounded-full"
          style={{ borderColor: '#0D9488 transparent transparent transparent' }} />
      </div>
    );
  }

  if (phase === 'no_lesson') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="text-center px-6 max-w-sm">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#1E293B' }}>
            আজকের পড়া
          </h1>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            আজকের জন্য কোনো পড়া নির্ধারিত হয়নি। কাল আবার দেখো!
          </p>
          <Link
            href="/exams"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white suttro-transition"
            style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
          >
            পরীক্ষা দাও →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* ── Mobile Layout ── */}
      <div className="lg:hidden px-4 py-3 flex flex-col gap-3 pb-24">
        {/* Header Card */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDFA)', border: '1px solid #BFDBFE' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold" style={{ color: '#1E293B' }}>
                  📖 {lesson?.title || 'আজকের পড়া'}
                </h1>
                {lesson?.class_level && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: lesson.class_level === 9 ? '#3B82F6' : '#7C3AED' }}>
                    {lesson.class_level === 9 ? '৯ম' : '১০ম'}
                  </span>
                )}
              </div>
              <p className="text-[12px]" style={{ color: '#64748B' }}>
                {new Date(lesson?.lesson_date || '').toLocaleDateString('bn-BD', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
            </div>
            {dailyScore && (
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: dailyScore.score_pct >= 80 ? '#16A34A' : dailyScore.score_pct >= 50 ? '#F59E0B' : '#DC2626' }}
                >
                  {Math.round(dailyScore.score_pct)}
                </div>
                <div className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
                  /১০০
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full" style={{ background: '#E2E8F0' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? '#16A34A' : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                }}
              />
            </div>
            <span className="text-[12px] font-bold" style={{ color: '#3B82F6' }}>
              {completedItems}/{totalItems}
            </span>
          </div>
        </div>

        {/* Category Sections */}
        {['study', 'memorize', 'homework', 'challenge'].map(cat => {
          const catItems = grouped[cat];
          if (!catItems || catItems.length === 0) return null;
          const catStyle = CATEGORY_LABELS[cat];

          return (
            <div key={cat} className="flex flex-col gap-2">
              {/* Category header */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-base">{catStyle.icon}</span>
                <span className="text-sm font-bold" style={{ color: catStyle.color }}>
                  {catStyle.label}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                  style={{ background: catStyle.bg, color: catStyle.color }}>
                  {catItems.length}টি
                </span>
              </div>

              {/* Items */}
              {catItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  catStyle={catStyle}
                  expanded={expandedItem === item.id}
                  onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  session={session}
                  onSubmit={loadLesson}
                />
              ))}
            </div>
          );
        })}

        {/* All Done Card */}
        {progressPct === 100 && (
          <div className="rounded-xl p-4 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm font-bold" style={{ color: '#166534' }}>
              আজকের সব পড়া শেষ!
            </p>
            <p className="text-[12px]" style={{ color: '#16A34A' }}>
              {dailyScore ? `স্কোর: ${Math.round(dailyScore.score_pct)}/১০০` : 'দারুণ কাজ!'}
            </p>
          </div>
        )}
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#134E4A' }}>
            📖 {lesson?.title || 'আজকের পড়া'}
          </h1>
          <p className="text-base mb-6" style={{ color: '#94A3B8' }}>
            আজকের নির্ধারিত পড়া ও কাজ সম্পন্ন করো
          </p>

          {/* Desktop items in same card style */}
          <div className="space-y-4">
            {['study', 'memorize', 'homework', 'challenge'].map(cat => {
              const catItems = grouped[cat];
              if (!catItems || catItems.length === 0) return null;
              const catStyle = CATEGORY_LABELS[cat];

              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{catStyle.icon}</span>
                    <h2 className="text-xl font-bold" style={{ color: catStyle.color }}>
                      {catStyle.label}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {catItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        catStyle={catStyle}
                        expanded={expandedItem === item.id}
                        onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        session={session}
                        onSubmit={loadLesson}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ItemCard — Individual lesson item
// ─────────────────────────────────────────────

function ItemCard({
  item, catStyle, expanded, onToggle, session, onSubmit,
}: {
  item: LessonItem;
  catStyle: { color: string; bg: string; border: string };
  expanded: boolean;
  onToggle: () => void;
  session: { access_token: string } | null;
  onSubmit: () => void;
}) {
  const isCompleted = item.submission?.is_completed ?? false;
  const hasMarks = item.marks > 0;
  const marksGiven = item.submission?.marks_given;
  const feedback = item.submission?.feedback;
  const icon = ITEM_TYPE_ICONS[item.item_type] || '📋';

  return (
    <div
      className="rounded-xl overflow-hidden suttro-transition"
      style={{
        background: 'white',
        border: `1px solid ${isCompleted ? '#BBF7D0' : catStyle.border}`,
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left suttro-transition active:scale-[0.99]"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{
            background: isCompleted ? '#F0FDF4' : catStyle.bg,
            color: isCompleted ? '#16A34A' : catStyle.color,
          }}
        >
          {isCompleted ? '✓' : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold line-clamp-1" style={{ color: '#1E293B' }}>
              {item.title}
            </span>
            {item.subject_id && SUBJECT_LABELS[item.subject_id] && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: '#F1F5F9', color: SUBJECT_LABELS[item.subject_id].color }}>
                {SUBJECT_LABELS[item.subject_id].label}
              </span>
            )}
          </div>
          {item.description && (
            <div className="text-[11px] line-clamp-1" style={{ color: '#94A3B8' }}>
              {item.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasMarks && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{
                background: marksGiven != null ? '#F0FDF4' : catStyle.bg,
                color: marksGiven != null ? '#16A34A' : catStyle.color,
              }}>
              {marksGiven != null ? `${Math.round(Number(marksGiven))}/${item.marks}` : `${item.marks} নম্বর`}
            </span>
          )}
          <span
            className="text-[10px] transition-transform"
            style={{ color: '#94A3B8', transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: '#F1F5F9' }}>
          {/* Feedback from teacher */}
          {feedback && (
            <div className="mb-2 p-2 rounded-lg text-[12px]" style={{ background: '#FFFBEB', color: '#92400E' }}>
              💬 শিক্ষকের মন্তব্য: {feedback}
            </div>
          )}

          {/* Content-based items */}
          {['video', 'simulation', 'pdf', 'image', 'note'].includes(item.item_type) && (
            <ContentItemBody item={item} session={session} onSubmit={onSubmit} />
          )}

          {/* MCQ Set */}
          {item.item_type === 'mcq_set' && (
            <McqSetBody item={item} session={session} onSubmit={onSubmit} />
          )}

          {/* Written Question */}
          {item.item_type === 'written_question' && (
            <WrittenQuestionBody item={item} session={session} onSubmit={onSubmit} />
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Content Item (video, sim, pdf, image, note)
// ─────────────────────────────────────────────

function ContentItemBody({
  item, session, onSubmit,
}: {
  item: LessonItem;
  session: { access_token: string } | null;
  onSubmit: () => void;
}) {
  const isCompleted = item.submission?.is_completed ?? false;
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!session || isCompleted) return;
    setLoading(true);
    await fetch('/api/daily-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ item_id: item.id, type: 'completion' }),
    });
    setLoading(false);
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-2">
      {item.content_body && (
        <div className="text-[13px] leading-relaxed" style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>
          {item.content_body}
        </div>
      )}

      {item.content_ref && (
        <Link
          href={
            item.item_type === 'video' ? `/class/${item.content_ref}` :
            item.item_type === 'simulation' ? `/sim/${item.content_ref}` :
            '#'
          }
          className="flex items-center gap-2 p-2 rounded-lg text-[13px] font-medium suttro-transition active:scale-[0.98]"
          style={{ background: '#F0FDFA', color: '#0D9488', border: '1px solid #99F6E4' }}
        >
          <span>{ITEM_TYPE_ICONS[item.item_type]}</span>
          {item.item_type === 'video' ? 'ভিডিও দেখো →' : 'সিমুলেশন চালাও →'}
        </Link>
      )}

      {item.media_url && (
        <a
          href={item.media_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg text-[13px] font-medium suttro-transition"
          style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}
        >
          <span>{ITEM_TYPE_ICONS[item.item_type]}</span>
          {item.item_type === 'pdf' ? 'PDF দেখো →' : 'ছবি দেখো →'}
        </a>
      )}

      {!isCompleted ? (
        <button
          onClick={handleComplete}
          disabled={loading || !session}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white suttro-transition active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'সংরক্ষণ...' : '✓ সম্পন্ন হিসেবে চিহ্নিত করো'}
        </button>
      ) : (
        <div className="text-center py-2 text-[12px] font-semibold" style={{ color: '#16A34A' }}>
          ✅ সম্পন্ন
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MCQ Set
// ─────────────────────────────────────────────

function McqSetBody({
  item, session, onSubmit,
}: {
  item: LessonItem;
  session: { access_token: string } | null;
  onSubmit: () => void;
}) {
  const isCompleted = item.submission?.is_completed ?? false;
  const [answers, setAnswers] = useState<number[]>(new Array(item.mcqs.length).fill(-1));
  const [revealed, setRevealed] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const labels = ['ক', 'খ', 'গ', 'ঘ'];

  const handleSubmit = async () => {
    if (!session || isCompleted) return;
    setLoading(true);
    const res = await fetch('/api/daily-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        item_id: item.id,
        type: 'mcq',
        mcq_answers: answers.map((selected) => ({ selected })),
      }),
    });
    if (res.ok) {
      setRevealed(true);
    }
    setLoading(false);
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-3">
      {item.mcqs.map((mcq, qIdx) => {
        const options = [mcq.option_ka, mcq.option_kha, mcq.option_ga, mcq.option_gha];
        return (
          <div key={mcq.id} className="flex flex-col gap-1.5">
            <p className="text-[13px] font-medium" style={{ color: '#1E293B' }}>
              {qIdx + 1}. {mcq.question}
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {options.map((opt, oIdx) => {
                let bg = '#F8FAFC';
                let border = '#E2E8F0';
                let textColor = '#334155';

                if (revealed) {
                  if (oIdx === mcq.correct) {
                    bg = '#F0FDF4'; border = '#16A34A'; textColor = '#166534';
                  } else if (oIdx === answers[qIdx] && oIdx !== mcq.correct) {
                    bg = '#FEF2F2'; border = '#DC2626'; textColor = '#991B1B';
                  }
                } else if (answers[qIdx] === oIdx) {
                  bg = '#EFF6FF'; border = '#3B82F6'; textColor = '#1E40AF';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => {
                      if (revealed) return;
                      const newA = [...answers];
                      newA[qIdx] = oIdx;
                      setAnswers(newA);
                    }}
                    disabled={revealed}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-left transition-all"
                    style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
                  >
                    <span className="font-bold w-4">{labels[oIdx]}.</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {revealed && mcq.explanation && (
              <div className="px-3 py-2 rounded-lg text-[11px]" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                💡 {mcq.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!isCompleted && !revealed && (
        <button
          onClick={handleSubmit}
          disabled={loading || answers.includes(-1) || !session}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white suttro-transition active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
        >
          {loading ? 'যাচাই করা হচ্ছে...' : 'জমা দাও'}
        </button>
      )}

      {isCompleted && item.submission && (
        <div className="text-center py-2 text-[12px] font-semibold" style={{ color: '#16A34A' }}>
          ✅ {item.submission.mcq_score}/{item.submission.mcq_total} সঠিক
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Written Question (text + photo upload)
// ─────────────────────────────────────────────

function WrittenQuestionBody({
  item, session, onSubmit,
}: {
  item: LessonItem;
  session: { access_token: string } | null;
  onSubmit: () => void;
}) {
  const isCompleted = item.submission?.is_completed ?? false;
  const [textAnswer, setTextAnswer] = useState(item.submission?.text_answer || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [mode, setMode] = useState<'text' | 'photo'>('text');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async () => {
    if (!session || !textAnswer.trim()) return;
    setLoading(true);
    await fetch('/api/daily-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ item_id: item.id, type: 'text', text_answer: textAnswer }),
    });
    setLoading(false);
    onSubmit();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePhotoSubmit = async () => {
    if (!session || !selectedFile) return;
    setLoading(true);
    setUploadProgress('আপলোড হচ্ছে...');

    try {
      // Upload to Google Drive via API
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'submission');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();

      let photoUrl: string;
      let gdriveFileId: string | undefined;

      if (uploadData.success) {
        photoUrl = uploadData.url;
        gdriveFileId = uploadData.fileId;
        setUploadProgress('জমা দেওয়া হচ্ছে...');
      } else {
        // Fallback: store as data URL if Google Drive not configured
        photoUrl = photoPreview!;
      }

      // Submit to daily-lesson API
      await fetch('/api/daily-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          item_id: item.id,
          type: 'photo',
          photo_urls: [photoUrl],
          gdrive_file_ids: gdriveFileId ? [gdriveFileId] : undefined,
        }),
      });
    } catch {
      // Fallback: store as data URL
      await fetch('/api/daily-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ item_id: item.id, type: 'photo', photo_urls: [photoPreview] }),
      });
    }

    setLoading(false);
    setUploadProgress('');
    onSubmit();
  };

  if (isCompleted) {
    const marksGiven = item.submission?.marks_given;
    const isPending = marksGiven == null;
    return (
      <div className="flex flex-col gap-2">
        {item.submission?.text_answer && (
          <div className="p-2 rounded-lg text-[12px]" style={{ background: '#F8FAFC', color: '#334155' }}>
            <span className="font-semibold">তোমার উত্তর: </span>
            {item.submission.text_answer}
          </div>
        )}
        {item.submission?.photo_urls && item.submission.photo_urls.length > 0 && (
          <div className="text-[12px] font-medium" style={{ color: '#16A34A' }}>
            📷 ছবি জমা দেওয়া হয়েছে
          </div>
        )}
        <div className="text-center py-1 text-[12px] font-semibold"
          style={{ color: isPending ? '#F59E0B' : '#16A34A' }}>
          {isPending ? '⏳ মূল্যায়ন হচ্ছে...' : `✅ নম্বর: ${Math.round(Number(marksGiven))}/${item.marks}`}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {item.content_body && (
        <div className="text-[13px] p-2 rounded-lg leading-relaxed"
          style={{ background: '#F8FAFC', color: '#334155', whiteSpace: 'pre-wrap' }}>
          {item.content_body}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setMode('text')}
          className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: mode === 'text' ? '#EFF6FF' : '#F8FAFC',
            color: mode === 'text' ? '#1E40AF' : '#94A3B8',
            border: `1px solid ${mode === 'text' ? '#BFDBFE' : '#E2E8F0'}`,
          }}
        >
          ✏️ লিখে দাও
        </button>
        <button
          onClick={() => setMode('photo')}
          className="flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: mode === 'photo' ? '#FFF7ED' : '#F8FAFC',
            color: mode === 'photo' ? '#EA580C' : '#94A3B8',
            border: `1px solid ${mode === 'photo' ? '#FED7AA' : '#E2E8F0'}`,
          }}
        >
          📷 ছবি তুলে দাও
        </button>
      </div>

      {mode === 'text' ? (
        <>
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            rows={4}
            placeholder="তোমার উত্তর এখানে লেখো..."
            className="w-full px-3 py-2 rounded-lg text-[13px] resize-none outline-none"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#1E293B' }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={loading || !textAnswer.trim() || !session}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white suttro-transition active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
          >
            {loading ? 'জমা হচ্ছে...' : 'জমা দাও'}
          </button>
        </>
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="preview" className="w-full rounded-lg" style={{ maxHeight: 200, objectFit: 'cover' }} />
              <button
                onClick={() => { setPhotoPreview(null); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-[11px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-6 rounded-lg text-center suttro-transition active:scale-[0.98]"
              style={{ background: '#F8FAFC', border: '2px dashed #E2E8F0', color: '#94A3B8' }}
            >
              <div className="text-2xl mb-1">📷</div>
              <div className="text-[12px]">ছবি তুলো বা সিলেক্ট করো</div>
            </button>
          )}
          {photoPreview && (
            <button
              onClick={handlePhotoSubmit}
              disabled={loading || !session}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white suttro-transition active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #EA580C, #FB923C)' }}
            >
              {loading ? (uploadProgress || 'আপলোড হচ্ছে...') : '📤 ছবি জমা দাও'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
