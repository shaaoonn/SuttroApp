import type { Metadata } from 'next';
import { getExams, getCQCollections, getChapterNames } from '@/lib/data';
import ExamTabs from '@/components/exam/ExamTabs';

export const revalidate = 300; // ISR: 5 minutes

export const metadata: Metadata = {
  title: 'পরীক্ষা — MCQ ও সৃজনশীল — সূত্র | suttro.app',
  description: 'SSC MCQ মডেল টেস্ট ও বোর্ড সৃজনশীল প্রশ্ন। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান — টাইমার সহ পরীক্ষা দাও, অধ্যায় অনুযায়ী প্রশ্ন দেখো।',
};

export default async function ExamsPage() {
  const [exams, cqCollections, chapterNames] = await Promise.all([
    getExams(),
    getCQCollections(),
    getChapterNames(),
  ]);

  const totalCQs = cqCollections.reduce((sum, c) => sum + c.questions.length, 0);

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--suttro-deep)' }}>
            পরীক্ষা
          </h1>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            MCQ মডেল টেস্ট ও বোর্ড সৃজনশীল প্রশ্ন — অধ্যায় অনুযায়ী ফিল্টার করো।
          </p>
        </div>

        <ExamTabs exams={exams} totalCQs={totalCQs} cqCollections={cqCollections} chapterNames={chapterNames} />
      </div>
    </div>
  );
}
