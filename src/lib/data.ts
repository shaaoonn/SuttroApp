// ─────────────────────────────────────────────
// Data Access Layer - Supabase with static fallback
// All functions return the same shapes as the
// original static exports for frontend compatibility
// ─────────────────────────────────────────────

import { getSupabase } from './supabase-server';
import { SUBJECT_COLORS, SUBJECT_LABELS, SUBJECT_ICONS } from './constants';
import { simulations } from '@/simulations/registry';

// Re-export types from static files (they remain the canonical type source)
import type { ClassRecording } from '@/data/classes';
import type { ExamPaper, MCQQuestion, MCQOption } from '@/data/exams';
import type { CQCollection, CreativeQuestion, CQPart } from '@/data/cq';
import type { SubjectGuide, ChapterInfo, ChapterContent } from '@/data/guide';

export type { ClassRecording, ExamPaper, MCQQuestion, MCQOption };
export type { CQCollection, CreativeQuestion, CQPart };
export type { SubjectGuide, ChapterInfo, ChapterContent };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>;

// ── DB row → app interface transforms ──

function dbToClassRecording(row: DbRow): ClassRecording {
  return {
    slug: row.slug as string,
    title: row.title as string,
    subject: row.subject_id as string,
    chapter: row.chapter_num as number,
    classLevel: row.class_level as number,
    date: row.date_label as string,
    duration: row.duration as string,
    available: row.available as boolean,
    youtubeId: (row.youtube_id as string) || null,
  };
}

interface ClassDetail extends ClassRecording {
  hlsSrc: string | null;
  description: string;
  relatedSim: { slug: string; label: string } | null;
}

function dbToClassDetail(row: DbRow): ClassDetail {
  return {
    ...dbToClassRecording(row),
    hlsSrc: (row.hls_src as string) || null,
    description: (row.description as string) || '',
    relatedSim: row.related_sim_slug
      ? { slug: row.related_sim_slug as string, label: (row.related_sim_label as string) || '' }
      : null,
  };
}

function dbToMCQOption(ka: string, kha: string, ga: string, gha: string): [MCQOption, MCQOption, MCQOption, MCQOption] {
  return [
    { label: 'ক', text: ka },
    { label: 'খ', text: kha },
    { label: 'গ', text: ga },
    { label: 'ঘ', text: gha },
  ];
}

function dbToMCQQuestion(row: DbRow): MCQQuestion {
  return {
    id: row.question_order as number,
    question: row.question as string,
    options: dbToMCQOption(
      row.option_ka as string,
      row.option_kha as string,
      row.option_ga as string,
      row.option_gha as string,
    ),
    correct: row.correct as number,
    explanation: (row.explanation as string) || undefined,
    chapter: (row.chapter_num as number) || undefined,
  };
}

// ── Classes ──

export async function getClasses(): Promise<ClassRecording[]> {
  const sb = getSupabase();
  if (!sb) {
    const { CLASSES } = await import('@/data/classes');
    return CLASSES;
  }
  const { data, error } = await sb
    .from('class_recordings')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) {
    const { CLASSES } = await import('@/data/classes');
    return CLASSES;
  }
  return (data as DbRow[]).map(dbToClassRecording);
}

export async function getClassBySlug(slug: string): Promise<ClassDetail | null> {
  const sb = getSupabase();
  if (!sb) {
    // Fallback to static data - need to build ClassDetail from static
    const { CLASSES } = await import('@/data/classes');
    const cls = CLASSES.find((c) => c.slug === slug);
    if (!cls) return null;
    return { ...cls, hlsSrc: null, description: '', relatedSim: null };
  }
  const { data, error } = await sb
    .from('class_recordings')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return dbToClassDetail(data as DbRow);
}

// ── Exams ──

export type ExamSummary = Omit<ExamPaper, 'questions'> & { questionCount: number };

export async function getExams(): Promise<ExamSummary[]> {
  const sb = getSupabase();
  if (!sb) {
    const { EXAMS } = await import('@/data/exams');
    return EXAMS.map(({ questions, ...rest }) => ({ ...rest, questionCount: questions.length }));
  }
  const { data, error } = await sb
    .from('exam_papers')
    .select('*, mcq_questions(count)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) {
    const { EXAMS } = await import('@/data/exams');
    return EXAMS.map(({ questions, ...rest }) => ({ ...rest, questionCount: questions.length }));
  }
  return (data as DbRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    subject: row.subject_id,
    subjectBn: row.subject_bn,
    year: row.year,
    board: row.board || undefined,
    classLevel: row.class_level,
    duration: row.duration,
    totalMarks: row.total_marks,
    negativeMarking: row.negative_marking,
    questionCount: row.mcq_questions?.[0]?.count ?? 0,
  }));
}

export async function getExamById(id: string): Promise<ExamPaper | null> {
  const sb = getSupabase();
  if (!sb) {
    const { EXAMS } = await import('@/data/exams');
    return EXAMS.find((e) => e.id === id) || null;
  }

  // Fetch paper + questions in parallel
  const [paperRes, questionsRes] = await Promise.all([
    sb.from('exam_papers').select('*').eq('id', id).single(),
    sb.from('mcq_questions').select('*').eq('exam_paper_id', id).order('question_order'),
  ]);

  if (paperRes.error || !paperRes.data) return null;
  const paper = paperRes.data;
  const questions = (questionsRes.data || []).map(dbToMCQQuestion);

  return {
    id: paper.id,
    title: paper.title,
    subject: paper.subject_id,
    subjectBn: paper.subject_bn,
    year: paper.year,
    board: paper.board || undefined,
    classLevel: paper.class_level,
    duration: paper.duration,
    totalMarks: paper.total_marks,
    negativeMarking: paper.negative_marking,
    questions,
  };
}

export async function getExamsBySubject(subject: string): Promise<Omit<ExamPaper, 'questions'>[]> {
  const sb = getSupabase();
  if (!sb) {
    const { EXAMS } = await import('@/data/exams');
    return EXAMS.filter((e) => e.subject === subject).map(({ questions: _q, ...rest }) => rest);
  }
  const { data, error } = await sb
    .from('exam_papers')
    .select('*')
    .eq('subject_id', subject)
    .eq('is_published', true);
  if (error || !data) {
    const { EXAMS } = await import('@/data/exams');
    return EXAMS.filter((e) => e.subject === subject).map(({ questions: _q, ...rest }) => rest);
  }
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subject: row.subject_id,
    subjectBn: row.subject_bn,
    year: row.year,
    board: row.board || undefined,
    classLevel: row.class_level,
    duration: row.duration,
    totalMarks: row.total_marks,
    negativeMarking: row.negative_marking,
  }));
}

// ── Creative Questions ──

export async function getCQCollections(): Promise<CQCollection[]> {
  const sb = getSupabase();
  if (!sb) {
    const { CQ_COLLECTIONS } = await import('@/data/cq');
    return CQ_COLLECTIONS;
  }

  const { data: collections, error } = await sb
    .from('cq_collections')
    .select('*')
    .eq('is_published', true);
  if (error || !collections) {
    const { CQ_COLLECTIONS } = await import('@/data/cq');
    return CQ_COLLECTIONS;
  }

  const result: CQCollection[] = [];

  for (const col of collections) {
    const { data: cqs } = await sb
      .from('creative_questions')
      .select('*, cq_parts(*)')
      .eq('collection_id', col.id)
      .order('id');

    const questions: CreativeQuestion[] = (cqs || []).map((cq) => ({
      id: cq.id,
      chapter: cq.chapter_num,
      stem: cq.stem,
      source: cq.source || undefined,
      parts: ((cq.cq_parts as DbRow[]) || [])
        .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
        .map((p) => ({
          label: p.label as CQPart['label'],
          type: p.part_type as CQPart['type'],
          marks: p.marks as number,
          question: p.question as string,
          answer: p.answer as string,
        })),
    }));

    result.push({
      id: col.id,
      subject: col.subject_id,
      subjectBn: col.subject_bn,
      classLevel: col.class_level,
      questions,
    });
  }

  return result;
}

export async function getCQBySubject(subject: string): Promise<CQCollection | null> {
  const collections = await getCQCollections();
  return collections.find((c) => c.subject === subject) || null;
}

// ── Chapter Names ──

export async function getChapterNames(): Promise<Record<string, Record<number, string>>> {
  const sb = getSupabase();
  if (!sb) {
    const { CHAPTER_NAMES } = await import('@/data/classes');
    return CHAPTER_NAMES;
  }
  const { data, error } = await sb
    .from('chapters')
    .select('subject_id, chapter_num, name_bn')
    .order('chapter_num');
  if (error || !data) {
    const { CHAPTER_NAMES } = await import('@/data/classes');
    return CHAPTER_NAMES;
  }

  const result: Record<string, Record<number, string>> = {};
  for (const row of data) {
    if (!result[row.subject_id]) result[row.subject_id] = {};
    result[row.subject_id][row.chapter_num] = row.name_bn;
  }
  return result;
}

// ── Guide (content aggregation) ──

export async function getGuide(): Promise<SubjectGuide[]> {
  const [chapterNames, classes, cqCollections] = await Promise.all([
    getChapterNames(),
    getClasses(),
    getCQCollections(),
  ]);

  // For MCQ, we need question counts per chapter per subject
  // Fetch from DB or fallback
  const mcqCounts = await getMCQChapterCounts();

  const subjects = Object.keys(chapterNames);

  return subjects.map((subject) => {
    const chapterMap = chapterNames[subject];
    const chapterNums = Object.keys(chapterMap).map(Number).sort((a, b) => a - b);

    // Count classes per chapter
    const classCounts: Record<number, number> = {};
    classes.filter((c) => c.subject === subject).forEach((c) => {
      classCounts[c.chapter] = (classCounts[c.chapter] || 0) + 1;
    });

    // Count simulations per chapter (always from static registry)
    const simCounts: Record<number, number> = {};
    simulations
      .filter((s) => s.config.subject === subject)
      .forEach((s) => {
        const ch = s.config.nctb.chapter;
        simCounts[ch] = (simCounts[ch] || 0) + 1;
      });

    // MCQ counts
    const subjectMcqCounts = mcqCounts[subject] || {};

    // CQ counts
    const cqCountMap: Record<number, number> = {};
    const cqCol = cqCollections.find((c) => c.subject === subject);
    if (cqCol) {
      cqCol.questions.forEach((q) => {
        cqCountMap[q.chapter] = (cqCountMap[q.chapter] || 0) + 1;
      });
    }

    const chapters: ChapterInfo[] = chapterNums.map((ch) => {
      const content: ChapterContent = {
        classes: classCounts[ch] || 0,
        simulations: simCounts[ch] || 0,
        mcq: subjectMcqCounts[ch] || 0,
        cq: cqCountMap[ch] || 0,
      };
      return {
        chapter: ch,
        name: chapterMap[ch],
        content,
        total: content.classes + content.simulations + content.mcq + content.cq,
      };
    });

    const totals: ChapterContent = {
      classes: chapters.reduce((s, c) => s + c.content.classes, 0),
      simulations: chapters.reduce((s, c) => s + c.content.simulations, 0),
      mcq: chapters.reduce((s, c) => s + c.content.mcq, 0),
      cq: chapters.reduce((s, c) => s + c.content.cq, 0),
    };

    return {
      subject,
      subjectBn: SUBJECT_LABELS[subject] || subject,
      color: SUBJECT_COLORS[subject] || '#0D9488',
      icon: SUBJECT_ICONS[subject] || '📚',
      chapters,
      totals,
    };
  });
}

export async function getSubjectGuide(subject: string): Promise<SubjectGuide | undefined> {
  const guide = await getGuide();
  return guide.find((g) => g.subject === subject);
}

export async function getChapterInfo(subject: string, chapter: number): Promise<ChapterInfo | undefined> {
  const guide = await getSubjectGuide(subject);
  return guide?.chapters.find((c) => c.chapter === chapter);
}

// ── Chapter content fetchers ──

export async function getChapterClasses(subject: string, chapter: number): Promise<ClassRecording[]> {
  const classes = await getClasses();
  return classes.filter((c) => c.subject === subject && c.chapter === chapter);
}

export async function getChapterSimulations(subject: string, chapter: number) {
  return simulations.filter(
    (s) => s.config.subject === subject && s.config.nctb.chapter === chapter
  );
}

export async function getChapterMCQs(subject: string, chapter: number) {
  const sb = getSupabase();
  if (!sb) {
    const { EXAMS } = await import('@/data/exams');
    const questions: { question: MCQQuestion; examTitle: string; examId: string }[] = [];
    EXAMS.filter((e) => e.subject === subject).forEach((e) => {
      e.questions.forEach((q) => {
        if (q.chapter === chapter) {
          questions.push({ question: q, examTitle: e.title, examId: e.id });
        }
      });
    });
    return questions;
  }

  // Query questions joined with exam metadata
  const { data, error } = await sb
    .from('mcq_questions')
    .select('*, exam_papers!inner(id, title, subject_id)')
    .eq('exam_papers.subject_id', subject)
    .eq('chapter_num', chapter)
    .order('question_order');

  if (error || !data) {
    const { EXAMS } = await import('@/data/exams');
    const questions: { question: MCQQuestion; examTitle: string; examId: string }[] = [];
    EXAMS.filter((e) => e.subject === subject).forEach((e) => {
      e.questions.forEach((q) => {
        if (q.chapter === chapter) {
          questions.push({ question: q, examTitle: e.title, examId: e.id });
        }
      });
    });
    return questions;
  }

  return data.map((row) => ({
    question: dbToMCQQuestion(row),
    examTitle: (row.exam_papers as DbRow).title as string,
    examId: (row.exam_papers as DbRow).id as string,
  }));
}

export async function getChapterCQs(subject: string, chapter: number): Promise<CreativeQuestion[]> {
  const collection = await getCQBySubject(subject);
  if (!collection) return [];
  return collection.questions.filter((q) => q.chapter === chapter);
}

// ── Internal helpers ──

async function getMCQChapterCounts(): Promise<Record<string, Record<number, number>>> {
  const sb = getSupabase();
  if (!sb) {
    const { EXAMS } = await import('@/data/exams');
    const result: Record<string, Record<number, number>> = {};
    EXAMS.forEach((e) => {
      if (!result[e.subject]) result[e.subject] = {};
      e.questions.forEach((q) => {
        if (q.chapter) {
          result[e.subject][q.chapter] = (result[e.subject][q.chapter] || 0) + 1;
        }
      });
    });
    return result;
  }

  const { data, error } = await sb
    .from('mcq_questions')
    .select('chapter_num, exam_papers!inner(subject_id)')
    .not('chapter_num', 'is', null);

  if (error || !data) {
    const { EXAMS } = await import('@/data/exams');
    const result: Record<string, Record<number, number>> = {};
    EXAMS.forEach((e) => {
      if (!result[e.subject]) result[e.subject] = {};
      e.questions.forEach((q) => {
        if (q.chapter) {
          result[e.subject][q.chapter] = (result[e.subject][q.chapter] || 0) + 1;
        }
      });
    });
    return result;
  }

  const result: Record<string, Record<number, number>> = {};
  data.forEach((row) => {
    const subject = (row.exam_papers as DbRow).subject_id as string;
    const ch = row.chapter_num as number;
    if (!result[subject]) result[subject] = {};
    result[subject][ch] = (result[subject][ch] || 0) + 1;
  });
  return result;
}
