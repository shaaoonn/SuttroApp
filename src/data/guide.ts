// ─────────────────────────────────────────────
// Unified Chapter Guide — সূত্র | suttro.app
// Aggregates all content by subject + chapter
// ─────────────────────────────────────────────

import { CLASSES, CHAPTER_NAMES, SUBJECT_LABELS, SUBJECT_COLORS, SUBJECT_ICONS } from './classes';
import { EXAMS } from './exams';
import { CQ_COLLECTIONS } from './cq';
import { simulations } from '@/simulations/registry';

// ── Types ──

export interface ChapterContent {
  classes: number;
  simulations: number;
  mcq: number;       // individual questions in this chapter
  cq: number;
}

export interface ChapterInfo {
  chapter: number;
  name: string;
  content: ChapterContent;
  total: number;
}

export interface SubjectGuide {
  subject: string;
  subjectBn: string;
  color: string;
  icon: string;
  chapters: ChapterInfo[];
  totals: ChapterContent;
}

// ── Build guide data ──

function buildGuide(): SubjectGuide[] {
  const subjects = Object.keys(CHAPTER_NAMES);

  return subjects.map((subject) => {
    const chapterMap = CHAPTER_NAMES[subject];
    const chapterNums = Object.keys(chapterMap).map(Number).sort((a, b) => a - b);

    // Count classes per chapter
    const classCounts: Record<number, number> = {};
    CLASSES.filter((c) => c.subject === subject).forEach((c) => {
      classCounts[c.chapter] = (classCounts[c.chapter] || 0) + 1;
    });

    // Count simulations per chapter
    const simCounts: Record<number, number> = {};
    simulations
      .filter((s) => s.config.subject === subject)
      .forEach((s) => {
        const ch = s.config.nctb.chapter;
        simCounts[ch] = (simCounts[ch] || 0) + 1;
      });

    // Count MCQ questions per chapter (across all exams)
    const mcqCounts: Record<number, number> = {};
    EXAMS.filter((e) => e.subject === subject).forEach((e) => {
      e.questions.forEach((q) => {
        if (q.chapter) {
          mcqCounts[q.chapter] = (mcqCounts[q.chapter] || 0) + 1;
        }
      });
    });

    // Count CQ per chapter
    const cqCounts: Record<number, number> = {};
    const cqCollection = CQ_COLLECTIONS.find((c) => c.subject === subject);
    if (cqCollection) {
      cqCollection.questions.forEach((q) => {
        cqCounts[q.chapter] = (cqCounts[q.chapter] || 0) + 1;
      });
    }

    // Build chapter info
    const chapters: ChapterInfo[] = chapterNums.map((ch) => {
      const content: ChapterContent = {
        classes: classCounts[ch] || 0,
        simulations: simCounts[ch] || 0,
        mcq: mcqCounts[ch] || 0,
        cq: cqCounts[ch] || 0,
      };
      return {
        chapter: ch,
        name: chapterMap[ch],
        content,
        total: content.classes + content.simulations + content.mcq + content.cq,
      };
    });

    // Totals
    const totals: ChapterContent = {
      classes: chapters.reduce((s, c) => s + c.content.classes, 0),
      simulations: chapters.reduce((s, c) => s + c.content.simulations, 0),
      mcq: chapters.reduce((s, c) => s + c.content.mcq, 0),
      cq: chapters.reduce((s, c) => s + c.content.cq, 0),
    };

    return {
      subject,
      subjectBn: SUBJECT_LABELS[subject] || subject,
      color: SUBJECT_COLORS[subject] || '#1B6B4A',
      icon: SUBJECT_ICONS[subject] || '📚',
      chapters,
      totals,
    };
  });
}

export const GUIDE: SubjectGuide[] = buildGuide();

// ── Helpers ──

export function getSubjectGuide(subject: string): SubjectGuide | undefined {
  return GUIDE.find((g) => g.subject === subject);
}

export function getChapterInfo(subject: string, chapter: number): ChapterInfo | undefined {
  const guide = getSubjectGuide(subject);
  return guide?.chapters.find((c) => c.chapter === chapter);
}

// ── Get actual content for a chapter ──

export function getChapterClasses(subject: string, chapter: number) {
  return CLASSES.filter((c) => c.subject === subject && c.chapter === chapter);
}

export function getChapterSimulations(subject: string, chapter: number) {
  return simulations.filter(
    (s) => s.config.subject === subject && s.config.nctb.chapter === chapter
  );
}

export function getChapterMCQs(subject: string, chapter: number) {
  const questions: { question: (typeof EXAMS)[0]['questions'][0]; examTitle: string; examId: string }[] = [];
  EXAMS.filter((e) => e.subject === subject).forEach((e) => {
    e.questions.forEach((q) => {
      if (q.chapter === chapter) {
        questions.push({ question: q, examTitle: e.title, examId: e.id });
      }
    });
  });
  return questions;
}

export function getChapterCQs(subject: string, chapter: number) {
  const collection = CQ_COLLECTIONS.find((c) => c.subject === subject);
  if (!collection) return [];
  return collection.questions.filter((q) => q.chapter === chapter);
}

// Re-export for convenience
export { SUBJECT_LABELS, SUBJECT_COLORS, SUBJECT_ICONS, CHAPTER_NAMES };
