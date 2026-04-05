import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getExam, EXAMS } from '@/data/exams';
import ExamPlayer from '@/components/exam/ExamPlayer';

// ─────────────────────────────────────────────
// Exam Player Page — Dynamic [id]
// ─────────────────────────────────────────────

interface ExamPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return EXAMS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: ExamPageProps) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) return { title: 'পরীক্ষা পাওয়া যায়নি — সূত্র' };

  return {
    title: `${exam.title} — সূত্র | suttro.app`,
    description: `${exam.subjectBn} MCQ পরীক্ষা। ${exam.questions.length}টি প্রশ্ন, ${exam.duration} মিনিট।`,
  };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-base mb-4" style={{ color: 'var(--suttro-muted)' }}>
          <Link href="/exams" className="hover:underline">পরীক্ষা</Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--suttro-text)' }}>{exam.title}</span>
        </nav>

        {/* Exam Player */}
        <ExamPlayer exam={exam} />
      </div>
    </div>
  );
}
