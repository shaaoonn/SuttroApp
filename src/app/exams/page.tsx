import type { Metadata } from 'next';
import { getExams, getCQCollections, getChapterNames } from '@/lib/data';
import { getSiteContent } from '@/lib/site-content';
import ExamTabs from '@/components/exam/ExamTabs';

// ─────────────────────────────────────────────
// Exams — MCQ & সৃজনশীল listing
// Design: compact mobile cards
// ─────────────────────────────────────────────

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'পরীক্ষা — MCQ ও সৃজনশীল — সূত্র | suttro.app',
  description: 'SSC MCQ মডেল টেস্ট ও বোর্ড সৃজনশীল প্রশ্ন। পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান — টাইমার সহ পরীক্ষা দাও, অধ্যায় অনুযায়ী প্রশ্ন দেখো।',
};

export default async function ExamsPage() {
  const [exams, cqCollections, chapterNames, cms] = await Promise.all([
    getExams(),
    getCQCollections(),
    getChapterNames(),
    getSiteContent('exams'),
  ]);

  const totalCQs = cqCollections.reduce((sum, c) => sum + c.questions.length, 0);

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="px-4 py-4">
          <ExamTabs exams={exams} totalCQs={totalCQs} cqCollections={cqCollections} chapterNames={chapterNames} />
        </div>
      </div>

      {/* Desktop layout (preserved) */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3" style={{ color: '#134E4A' }}>
              {cms.page_title || 'পরীক্ষা'}
            </h1>
            <p className="text-base" style={{ color: '#94A3B8' }}>
              {cms.page_subtitle || 'MCQ মডেল টেস্ট ও বোর্ড সৃজনশীল প্রশ্ন'} — অধ্যায় অনুযায়ী ফিল্টার করো।
            </p>
          </div>
          <ExamTabs exams={exams} totalCQs={totalCQs} cqCollections={cqCollections} chapterNames={chapterNames} />
        </div>
      </div>
    </div>
  );
}
