import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getExamById } from '@/lib/data';
import ExamPlayer from '@/components/exam/ExamPlayer';

// ─────────────────────────────────────────────
// Exam Player Page — Dynamic [id]
// ─────────────────────────────────────────────

export const revalidate = 300;

interface ExamPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExamPageProps) {
  const { id } = await params;
  const exam = await getExamById(id);
  if (!exam) return { title: 'পরীক্ষা পাওয়া যায়নি — সূত্র' };

  return {
    title: `${exam.title} — সূত্র | suttro.app`,
    description: `${exam.subjectBn} MCQ পরীক্ষা। ${exam.questions.length}টি প্রশ্ন, ${exam.duration} মিনিট।`,
  };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { id } = await params;
  const exam = await getExamById(id);
  if (!exam) notFound();

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* Mobile: no padding, full-width player */}
      <div className="lg:hidden">
        <ExamPlayer exam={exam} />
      </div>

      {/* Desktop: padded container */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <nav className="flex items-center gap-2 text-base mb-4" style={{ color: '#94A3B8' }}>
            <Link href="/exams" className="hover:underline">পরীক্ষা</Link>
            <span>&rsaquo;</span>
            <span style={{ color: '#134E4A' }}>{exam.title}</span>
          </nav>
          <ExamPlayer exam={exam} />
        </div>
      </div>
    </div>
  );
}
