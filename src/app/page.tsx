import MobileHome from '@/components/home/MobileHome';
import DesktopHome from '@/components/home/DesktopHome';
import { getClasses, getExams } from '@/lib/data';
import { getSiteContent, type ContentMap } from '@/lib/site-content';

export const revalidate = 300;

// ─────────────────────────────────────────────
// Homepage — সূত্র | suttro.app
// Mobile: App-style home (MobileHome)
// Desktop: Dashboard with subjects, classes,
//          exams, daily study (DesktopHome)
// ─────────────────────────────────────────────

export default async function Home() {
  const [CLASSES, EXAMS, homeContent, quicklinksContent, subjectsContent] = await Promise.all([
    getClasses(),
    getExams(),
    getSiteContent('home'),
    getSiteContent('quicklinks'),
    getSiteContent('subjects'),
  ]);

  // Latest class for the mobile "new class" card
  const latestClass = CLASSES[0]
    ? { title: CLASSES[0].title, slug: CLASSES[0].slug, duration: CLASSES[0].duration }
    : null;

  // Serializable class/exam data for the DesktopHome client component
  const classesForDesktop = CLASSES.slice(0, 6).map((cls) => ({
    slug: cls.slug,
    title: cls.title,
    subject: cls.subject,
    chapter: cls.chapter,
    duration: cls.duration,
    youtubeId: cls.youtubeId || null,
  }));
  const examsForDesktop = EXAMS.slice(0, 6).map((exam) => ({
    id: exam.id,
    title: exam.title,
    subject: exam.subject,
    subjectBn: exam.subjectBn,
    questionCount: exam.questionCount,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
  }));

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════
          Mobile: App-style home
          ═══════════════════════════════════════ */}
      <div className="lg:hidden">
        <MobileHome latestClass={latestClass} content={homeContent} quicklinks={quicklinksContent} subjects={subjectsContent} />
      </div>

      {/* ═══════════════════════════════════════
          Desktop logged-in: Dashboard
          ═══════════════════════════════════════ */}
      <div className="hidden lg:block">
        <DesktopHome classes={classesForDesktop} exams={examsForDesktop} content={homeContent} quicklinks={quicklinksContent} subjects={subjectsContent} />
      </div>
    </div>
  );
}
