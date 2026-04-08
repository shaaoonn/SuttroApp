#!/usr/bin/env node

// ============================================
// Seed Supabase database from static TS data
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-database.mjs
// Pre-step: npx esbuild src/data/exams.ts src/data/cq.ts src/data/classes.ts --bundle --format=esm --outdir=scripts/.compiled
// ============================================

import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Supabase client (service role — bypasses RLS) ──

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Import compiled data files (pre-compiled by esbuild) ──

const { EXAMS } = await import('./.compiled/exams.mjs');
const { CQ_COLLECTIONS } = await import('./.compiled/cq.mjs');
const { CLASSES } = await import('./.compiled/classes.mjs');

// ── Subject & Chapter reference data ──

const SUBJECTS = [
  { id: 'physics', name_bn: 'পদার্থবিজ্ঞান', icon: '⚡', color: '#2563EB', sort_order: 1 },
  { id: 'chemistry', name_bn: 'রসায়ন', icon: '🧪', color: '#7C3AED', sort_order: 2 },
  { id: 'biology', name_bn: 'জীববিজ্ঞান', icon: '🧬', color: '#059669', sort_order: 3 },
  { id: 'math', name_bn: 'সাধারণ গণিত', icon: '📐', color: '#DC2626', sort_order: 4 },
  { id: 'higher-math', name_bn: 'উচ্চতর গণিত', icon: '📊', color: '#EA580C', sort_order: 5 },
  { id: 'english', name_bn: 'ইংরেজি', icon: '📝', color: '#0891B2', sort_order: 6 },
];

const CHAPTER_NAMES = {
  physics: {
    1: 'ভৌত রাশি ও পরিমাপ', 2: 'গতি', 3: 'বল', 4: 'কাজ, ক্ষমতা ও শক্তি',
    5: 'পদার্থের অবস্থা ও চাপ', 6: 'বস্তুর উপর তাপের প্রভাব', 7: 'তরঙ্গ ও শব্দ',
    8: 'আলোর প্রতিফলন', 9: 'আলোর প্রতিসরণ', 10: 'স্থির তড়িৎ',
    11: 'চল তড়িৎ', 12: 'তড়িতের চৌম্বক ক্রিয়া', 13: 'আধুনিক পদার্থবিজ্ঞান',
  },
  chemistry: {
    1: 'রসায়নের ধারণা', 2: 'পদার্থের অবস্থা', 3: 'পদার্থের গঠন', 4: 'পর্যায় সারণি',
    5: 'রাসায়নিক বন্ধন', 6: 'মোলের ধারণা', 7: 'রাসায়নিক বিক্রিয়া',
    8: 'রসায়ন ও শক্তি', 9: 'এসিড-ক্ষারক সমতা', 10: 'খনিজ সম্পদ', 11: 'জীবনযাত্রায় রসায়ন',
  },
  biology: {
    1: 'জীবন পাঠ', 2: 'জীবকোষ ও টিস্যু', 3: 'কোষ বিভাজন', 4: 'জীবনীশক্তি',
    5: 'খাদ্য, পুষ্টি ও পরিপাক', 6: 'জীবে পরিবহন', 7: 'গ্যাসীয় বিনিময়',
    8: 'রেচন প্রক্রিয়া', 9: 'দৃঢ়তা প্রদান ও চলন', 10: 'সমন্বয়',
    11: 'জীবের প্রজনন', 12: 'জীবের বংশগতি ও বিবর্তন', 13: 'জীবের পরিবেশ',
  },
  math: {
    1: 'প্যাটার্ন, সেট ও সম্পর্ক', 2: 'মুনাফা', 3: 'পরিমাপ', 4: 'বীজগণিতীয় রাশি',
    5: 'সমীকরণ', 6: 'জ্যামিতির মৌলিক ধারণা', 7: 'ত্রিভুজ', 8: 'বৃত্ত',
    9: 'পিথাগোরাসের উপপাদ্য', 10: 'ত্রিকোণমিতি', 11: 'পরিসংখ্যান ও সম্ভাবনা',
  },
  'higher-math': {
    1: 'সেট ও ফাংশন', 2: 'বীজগণিতীয় রাশি', 3: 'সরলরেখা', 4: 'সমীকরণ',
    5: 'অসমতা', 6: 'সূচক ও লগারিদম', 7: 'অনুক্রম ও ধারা', 8: 'ত্রিকোণমিতি',
    9: 'পরিমিতি', 10: 'স্থানাঙ্ক জ্যামিতি', 11: 'সম্ভাবনা',
  },
  english: {
    1: 'Sentence Structure', 2: 'Tense', 3: 'Right Form of Verbs', 4: 'Narration',
    5: 'Voice Change', 6: 'Transformation', 7: 'Preposition', 8: 'Articles',
    9: 'Punctuation', 10: 'Composition',
  },
};

// ── Class detail data (extra fields not in CLASSES) ──

const CLASS_DETAILS = {
  '2026-04-02-ohms-law': {
    description: 'ওহমের সূত্র কী, কিভাবে কাজ করে, V=IR সূত্র থেকে গণনা, এবং সিমুলেশন দিয়ে হাতে-কলমে অনুশীলন।',
    relatedSim: { slug: 'ohms-law', label: 'ওহমের সূত্র সিমুলেশন' },
  },
  '2026-04-03-light-reflection': {
    description: 'আলোর প্রতিফলনের সূত্র, সমতল দর্পণে প্রতিবিম্ব গঠন, এবং প্রতিফলনের নিয়মাবলী।',
    relatedSim: { slug: 'light-reflection', label: 'আলোর প্রতিফলন সিমুলেশন' },
  },
  '2026-04-06-light-refraction': {
    description: 'আলোর প্রতিসরণ, স্নেলের সূত্র, প্রতিসরণাঙ্ক, এবং আলোর গতিপথ পরিবর্তনের কারণ।',
    relatedSim: { slug: 'light-refraction', label: 'আলোর প্রতিসরণ সিমুলেশন' },
  },
  '2026-04-04-acid-base': {
    description: 'অ্যাসিড ও ক্ষারের ধর্ম, pH স্কেল, প্রশমন বিক্রিয়া, এবং দৈনন্দিন জীবনে অ্যাসিড-ক্ষারের ব্যবহার।',
    relatedSim: { slug: 'acid-base', label: 'অ্যাসিড-ক্ষার সিমুলেশন' },
  },
  '2026-04-07-atomic-structure': {
    description: 'পরমাণুর গঠন, বোর মডেল, শক্তিস্তর, ইলেকট্রন বিন্যাস, এবং পারমাণবিক সংখ্যা।',
    relatedSim: { slug: 'atomic-structure', label: 'পরমাণু সিমুলেশন' },
  },
  '2026-04-05-cell-division': {
    description: 'কোষ বিভাজনের ধাপসমূহ, মাইটোসিস ও মিয়োসিসের পার্থক্য, এবং কোষচক্র।',
    relatedSim: { slug: 'cell-division', label: 'কোষ বিভাজন সিমুলেশন' },
  },
  '2026-04-08-photosynthesis': {
    description: 'সালোকসংশ্লেষণ প্রক্রিয়া, আলোক ও অন্ধকার পর্যায়, ক্লোরোফিলের ভূমিকা।',
    relatedSim: { slug: 'photosynthesis', label: 'সালোকসংশ্লেষণ সিমুলেশন' },
  },
  '2026-04-09-pythagorean': {
    description: 'পিথাগোরাসের উপপাদ্য, প্রমাণ, এবং বাস্তব জীবনে প্রয়োগ।',
    relatedSim: { slug: 'pythagorean', label: 'পিথাগোরাস সিমুলেশন' },
  },
  '2026-04-10-circle-geometry': {
    description: 'বৃত্তের ক্ষেত্রফল, পরিধি, জ্যা, স্পর্শক, এবং বৃত্ত সংক্রান্ত উপপাদ্য।',
    relatedSim: { slug: 'circle-geometry', label: 'বৃত্ত সিমুলেশন' },
  },
  '2026-04-11-trigonometry': {
    description: 'ত্রিকোণমিতিক অনুপাত sin, cos, tan — সংজ্ঞা, মান, এবং প্রয়োগ।',
    relatedSim: { slug: 'trigonometry', label: 'ত্রিকোণমিতি সিমুলেশন' },
  },
  '2026-04-12-straight-line': {
    description: 'সরলরেখার সমীকরণ y = mx + c, ঢাল, এবং স্থানাঙ্ক জ্যামিতিতে প্রয়োগ।',
    relatedSim: { slug: 'straight-line', label: 'সরলরেখা সিমুলেশন' },
  },
  '2026-04-13-tense': {
    description: 'ইংরেজি Tense — Present, Past, Future — ১২টি কাল সম্পূর্ণ আলোচনা ও উদাহরণ।',
    relatedSim: { slug: 'tense-timeline', label: 'Tense Timeline সিমুলেশন' },
  },
  '2026-04-14-sentence-structure': {
    description: 'Sentence Structure — Subject, Verb, Object বিশ্লেষণ এবং বাক্য গঠনের নিয়ম।',
    relatedSim: { slug: 'sentence-structure', label: 'Sentence Structure সিমুলেশন' },
  },
};

// ── Main seed function ──

async function seed() {
  console.log('Seeding Suttro database...\n');

  // 1. Seed subjects
  console.log('Inserting subjects...');
  const { error: subErr } = await supabase
    .from('subjects')
    .upsert(SUBJECTS, { onConflict: 'id' });
  if (subErr) throw new Error(`subjects: ${subErr.message}`);
  console.log(`   OK ${SUBJECTS.length} subjects`);

  // 2. Seed chapters
  console.log('Inserting chapters...');
  const chapterRows = [];
  for (const [subjectId, chapters] of Object.entries(CHAPTER_NAMES)) {
    for (const [num, name] of Object.entries(chapters)) {
      chapterRows.push({
        subject_id: subjectId,
        chapter_num: Number(num),
        name_bn: name,
      });
    }
  }
  await supabase.from('chapters').delete().neq('id', 0);
  const { error: chErr } = await supabase.from('chapters').insert(chapterRows);
  if (chErr) throw new Error(`chapters: ${chErr.message}`);
  console.log(`   OK ${chapterRows.length} chapters`);

  // 3. Seed classes
  console.log('Inserting classes...');
  const classRows = CLASSES.map(cls => {
    const detail = CLASS_DETAILS[cls.slug] || {};
    return {
      slug: cls.slug,
      title: cls.title,
      subject_id: cls.subject,
      chapter_num: cls.chapter,
      class_level: cls.classLevel,
      date_label: cls.date,
      duration: cls.duration,
      available: cls.available,
      youtube_id: cls.youtubeId || null,
      hls_src: null,
      description: detail.description || '',
      related_sim_slug: detail.relatedSim?.slug || null,
      related_sim_label: detail.relatedSim?.label || null,
    };
  });

  for (const row of classRows) {
    const { error } = await supabase
      .from('class_recordings')
      .upsert(row, { onConflict: 'slug' });
    if (error) throw new Error(`class ${row.slug}: ${error.message}`);
  }
  console.log(`   OK ${classRows.length} classes`);

  // 4. Seed exams + MCQ questions
  console.log('Inserting exams & MCQ questions...');
  console.log(`   Found ${EXAMS.length} exams in compiled data`);
  let totalQuestions = 0;

  for (const exam of EXAMS) {
    // Insert exam paper
    const { error: examErr } = await supabase
      .from('exam_papers')
      .upsert({
        id: exam.id,
        title: exam.title,
        subject_id: exam.subject,
        subject_bn: exam.subjectBn,
        year: exam.year,
        board: exam.board || null,
        class_level: exam.classLevel,
        duration: exam.duration,
        total_marks: exam.totalMarks,
        negative_marking: exam.negativeMarking,
      }, { onConflict: 'id' });
    if (examErr) throw new Error(`exam ${exam.id}: ${examErr.message}`);

    // Delete existing questions for this exam (clean re-seed)
    await supabase.from('mcq_questions').delete().eq('exam_paper_id', exam.id);

    // Insert questions in batches of 50
    const questionRows = exam.questions.map((q, i) => ({
      exam_paper_id: exam.id,
      question_order: q.id || (i + 1),
      question: q.question,
      option_ka: q.options[0].text,
      option_kha: q.options[1].text,
      option_ga: q.options[2].text,
      option_gha: q.options[3].text,
      correct: q.correct,
      explanation: q.explanation || null,
      chapter_num: q.chapter || null,
    }));

    for (let i = 0; i < questionRows.length; i += 50) {
      const batch = questionRows.slice(i, i + 50);
      const { error: qErr } = await supabase.from('mcq_questions').insert(batch);
      if (qErr) throw new Error(`questions for ${exam.id} batch ${i}: ${qErr.message}`);
    }
    totalQuestions += questionRows.length;
  }
  console.log(`   OK ${EXAMS.length} exams, ${totalQuestions} questions`);

  // 5. Seed CQ collections + creative questions + parts
  console.log('Inserting CQ collections...');
  let totalCQs = 0;
  let totalParts = 0;

  for (const col of CQ_COLLECTIONS) {
    // Insert collection
    const { error: colErr } = await supabase
      .from('cq_collections')
      .upsert({
        id: col.id,
        subject_id: col.subject,
        subject_bn: col.subjectBn,
        class_level: col.classLevel,
      }, { onConflict: 'id' });
    if (colErr) throw new Error(`cq collection ${col.id}: ${colErr.message}`);

    // Delete existing questions for this collection
    const { data: existingCQs } = await supabase
      .from('creative_questions')
      .select('id')
      .eq('collection_id', col.id);
    if (existingCQs?.length) {
      const cqIds = existingCQs.map(q => q.id);
      await supabase.from('cq_parts').delete().in('cq_id', cqIds);
      await supabase.from('creative_questions').delete().eq('collection_id', col.id);
    }

    // Insert questions and parts
    for (const q of col.questions) {
      const { data: inserted, error: qErr } = await supabase
        .from('creative_questions')
        .insert({
          collection_id: col.id,
          chapter_num: q.chapter,
          stem: q.stem,
          source: q.source || null,
        })
        .select('id')
        .single();
      if (qErr) throw new Error(`CQ insert: ${qErr.message}`);

      const partRows = q.parts.map((p, i) => ({
        cq_id: inserted.id,
        label: p.label,
        part_type: p.type,
        marks: p.marks,
        question: p.question,
        answer: p.answer,
        sort_order: i,
      }));

      if (partRows.length > 0) {
        const { error: pErr } = await supabase.from('cq_parts').insert(partRows);
        if (pErr) throw new Error(`CQ parts: ${pErr.message}`);
        totalParts += partRows.length;
      }
      totalCQs++;
    }
  }
  console.log(`   OK ${CQ_COLLECTIONS.length} collections, ${totalCQs} questions, ${totalParts} parts`);

  console.log('\nSeed complete!');
}

// ── Run ──

seed().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
