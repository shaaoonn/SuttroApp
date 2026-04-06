import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getSubjectGuide,
  getChapterInfo,
  getChapterClasses,
  getChapterSimulations,
  getChapterMCQs,
  getChapterCQs,
} from '@/lib/data';
import ChapterContentView from '@/components/guide/ChapterContentView';

export const revalidate = 300;

// ── Types ──

interface PageProps {
  params: Promise<{ subject: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { subject, chapter } = await params;
  const guide = await getSubjectGuide(subject);
  const chInfo = await getChapterInfo(subject, Number(chapter));
  if (!guide || !chInfo) return { title: 'পাওয়া যায়নি — সূত্র' };
  return {
    title: `${chInfo.name} — ${guide.subjectBn} — সূত্র | suttro.app`,
    description: `${guide.subjectBn} অধ্যায় ${chapter}: ${chInfo.name} — সিমুলেশন, ক্লাস, MCQ, সৃজনশীল।`,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { subject, chapter: chStr } = await params;
  const chNum = Number(chStr);
  const [guide, chInfo, classes, sims, mcqs, cqs] = await Promise.all([
    getSubjectGuide(subject),
    getChapterInfo(subject, chNum),
    getChapterClasses(subject, chNum),
    getChapterSimulations(subject, chNum),
    getChapterMCQs(subject, chNum),
    getChapterCQs(subject, chNum),
  ]);
  if (!guide || !chInfo) notFound();

  // Serialize sim data (strip component loader)
  const simData = sims.map((s) => ({
    slug: s.slug,
    title: s.config.title,
    nctb: s.config.nctb,
    formulas: s.config.formulas,
  }));

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-base mb-6" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/guide" className="hover:underline">গাইড</Link>
          <span>&rsaquo;</span>
          <Link href={`/guide/${subject}`} className="hover:underline" style={{ color: guide.color }}>
            {guide.icon} {guide.subjectBn}
          </Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--suttro-text)' }}>অধ্যায় {chNum}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white"
              style={{ background: guide.color }}
            >
              {chNum}
            </span>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--suttro-deep)' }}>
              {chInfo.name}
            </h1>
          </div>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            {guide.subjectBn} — অধ্যায় {chNum}
          </p>
        </div>

        {/* Content view (client component) */}
        <ChapterContentView
          subject={subject}
          subjectBn={guide.subjectBn}
          color={guide.color}
          chapter={chNum}
          chapterName={chInfo.name}
          classes={classes}
          simulations={simData}
          mcqs={mcqs}
          cqs={cqs}
        />
      </div>
    </div>
  );
}
