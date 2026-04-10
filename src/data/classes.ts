// ─────────────────────────────────────────────
// Shared class data — সূত্র | suttro.app
// In production: fetched from Supabase
// ─────────────────────────────────────────────

export const SUBJECT_COLORS: Record<string, string> = {
  physics: '#3B82F6',
  chemistry: '#7C3AED',
  biology: '#EC4899',
  math: '#DC2626',
  'higher-math': '#EA580C',
  english: '#0891B2',
};

export const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export const SUBJECT_ICONS: Record<string, string> = {
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬',
  math: '📐',
  'higher-math': '📊',
  english: '📝',
};

// Chapter names per subject (Bangla)
export const CHAPTER_NAMES: Record<string, Record<number, string>> = {
  physics: {
    1: 'ভৌত রাশি ও পরিমাপ',
    2: 'গতি',
    3: 'বল',
    4: 'কাজ, ক্ষমতা ও শক্তি',
    5: 'পদার্থের অবস্থা ও চাপ',
    6: 'বস্তুর উপর তাপের প্রভাব',
    7: 'তরঙ্গ ও শব্দ',
    8: 'আলোর প্রতিফলন',
    9: 'আলোর প্রতিসরণ',
    10: 'স্থির তড়িৎ',
    11: 'চল তড়িৎ',
    12: 'তড়িতের চৌম্বক ক্রিয়া',
    13: 'আধুনিক পদার্থবিজ্ঞান',
  },
  chemistry: {
    1: 'রসায়নের ধারণা',
    2: 'পদার্থের অবস্থা',
    3: 'পদার্থের গঠন',
    4: 'পর্যায় সারণি',
    5: 'রাসায়নিক বন্ধন',
    6: 'মোলের ধারণা',
    7: 'রাসায়নিক বিক্রিয়া',
    8: 'রসায়ন ও শক্তি',
    9: 'এসিড-ক্ষারক সমতা',
    10: 'খনিজ সম্পদ',
    11: 'জীবনযাত্রায় রসায়ন',
  },
  biology: {
    1: 'জীবন পাঠ',
    2: 'জীবকোষ ও টিস্যু',
    3: 'কোষ বিভাজন',
    4: 'জীবনীশক্তি',
    5: 'খাদ্য, পুষ্টি ও পরিপাক',
    6: 'জীবে পরিবহন',
    7: 'গ্যাসীয় বিনিময়',
    8: 'রেচন প্রক্রিয়া',
    9: 'দৃঢ়তা প্রদান ও চলন',
    10: 'সমন্বয়',
    11: 'জীবের প্রজনন',
    12: 'জীবের বংশগতি ও বিবর্তন',
    13: 'জীবের পরিবেশ',
  },
  math: {
    1: 'প্যাটার্ন, সেট ও সম্পর্ক',
    2: 'মুনাফা',
    3: 'পরিমাপ',
    4: 'বীজগণিতীয় রাশি',
    5: 'সমীকরণ',
    6: 'জ্যামিতির মৌলিক ধারণা',
    7: 'ত্রিভুজ',
    8: 'বৃত্ত',
    9: 'পিথাগোরাসের উপপাদ্য',
    10: 'ত্রিকোণমিতি',
    11: 'পরিসংখ্যান ও সম্ভাবনা',
  },
  'higher-math': {
    1: 'সেট ও ফাংশন',
    2: 'বীজগণিতীয় রাশি',
    3: 'সরলরেখা',
    4: 'সমীকরণ',
    5: 'অসমতা',
    6: 'সূচক ও লগারিদম',
    7: 'অনুক্রম ও ধারা',
    8: 'ত্রিকোণমিতি',
    9: 'পরিমিতি',
    10: 'স্থানাঙ্ক জ্যামিতি',
    11: 'সম্ভাবনা',
  },
  english: {
    1: 'Sentence Structure',
    2: 'Tense',
    3: 'Right Form of Verbs',
    4: 'Narration',
    5: 'Voice Change',
    6: 'Transformation',
    7: 'Preposition',
    8: 'Articles',
    9: 'Punctuation',
    10: 'Composition',
  },
};

export interface ClassRecording {
  slug: string;
  title: string;
  subject: string;
  chapter: number;
  classLevel: number;
  date: string;
  duration: string;
  available: boolean;
  youtubeId: string | null;
}

/** YouTube thumbnail URL helper */
export function ytThumb(videoId: string, quality: 'mq' | 'hq' | 'max' = 'mq'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

export const CLASSES: ClassRecording[] = [
  // ── পদার্থবিজ্ঞান ──
  {
    slug: '2026-04-02-ohms-law',
    title: 'ওহমের সূত্র — তত্ত্ব ও সিমুলেশন',
    subject: 'physics',
    chapter: 11,
    classLevel: 9,
    date: '০২ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    available: true,
    youtubeId: 'h3o6ZKf3QTU',
  },
  {
    slug: '2026-04-03-light-reflection',
    title: 'আলোর প্রতিফলন — সমতল দর্পণ',
    subject: 'physics',
    chapter: 8,
    classLevel: 9,
    date: '০৩ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    available: true,
    youtubeId: 'tyiaB96lgOE',
  },
  {
    slug: '2026-04-06-light-refraction',
    title: 'আলোর প্রতিসরণ — স্নেলের সূত্র',
    subject: 'physics',
    chapter: 9,
    classLevel: 9,
    date: '০৬ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    available: true,
    youtubeId: '9Y0Qirsl4fk',
  },

  // ── রসায়ন ──
  {
    slug: '2026-04-04-acid-base',
    title: 'অ্যাসিড-ক্ষার বিক্রিয়া ও pH স্কেল',
    subject: 'chemistry',
    chapter: 9,
    classLevel: 9,
    date: '০৪ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    available: true,
    youtubeId: 'INKPA6RILS0',
  },
  {
    slug: '2026-04-07-atomic-structure',
    title: 'পরমাণুর গঠন — বোর মডেল',
    subject: 'chemistry',
    chapter: 3,
    classLevel: 9,
    date: '০৭ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    available: true,
    youtubeId: '629kKhLr_xw',
  },

  // ── জীববিজ্ঞান ──
  {
    slug: '2026-04-05-cell-division',
    title: 'কোষ বিভাজন — মাইটোসিস',
    subject: 'biology',
    chapter: 3,
    classLevel: 10,
    date: '০৫ এপ্রিল ২০২৬',
    duration: '৫৫ মিনিট',
    available: true,
    youtubeId: 'djJgivCm18k',
  },
  {
    slug: '2026-04-08-photosynthesis',
    title: 'সালোকসংশ্লেষণ — আলোক ও অন্ধকার পর্যায়',
    subject: 'biology',
    chapter: 4,
    classLevel: 9,
    date: '০৮ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    available: true,
    youtubeId: 'cpLOajjJ10Q',
  },

  // ── সাধারণ গণিত ──
  {
    slug: '2026-04-09-pythagorean',
    title: 'পিথাগোরাসের উপপাদ্য',
    subject: 'math',
    chapter: 9,
    classLevel: 9,
    date: '০৯ এপ্রিল ২০২৬',
    duration: '৩৫ মিনিট',
    available: true,
    youtubeId: 'yCAB23Y7T-Q',
  },
  {
    slug: '2026-04-10-circle-geometry',
    title: 'বৃত্তের ক্ষেত্রফল ও পরিধি',
    subject: 'math',
    chapter: 8,
    classLevel: 9,
    date: '১০ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    available: true,
    youtubeId: 'JVDS7HxxxA4',
  },

  // ── উচ্চতর গণিত ──
  {
    slug: '2026-04-11-trigonometry',
    title: 'ত্রিকোণমিতিক অনুপাত — sin, cos, tan',
    subject: 'higher-math',
    chapter: 8,
    classLevel: 9,
    date: '১১ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    available: true,
    youtubeId: 'oGQB13M_oWE',
  },
  {
    slug: '2026-04-12-straight-line',
    title: 'সরলরেখার সমীকরণ — y = mx + c',
    subject: 'higher-math',
    chapter: 3,
    classLevel: 10,
    date: '১২ এপ্রিল ২০২৬',
    duration: '৪৫ মিনিট',
    available: true,
    youtubeId: '2XgLvZ9ofKk',
  },

  // ── ইংরেজি ──
  {
    slug: '2026-04-13-tense',
    title: 'Tense — ১২টি কাল সম্পূর্ণ আলোচনা',
    subject: 'english',
    chapter: 2,
    classLevel: 9,
    date: '১৩ এপ্রিল ২০২৬',
    duration: '৫০ মিনিট',
    available: true,
    youtubeId: 'Bw-SmUib6cI',
  },
  {
    slug: '2026-04-14-sentence-structure',
    title: 'Sentence Structure — SVO বিশ্লেষণ',
    subject: 'english',
    chapter: 1,
    classLevel: 9,
    date: '১৪ এপ্রিল ২০২৬',
    duration: '৪০ মিনিট',
    available: true,
    youtubeId: 'eanlAd9vH8Q',
  },
];
