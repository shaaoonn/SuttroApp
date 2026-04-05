import type { Metadata } from 'next';
import { EXAMS } from '@/data/exams';
import ExamFilter from '@/components/exam/ExamFilter';

export const metadata: Metadata = {
  title: 'MCQ পরীক্ষা — সূত্র | suttro.app',
  description: 'SSC MCQ মডেল টেস্ট। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান — টাইমার সহ পরীক্ষা দাও, তাৎক্ষণিক ফলাফল দেখো।',
};

export default function ExamsPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            MCQ পরীক্ষা
          </h1>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            SSC মডেল টেস্ট — টাইমার সহ পরীক্ষা দাও, তাৎক্ষণিক ফলাফল ও ব্যাখ্যা দেখো।
          </p>
        </div>

        <ExamFilter exams={EXAMS} />

        {/* Info */}
        <div
          className="mt-12 rounded-[14px] border p-8 text-center"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <p className="text-base font-medium mb-1" style={{ color: 'var(--suttro-deep)' }}>
            {EXAMS.length}টি পরীক্ষা প্রস্তুত — আরও আসছে!
          </p>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            প্রতিটি পরীক্ষায় SSC-স্টাইল MCQ, টাইমার, নেগেটিভ মার্কিং ও বিস্তারিত ব্যাখ্যা আছে।
          </p>
        </div>
      </div>
    </div>
  );
}
