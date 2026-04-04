import type { SimulationConfig } from '../../_template/config';

// ─────────────────────────────────────────────
// Cell Division — Mitosis (মাইটোসিস)
// NCTB Class 9, Chapter 2: জীবকোষ ও টিস্যু
// Shows phases: Interphase → Prophase → Metaphase
//   → Anaphase → Telophase → Cytokinesis
// ─────────────────────────────────────────────

export const cellDivisionConfig: SimulationConfig = {
  id: 'cell-division',
  slug: 'cell-division',
  title: { bn: 'কোষ বিভাজন — মাইটোসিস', en: 'Cell Division — Mitosis' },
  subject: 'biology',
  nctb: { class: 9, chapter: 2, section: '2.3' },
  variables: [
    {
      id: 'phase',
      label: { bn: 'ধাপ নির্বাচন', en: 'Phase Selection' },
      unit: '',
      min: 0,
      max: 5,
      default: 0,
      step: 1,
    },
    {
      id: 'speed',
      label: { bn: 'অ্যানিমেশন গতি', en: 'Animation Speed' },
      unit: 'x',
      min: 0.5,
      max: 3.0,
      default: 1.0,
      step: 0.5,
    },
  ],
  formulas: [
    {
      expression: '2n → 2n (মাইটোসিস)',
      description: { bn: 'ক্রোমোজোম সংখ্যা অপরিবর্তিত থাকে', en: 'Chromosome number remains same' },
    },
    {
      expression: '১টি মাতৃকোষ → ২টি অপত্য কোষ',
      description: { bn: 'সমান ক্রোমোজোম বিশিষ্ট দুটি কোষ তৈরি হয়', en: 'One parent cell produces two identical daughter cells' },
    },
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};

export interface PhaseInfo {
  id: number;
  name: { bn: string; en: string };
  description: string;
  color: string;
}

export const PHASES: PhaseInfo[] = [
  {
    id: 0,
    name: { bn: 'ইন্টারফেজ', en: 'Interphase' },
    description: 'DNA প্রতিলিপি তৈরি হয়, কোষ বৃদ্ধি পায়। ক্রোমাটিন জালিকা দৃশ্যমান।',
    color: '#34D399',
  },
  {
    id: 1,
    name: { bn: 'প্রোফেজ', en: 'Prophase' },
    description: 'ক্রোমাটিন কুণ্ডলিত হয়ে ক্রোমোজোম তৈরি হয়। নিউক্লিয়ার মেমব্রেন বিলুপ্ত হতে শুরু করে।',
    color: '#60A5FA',
  },
  {
    id: 2,
    name: { bn: 'মেটাফেজ', en: 'Metaphase' },
    description: 'ক্রোমোজোমগুলো কোষের মধ্যরেখায় সজ্জিত হয়। স্পিন্ডল তন্তু সংযুক্ত হয়।',
    color: '#FBBF24',
  },
  {
    id: 3,
    name: { bn: 'অ্যানাফেজ', en: 'Anaphase' },
    description: 'ক্রোমাটিড বিভক্ত হয়ে বিপরীত মেরুতে যায়। স্পিন্ডল তন্তু সংকুচিত হয়।',
    color: '#F87171',
  },
  {
    id: 4,
    name: { bn: 'টেলোফেজ', en: 'Telophase' },
    description: 'নতুন নিউক্লিয়ার মেমব্রেন তৈরি হয়। ক্রোমোজোম আবার ক্রোমাটিনে পরিণত হয়।',
    color: '#A78BFA',
  },
  {
    id: 5,
    name: { bn: 'সাইটোকাইনেসিস', en: 'Cytokinesis' },
    description: 'সাইটোপ্লাজম বিভক্ত হয়ে দুটি অপত্য কোষ তৈরি হয়।',
    color: '#F472B6',
  },
];
