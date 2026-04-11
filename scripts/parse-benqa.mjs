/**
 * BEnQA CSV → সূত্র ExamPaper converter
 * Reads 10th-grade CSVs and generates TypeScript exam data
 *
 * CSV columns: English Question, Bengali Question, A, B, C, D, A Bn, B Bn, C Bn, D Bn, Correct Answer
 * Correct Answer: a, b, c, d (lowercase)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CSV Parser (handles multi-line quoted fields) ──

function parseCSV(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field.trim());
        field = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++; // skip \n in \r\n
        current.push(field.trim());
        if (current.length >= 11) {
          rows.push(current);
        }
        current = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  // Last row
  if (field || current.length > 0) {
    current.push(field.trim());
    if (current.length >= 11) {
      rows.push(current);
    }
  }

  return rows;
}

// ── Subject configs ──

const SUBJECTS = [
  {
    file: '10th-Physics.csv',
    key: 'physics',
    bn: 'পদার্থবিজ্ঞান',
    papersCount: 5,
  },
  {
    file: '10th-Chemistry.csv',
    key: 'chemistry',
    bn: 'রসায়ন',
    papersCount: 5,
  },
  {
    file: '10th-Biology.csv',
    key: 'biology',
    bn: 'জীববিজ্ঞান',
    papersCount: 5,
  },
  {
    file: '10th-Math.csv',
    key: 'math',
    bn: 'সাধারণ গণিত',
    papersCount: 5,
  },
  {
    file: '10th-Math-II.csv',
    key: 'higher-math',
    bn: 'উচ্চতর গণিত',
    papersCount: 5,
  },
];

const ANSWER_MAP = { a: 0, b: 1, c: 2, d: 3 };
const QUESTIONS_PER_PAPER = 30;

// Bengali numeral converter
function toBn(n) {
  const digits = '০১২৩৪৫৬৭৮৯';
  return String(n).split('').map(d => digits[+d] || d).join('');
}

// ── Parse all subjects ──

const allPapers = [];
let totalQParsed = 0;

for (const subj of SUBJECTS) {
  const csvPath = join(__dirname, subj.file);
  const raw = readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(raw);

  // Skip header row
  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`\n📘 ${subj.bn} (${subj.file})`);
  console.log(`   Total rows: ${dataRows.length}`);

  // Parse questions
  const questions = [];
  for (const row of dataRows) {
    // Columns: 0=En Q, 1=Bn Q, 2=A, 3=B, 4=C, 5=D, 6=A Bn, 7=B Bn, 8=C Bn, 9=D Bn, 10=Answer
    const bnQuestion = row[1];
    const aBn = row[6];
    const bBn = row[7];
    const cBn = row[8];
    const dBn = row[9];
    const answer = row[10]?.toLowerCase()?.trim();

    // Validate
    if (!bnQuestion || !aBn || !bBn || !cBn || !dBn) continue;
    if (!ANSWER_MAP.hasOwnProperty(answer)) continue;

    // Skip if question is too short or looks malformed
    if (bnQuestion.length < 5) continue;

    // Clean up text — remove extra whitespace, newlines within text
    const clean = (s) => s.replace(/\s+/g, ' ').trim();

    questions.push({
      question: clean(bnQuestion),
      a: clean(aBn),
      b: clean(bBn),
      c: clean(cBn),
      d: clean(dBn),
      correct: ANSWER_MAP[answer],
      // Also keep english for reference in explanation
      enQuestion: clean(row[0]),
    });
  }

  console.log(`   Valid questions: ${questions.length}`);
  totalQParsed += questions.length;

  // Shuffle using Fisher-Yates
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create exam papers
  const paperCount = Math.min(subj.papersCount, Math.floor(shuffled.length / QUESTIONS_PER_PAPER));

  for (let p = 0; p < paperCount; p++) {
    const start = p * QUESTIONS_PER_PAPER;
    const paperQuestions = shuffled.slice(start, start + QUESTIONS_PER_PAPER);

    const paperNum = p + 1;
    const paper = {
      id: `benqa-${subj.key}-${String(paperNum).padStart(2, '0')}`,
      title: `${subj.bn} — মডেল টেস্ট ${toBn(paperNum)}`,
      subject: subj.key,
      subjectBn: subj.bn,
      year: 2024,
      classLevel: 10,
      duration: 25,
      totalMarks: 30,
      negativeMarking: 0.25,
      questions: paperQuestions.map((q, i) => ({
        id: i + 1,
        question: q.question,
        options: [
          { label: 'ক', text: q.a },
          { label: 'খ', text: q.b },
          { label: 'গ', text: q.c },
          { label: 'ঘ', text: q.d },
        ],
        correct: q.correct,
      })),
    };

    allPapers.push(paper);
  }

  console.log(`   Papers generated: ${paperCount}`);
}

console.log(`\n═══════════════════════════════════`);
console.log(`Total questions parsed: ${totalQParsed}`);
console.log(`Total papers generated: ${allPapers.length}`);

// ── Generate TypeScript ──

let ts = '';

for (const paper of allPapers) {
  ts += `\n  // ──────────────────────────────────────────\n`;
  ts += `  // ${paper.title} (BEnQA)\n`;
  ts += `  // ──────────────────────────────────────────\n`;
  ts += `  {\n`;
  ts += `    id: '${paper.id}',\n`;
  ts += `    title: '${paper.title}',\n`;
  ts += `    subject: '${paper.subject}',\n`;
  ts += `    subjectBn: '${paper.subjectBn}',\n`;
  ts += `    year: ${paper.year},\n`;
  ts += `    classLevel: ${paper.classLevel},\n`;
  ts += `    duration: ${paper.duration},\n`;
  ts += `    totalMarks: ${paper.totalMarks},\n`;
  ts += `    negativeMarking: ${paper.negativeMarking},\n`;
  ts += `    questions: [\n`;

  for (const q of paper.questions) {
    // Escape backslashes first, then single quotes
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const qText = esc(q.question);
    const a = esc(q.options[0].text);
    const b = esc(q.options[1].text);
    const c = esc(q.options[2].text);
    const d = esc(q.options[3].text);

    ts += `      { id: ${q.id}, question: '${qText}', options: opts('${a}', '${b}', '${c}', '${d}'), correct: ${q.correct} },\n`;
  }

  ts += `    ],\n`;
  ts += `  },\n`;
}

writeFileSync(join(__dirname, 'generated-exams.ts'), ts, 'utf-8');
console.log(`\n✅ Written to scripts/generated-exams.ts`);
