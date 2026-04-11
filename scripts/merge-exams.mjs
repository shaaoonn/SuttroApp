/**
 * Merge generated BEnQA exams into src/data/exams.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const examsPath = join(__dirname, '..', 'src', 'data', 'exams.ts');
const generatedPath = join(__dirname, 'generated-exams.ts');

const original = readFileSync(examsPath, 'utf-8');
const generated = readFileSync(generatedPath, 'utf-8');

// Find the position of "];" that closes the EXAMS array
// It's the LAST "];" before the helper functions
const marker = `];

// ── Helper: Get exam by ID ──`;

if (!original.includes(marker)) {
  console.error('Could not find insertion point in exams.ts');
  process.exit(1);
}

// Insert generated papers before the "];"
const merged = original.replace(
  marker,
  generated + `\n${marker}`
);

writeFileSync(examsPath, merged, 'utf-8');

// Count papers
const paperCount = (merged.match(/id: '/g) || []).length;
console.log(`✅ Merged! Total papers in exams.ts: ${paperCount}`);
console.log(`   File size: ${(Buffer.byteLength(merged, 'utf-8') / 1024).toFixed(1)} KB`);
