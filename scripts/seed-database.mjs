#!/usr/bin/env node

// ============================================
// Seed Supabase database from static TS data
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-database.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

// ── Parse static TS files ──
// Since we can't import .ts directly, we extract data via regex/eval approach.
// We read the compiled .next output or parse the TS manually.
// Simpler: use a lightweight TS→JS transpile approach.

// Actually, let's just use the raw TS files and strip types manually.
// The data files are simple enough (no complex generics).

function stripTypes(code) {
  return code
    // Remove export/import statements
    .replace(/^import\s+.*$/gm, '')
    // Remove interface/type declarations
    .replace(/^export\s+(interface|type)\s+\w+[\s\S]*?^}/gm, '')
    // Remove inline type annotations
    .replace(/:\s*(Record<[^>]+>|string\[\]|\w+\[\]|\w+|'[^']*'(\s*\|\s*'[^']*')*)/g, '')
    .replace(/as\s+const/g, '')
    // Remove export keywords
    .replace(/^export\s+(const|function)/gm, 'const')
    // Remove function type annotations
    .replace(/\)\s*:\s*\w+(\[\])?\s*{/g, ') {')
    // Remove tuple type annotations like [MCQOption, MCQOption, MCQOption, MCQOption]
    .replace(/:\s*\[[^\]]+\]/g, '')
    // Clean generic types in Record<>
    .replace(/<[^>]+>/g, '');
}

function loadTSModule(filePath) {
  const raw = readFileSync(resolve(ROOT, filePath), 'utf-8');
  const js = stripTypes(raw);

  // Wrap in a function to capture exports
  const exports = {};
  const fn = new Function('exports', js + '\nObject.assign(exports, { ' +
    (js.match(/(?:^|\n)const\s+(\w+)\s*=/g) || [])
      .map(m => m.match(/const\s+(\w+)/)[1])
      .join(', ') +
    ' });'
  );
  fn(exports);
  return exports;
}

// ── Subject & Chapter reference data ──

const SUBJECTS = [
  { id: 'physics', name_bn: 'পদার্থবিজ্ঞান', icon: '⚡', color: '#2563EB', sort_order: 1 },
  { id: 'chemistry', name_bn: 'রসায়ন', icon: '🧪', color: '#7C3AED', sort_order: 2 },
  { id: 'biology', name_bn: 'জীববিজ্ঞান', icon: '🧬', color: '#059669', sort_order: 3 },
  { id: 'math', name_bn: 'সাধারণ গণিত', icon: '📐', color: '#DC2626', sort_order: 4 },
  { id: 'higher-math', name_bn: 'উচ্চতর গণিত', icon: '📊', color: '#EA580C', sort_order: 5 },
  { id: 'english', name_bn: 'ইংরেজি', icon: '📝', color: '#0891B2', sort_order: 6 },
];

// Chapter names from classes.ts CHAPTER_NAMES
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

// ── Class detail data (from class/[slug]/page.tsx) ──
// These have extra fields not in classes.ts

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
  console.log('🌱 Seeding Suttro database...\n');

  // 1. Seed subjects
  console.log('📚 Inserting subjects...');
  const { error: subErr } = await supabase
    .from('subjects')
    .upsert(SUBJECTS, { onConflict: 'id' });
  if (subErr) throw new Error(`subjects: ${subErr.message}`);
  console.log(`   ✓ ${SUBJECTS.length} subjects`);

  // 2. Seed chapters
  console.log('📖 Inserting chapters...');
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
  // Delete existing and re-insert (chapters don't have a natural PK for upsert)
  await supabase.from('chapters').delete().neq('id', 0);
  const { error: chErr } = await supabase.from('chapters').insert(chapterRows);
  if (chErr) throw new Error(`chapters: ${chErr.message}`);
  console.log(`   ✓ ${chapterRows.length} chapters`);

  // 3. Seed classes — parse from static data
  console.log('📹 Inserting classes...');
  const classesData = loadClassesFromFile();
  const classRows = classesData.map(cls => {
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
  console.log(`   ✓ ${classRows.length} classes`);

  // 4. Seed exams + MCQ questions
  console.log('📝 Inserting exams & MCQ questions...');
  const exams = loadExamsFromFile();
  let totalQuestions = 0;

  for (const exam of exams) {
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
  console.log(`   ✓ ${exams.length} exams, ${totalQuestions} questions`);

  // 5. Seed CQ collections + creative questions + parts
  console.log('📖 Inserting CQ collections...');
  const cqCollections = loadCQFromFile();
  let totalCQs = 0;
  let totalParts = 0;

  for (const col of cqCollections) {
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
    // Need to get existing CQ IDs first to delete parts
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
      const { error: pErr } = await supabase.from('cq_parts').insert(partRows);
      if (pErr) throw new Error(`CQ parts: ${pErr.message}`);
      totalParts += partRows.length;
      totalCQs++;
    }
  }
  console.log(`   ✓ ${cqCollections.length} collections, ${totalCQs} questions, ${totalParts} parts`);

  console.log('\n✅ Seed complete!');
}

// ── File parsers ──
// These parse the TS source files by evaluating the data portions

function loadClassesFromFile() {
  const raw = readFileSync(resolve(ROOT, 'src/data/classes.ts'), 'utf-8');

  // Extract the CLASSES array
  const match = raw.match(/export const CLASSES[\s\S]*?=\s*\[([\s\S]*)\];/);
  if (!match) throw new Error('Could not find CLASSES array');

  // Evaluate as JavaScript
  const arrStr = '[' + match[1] + ']';
  const cleaned = arrStr
    .replace(/\/\/[^\n]*/g, '') // remove single-line comments
    .replace(/'/g, '"')         // single to double quotes
    .replace(/(\w+):/g, '"$1":') // unquoted keys to quoted
    .replace(/,\s*([}\]])/g, '$1') // trailing commas
    .replace(/"subject":\s*"(\w[\w-]*)"/g, '"subject": "$1"'); // keep subject as-is

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: manual extraction
    console.warn('   ⚠ JSON parse failed for classes, using manual extraction');
    return extractClassesManual(raw);
  }
}

function extractClassesManual(raw) {
  const classes = [];
  const regex = /{\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*subject:\s*'([^']+)',\s*chapter:\s*(\d+),\s*classLevel:\s*(\d+),\s*date:\s*'([^']+)',\s*duration:\s*'([^']+)',\s*available:\s*(true|false),\s*youtubeId:\s*(?:'([^']*)'|null)/g;
  let m;
  while ((m = regex.exec(raw)) !== null) {
    classes.push({
      slug: m[1], title: m[2], subject: m[3], chapter: Number(m[4]),
      classLevel: Number(m[5]), date: m[6], duration: m[7],
      available: m[8] === 'true', youtubeId: m[9] || null,
    });
  }
  return classes;
}

function loadExamsFromFile() {
  const raw = readFileSync(resolve(ROOT, 'src/data/exams.ts'), 'utf-8');

  // Extract exam papers using regex
  const exams = [];
  const examRegex = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*subject:\s*'([^']+)',\s*subjectBn:\s*'([^']+)',\s*year:\s*(\d+),\s*(?:board:\s*'([^']*)',\s*)?classLevel:\s*(\d+),\s*duration:\s*(\d+),\s*totalMarks:\s*(\d+),\s*negativeMarking:\s*([\d.]+),\s*questions:\s*\[/g;

  let examMatch;
  while ((examMatch = examRegex.exec(raw)) !== null) {
    const exam = {
      id: examMatch[1],
      title: examMatch[2],
      subject: examMatch[3],
      subjectBn: examMatch[4],
      year: Number(examMatch[5]),
      board: examMatch[6] || null,
      classLevel: Number(examMatch[7]),
      duration: Number(examMatch[8]),
      totalMarks: Number(examMatch[9]),
      negativeMarking: Number(examMatch[10]),
      questions: [],
    };

    // Find the questions array for this exam
    const startIdx = examMatch.index + examMatch[0].length;
    const questionsStr = extractBalancedBracket(raw, startIdx - 1);

    // Parse individual questions
    const qRegex = /{\s*id:\s*(\d+),\s*question:\s*'((?:[^'\\]|\\.)*)'/g;
    let qMatch;
    let questionBuf = questionsStr;

    // More robust: split by { id: N, and parse each
    const questionBlocks = questionsStr.split(/(?=\{\s*id:\s*\d+,\s*question:)/);

    for (const block of questionBlocks) {
      if (!block.trim().startsWith('{')) continue;

      const idM = block.match(/id:\s*(\d+)/);
      const questionM = block.match(/question:\s*'((?:[^'\\]|\\')*)'/);
      const optsM = block.match(/opts\(\s*'((?:[^'\\]|\\')*)'\s*,\s*'((?:[^'\\]|\\')*)'\s*,\s*'((?:[^'\\]|\\')*)'\s*,\s*'((?:[^'\\]|\\')*)'\s*\)/);
      const correctM = block.match(/correct:\s*(\d)/);
      const explM = block.match(/explanation:\s*'((?:[^'\\]|\\')*)'/);
      const chapM = block.match(/chapter:\s*(\d+)/);

      if (!idM || !questionM || !correctM) continue;

      const unescape = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

      const q = {
        id: Number(idM[1]),
        question: unescape(questionM[1]),
        options: optsM ? [
          { label: 'ক', text: unescape(optsM[1]) },
          { label: 'খ', text: unescape(optsM[2]) },
          { label: 'গ', text: unescape(optsM[3]) },
          { label: 'ঘ', text: unescape(optsM[4]) },
        ] : [],
        correct: Number(correctM[1]),
        explanation: explM ? unescape(explM[1]) : undefined,
        chapter: chapM ? Number(chapM[1]) : undefined,
      };
      exam.questions.push(q);
    }

    exams.push(exam);
  }

  return exams;
}

function extractBalancedBracket(str, startIdx) {
  let depth = 0;
  let start = -1;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '[') {
      if (depth === 0) start = i;
      depth++;
    } else if (str[i] === ']') {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return '';
}

function loadCQFromFile() {
  const raw = readFileSync(resolve(ROOT, 'src/data/cq.ts'), 'utf-8');

  const collections = [];
  // Find CQ_COLLECTIONS array entries
  const colRegex = /{\s*id:\s*'([^']+)',\s*subject:\s*'([^']+)',\s*subjectBn:\s*'([^']+)',\s*classLevel:\s*(\d+),\s*questions:\s*\[/g;

  let colMatch;
  while ((colMatch = colRegex.exec(raw)) !== null) {
    const col = {
      id: colMatch[1],
      subject: colMatch[2],
      subjectBn: colMatch[3],
      classLevel: Number(colMatch[4]),
      questions: [],
    };

    // Extract questions array
    const startIdx = colMatch.index + colMatch[0].length - 1;
    const questionsStr = extractBalancedBracket(raw, startIdx);

    // Parse each CQ block
    // Pattern: { id: N, chapter: N, stem: '...', parts: cqParts(...), source: '...' }
    // Or: { id: N, chapter: N, stem: '...', parts: cqParts(...) }
    const cqBlocks = questionsStr.split(/(?=\{\s*id:\s*\d+,\s*chapter:)/);

    for (const block of cqBlocks) {
      if (!block.trim().startsWith('{')) continue;

      const idM = block.match(/id:\s*(\d+)/);
      const chapM = block.match(/chapter:\s*(\d+)/);
      const stemM = block.match(/stem:\s*'((?:[^'\\]|\\')*)'/);
      const sourceM = block.match(/source:\s*'((?:[^'\\]|\\')*)'/);

      if (!idM || !chapM || !stemM) continue;

      const unescape = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

      // Extract cqParts arguments
      const partsM = block.match(/cqParts\(([\s\S]*?)\)\s*[,}]/);
      const parts = [];

      if (partsM) {
        // Parse the 8 string arguments to cqParts
        const argsStr = partsM[1];
        const argRegex = /'((?:[^'\\]|\\')*)'/g;
        const args = [];
        let argMatch;
        while ((argMatch = argRegex.exec(argsStr)) !== null) {
          args.push(unescape(argMatch[1]));
        }

        if (args.length >= 8) {
          parts.push({ label: 'ক', type: 'জ্ঞানমূলক', marks: 1, question: args[0], answer: args[1] });
          parts.push({ label: 'খ', type: 'অনুধাবনমূলক', marks: 2, question: args[2], answer: args[3] });
          parts.push({ label: 'গ', type: 'প্রয়োগমূলক', marks: 3, question: args[4], answer: args[5] });
          parts.push({ label: 'ঘ', type: 'উচ্চতর দক্ষতা', marks: 4, question: args[6], answer: args[7] });
        }
      }

      col.questions.push({
        id: Number(idM[1]),
        chapter: Number(chapM[1]),
        stem: unescape(stemM[1]),
        parts,
        source: sourceM ? unescape(sourceM[1]) : undefined,
      });
    }

    collections.push(col);
  }

  return collections;
}

// ── Run ──

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
