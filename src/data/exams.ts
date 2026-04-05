// ─────────────────────────────────────────────
// MCQ Exam System — সূত্র | suttro.app
// SSC-style MCQ question papers
// ─────────────────────────────────────────────

// ── Types ──

export interface MCQOption {
  label: string; // ক, খ, গ, ঘ
  text: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: [MCQOption, MCQOption, MCQOption, MCQOption];
  correct: number; // 0-3 index
  explanation?: string;
  chapter?: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  subjectBn: string;
  year: number;
  board?: string;
  classLevel: number;
  duration: number; // minutes
  totalMarks: number;
  negativeMarking: number; // per wrong answer (0.25 typical)
  questions: MCQQuestion[];
}

// ── Subject Config (reuse from classes) ──

export const EXAM_SUBJECT_COLORS: Record<string, string> = {
  physics: '#2563EB',
  chemistry: '#7C3AED',
  biology: '#059669',
  math: '#DC2626',
  'higher-math': '#EA580C',
  english: '#0891B2',
};

export const EXAM_SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export const EXAM_SUBJECT_ICONS: Record<string, string> = {
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬',
  math: '📐',
  'higher-math': '📊',
  english: '📝',
};

// ── Helper: Build options with ক খ গ ঘ labels ──

function opts(a: string, b: string, c: string, d: string): [MCQOption, MCQOption, MCQOption, MCQOption] {
  return [
    { label: 'ক', text: a },
    { label: 'খ', text: b },
    { label: 'গ', text: c },
    { label: 'ঘ', text: d },
  ];
}

// ═══════════════════════════════════════════════
// EXAM PAPERS
// ═══════════════════════════════════════════════

export const EXAMS: ExamPaper[] = [

  // ──────────────────────────────────────────
  // 1. পদার্থবিজ্ঞান — SSC 2024 Model
  // ──────────────────────────────────────────
  {
    id: 'ssc-2024-physics',
    title: 'এসএসসি পদার্থবিজ্ঞান — মডেল টেস্ট ২০২৪',
    subject: 'physics',
    subjectBn: 'পদার্থবিজ্ঞান',
    year: 2024,
    board: 'ঢাকা বোর্ড',
    classLevel: 10,
    duration: 30,
    totalMarks: 30,
    negativeMarking: 0.25,
    questions: [
      // Chapter 1: ভৌত রাশি ও পরিমাপ
      { id: 1, question: 'নিচের কোনটি মৌলিক রাশি?', options: opts('বেগ', 'বল', 'ভর', 'ত্বরণ'), correct: 2, explanation: 'ভর একটি মৌলিক রাশি। বেগ, বল ও ত্বরণ লব্ধ রাশি।', chapter: 1 },
      { id: 2, question: 'আলোকবর্ষ কোন রাশির একক?', options: opts('সময়', 'দূরত্ব', 'বেগ', 'ত্বরণ'), correct: 1, explanation: 'আলোকবর্ষ দূরত্বের একক — আলো এক বছরে যে দূরত্ব অতিক্রম করে।', chapter: 1 },
      { id: 3, question: 'SI পদ্ধতিতে তাপমাত্রার একক কী?', options: opts('সেলসিয়াস', 'ফারেনহাইট', 'কেলভিন', 'র‍্যাঙ্কিন'), correct: 2, explanation: 'SI পদ্ধতিতে তাপমাত্রার একক কেলভিন (K)।', chapter: 1 },

      // Chapter 2: গতি
      { id: 4, question: 'সুষম বেগে চলমান বস্তুর ত্বরণ কত?', options: opts('ধনাত্মক', 'ঋণাত্মক', 'শূন্য', 'অসীম'), correct: 2, explanation: 'সুষম বেগে বেগের পরিবর্তন হয় না, তাই ত্বরণ শূন্য।', chapter: 2 },
      { id: 5, question: 'মুক্তভাবে পড়ন্ত বস্তুর ত্বরণকে কী বলে?', options: opts('রৈখিক ত্বরণ', 'কৌণিক ত্বরণ', 'অভিকর্ষজ ত্বরণ', 'কেন্দ্রমুখী ত্বরণ'), correct: 2, explanation: 'মুক্তভাবে পড়ন্ত বস্তুর ত্বরণকে অভিকর্ষজ ত্বরণ (g) বলে।', chapter: 2 },
      { id: 6, question: 'v = u + at সমীকরণে u কী নির্দেশ করে?', options: opts('শেষ বেগ', 'ত্বরণ', 'সরণ', 'আদিবেগ'), correct: 3, explanation: 'u হলো আদিবেগ (initial velocity)।', chapter: 2 },

      // Chapter 3: বল
      { id: 7, question: 'নিউটনের প্রথম সূত্র থেকে কোন ধারণা পাওয়া যায়?', options: opts('বল', 'জড়তা', 'ভরবেগ', 'শক্তি'), correct: 1, explanation: 'নিউটনের প্রথম সূত্র জড়তার সূত্র নামে পরিচিত।', chapter: 3 },
      { id: 8, question: 'F = ma সূত্রটি নিউটনের কোন সূত্র?', options: opts('প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'মহাকর্ষ'), correct: 1, explanation: 'F = ma নিউটনের দ্বিতীয় সূত্রের গাণিতিক রূপ।', chapter: 3 },
      { id: 9, question: '1 নিউটন সমান কত?', options: opts('1 kg⋅m/s', '1 kg⋅m/s²', '1 kg⋅m²/s²', '1 kg/m⋅s²'), correct: 1, explanation: '1 N = 1 kg × 1 m/s² = 1 kg⋅m/s²', chapter: 3 },

      // Chapter 4: কাজ, ক্ষমতা ও শক্তি
      { id: 10, question: 'কাজের SI একক কোনটি?', options: opts('নিউটন', 'ওয়াট', 'জুল', 'প্যাসকেল'), correct: 2, explanation: 'কাজের SI একক জুল (J)। 1 J = 1 N × 1 m', chapter: 4 },
      { id: 11, question: 'ক্ষমতার একক কোনটি?', options: opts('জুল', 'ওয়াট', 'নিউটন', 'ক্যালরি'), correct: 1, explanation: 'ক্ষমতার একক ওয়াট (W)। 1 W = 1 J/s', chapter: 4 },
      { id: 12, question: 'গতিশক্তির সূত্র কোনটি?', options: opts('mgh', '½mv²', 'Fd', 'Pt'), correct: 1, explanation: 'গতিশক্তি = ½mv², যেখানে m = ভর, v = বেগ।', chapter: 4 },

      // Chapter 5: পদার্থের অবস্থা ও চাপ
      { id: 13, question: 'চাপের SI একক কোনটি?', options: opts('নিউটন', 'প্যাসকেল', 'বার', 'ডাইন'), correct: 1, explanation: 'চাপের SI একক প্যাসকেল (Pa)। 1 Pa = 1 N/m²', chapter: 5 },
      { id: 14, question: 'প্যাসকেলের সূত্র অনুযায়ী, আবদ্ধ তরলের উপর চাপ প্রয়োগ করলে —', options: opts('চাপ কমে যায়', 'চাপ সমানভাবে সঞ্চালিত হয়', 'চাপ বেড়ে যায়', 'কিছু হয় না'), correct: 1, explanation: 'প্যাসকেলের সূত্র: আবদ্ধ তরলের কোনো অংশে চাপ দিলে তা সমানভাবে সর্বদিকে সঞ্চালিত হয়।', chapter: 5 },

      // Chapter 6: বস্তুর উপর তাপের প্রভাব
      { id: 15, question: 'সুপ্ততাপ বলতে কী বোঝায়?', options: opts('তাপমাত্রা বৃদ্ধির জন্য তাপ', 'অবস্থার পরিবর্তনের জন্য তাপ', 'শীতল করার তাপ', 'বিকিরণ তাপ'), correct: 1, explanation: 'সুপ্ততাপ হলো পদার্থের অবস্থা পরিবর্তনের জন্য প্রয়োজনীয় তাপ, যেখানে তাপমাত্রা পরিবর্তন হয় না।', chapter: 6 },
      { id: 16, question: 'পানির আপেক্ষিক তাপ কত?', options: opts('1 cal/g°C', '4200 J/kg°C', 'উভয়ই সঠিক', 'কোনোটিই নয়'), correct: 2, explanation: 'পানির আপেক্ষিক তাপ 1 cal/g°C অথবা 4200 J/kg°C — উভয়ই সঠিক।', chapter: 6 },

      // Chapter 7: তরঙ্গ ও শব্দ
      { id: 17, question: 'শব্দ কোন ধরনের তরঙ্গ?', options: opts('আড় তরঙ্গ', 'অনুদৈর্ঘ্য তরঙ্গ', 'তাড়িতচুম্বকীয়', 'স্থির তরঙ্গ'), correct: 1, explanation: 'শব্দ অনুদৈর্ঘ্য তরঙ্গ — কণাগুলো তরঙ্গের দিকেই কম্পিত হয়।', chapter: 7 },
      { id: 18, question: 'বায়ুতে শব্দের বেগ প্রায় কত?', options: opts('300 m/s', '332 m/s', '3×10⁸ m/s', '1500 m/s'), correct: 1, explanation: '0°C তাপমাত্রায় বায়ুতে শব্দের বেগ প্রায় 332 m/s।', chapter: 7 },

      // Chapter 10: আলোর প্রতিফলন
      { id: 19, question: 'আলোর প্রতিফলনের ক্ষেত্রে আপতন কোণ ও প্রতিফলন কোণ —', options: opts('আপতন কোণ বড়', 'প্রতিফলন কোণ বড়', 'সমান', 'কোনো সম্পর্ক নেই'), correct: 2, explanation: 'প্রতিফলনের সূত্র: আপতন কোণ = প্রতিফলন কোণ।', chapter: 10 },
      { id: 20, question: 'সমতল দর্পণে প্রতিবিম্ব কেমন?', options: opts('উল্টো ও ছোট', 'সোজা ও সমান', 'উল্টো ও বড়', 'সোজা ও ছোট'), correct: 1, explanation: 'সমতল দর্পণে প্রতিবিম্ব সোজা, সমান আকারের ও অসদ।', chapter: 10 },

      // Chapter 11: আলোর প্রতিসরণ
      { id: 21, question: 'আলো হালকা মাধ্যম থেকে ঘন মাধ্যমে প্রবেশ করলে —', options: opts('সরল রেখায় যায়', 'অভিলম্বের দিকে বেঁকে যায়', 'অভিলম্ব থেকে দূরে সরে যায়', 'ফিরে আসে'), correct: 1, explanation: 'হালকা → ঘন মাধ্যমে আলো অভিলম্বের দিকে বেঁকে যায়।', chapter: 11 },
      { id: 22, question: 'স্নেলের সূত্র কোনটি?', options: opts('n₁ sin i = n₂ sin r', 'n₁ cos i = n₂ cos r', 'n₁/sin i = n₂/sin r', 'sin i + sin r = n'), correct: 0, explanation: 'স্নেলের সূত্র: n₁ sin i = n₂ sin r', chapter: 11 },

      // Chapter 12: তড়িৎ
      { id: 23, question: 'ওহমের সূত্র কোনটি?', options: opts('V = IR', 'V = I/R', 'V = I + R', 'I = VR'), correct: 0, explanation: 'ওহমের সূত্র: V = IR, যেখানে V = বিভব পার্থক্য, I = তড়িৎ প্রবাহ, R = রোধ।', chapter: 12 },
      { id: 24, question: 'রোধের SI একক কোনটি?', options: opts('ভোল্ট', 'অ্যাম্পিয়ার', 'ওহম', 'ওয়াট'), correct: 2, explanation: 'রোধের SI একক ওহম (Ω)।', chapter: 12 },
      { id: 25, question: 'শ্রেণি সংযোগে মোট রোধ —', options: opts('কমে', 'বাড়ে', 'একই থাকে', 'শূন্য হয়'), correct: 1, explanation: 'শ্রেণি সংযোগে রোধ যোগ হয়: R = R₁ + R₂ + R₃', chapter: 12 },
      { id: 26, question: 'তড়িৎ ক্ষমতা P = ?', options: opts('V/I', 'IR', 'VI', 'V/R²'), correct: 2, explanation: 'তড়িৎ ক্ষমতা P = VI = I²R = V²/R', chapter: 12 },

      // Chapter 13: আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স
      { id: 27, question: 'LED-এর পূর্ণরূপ কী?', options: opts('Light Emitting Device', 'Light Emitting Diode', 'Low Energy Diode', 'Linear Electronic Device'), correct: 1, explanation: 'LED = Light Emitting Diode (আলোক নিঃসরণকারী ডায়োড)।', chapter: 13 },
      { id: 28, question: 'ডিজিটাল সিগন্যালে কয়টি মান থাকে?', options: opts('একটি', 'দুটি', 'তিনটি', 'অসংখ্য'), correct: 1, explanation: 'ডিজিটাল সিগন্যালে দুটি মান থাকে: 0 এবং 1।', chapter: 13 },

      // Mixed chapters
      { id: 29, question: 'কোনটি ভেক্টর রাশি?', options: opts('ভর', 'সময়', 'সরণ', 'তাপমাত্রা'), correct: 2, explanation: 'সরণ ভেক্টর রাশি — এর মান ও দিক দুটোই আছে।', chapter: 2 },
      { id: 30, question: 'পরমাণুতে ইলেকট্রনের আবিষ্কারক কে?', options: opts('রাদারফোর্ড', 'থমসন', 'বোর', 'চ্যাডউইক'), correct: 1, explanation: 'জে. জে. থমসন ১৮৯৭ সালে ইলেকট্রন আবিষ্কার করেন।', chapter: 13 },
    ],
  },

  // ──────────────────────────────────────────
  // 2. রসায়ন — SSC 2024 Model
  // ──────────────────────────────────────────
  {
    id: 'ssc-2024-chemistry',
    title: 'এসএসসি রসায়ন — মডেল টেস্ট ২০২৪',
    subject: 'chemistry',
    subjectBn: 'রসায়ন',
    year: 2024,
    board: 'ঢাকা বোর্ড',
    classLevel: 10,
    duration: 30,
    totalMarks: 30,
    negativeMarking: 0.25,
    questions: [
      // Chapter 1: রসায়নের ধারণা
      { id: 1, question: 'রসায়ন কোন বিজ্ঞানের শাখা?', options: opts('পদার্থবিজ্ঞান', 'প্রাকৃতিক বিজ্ঞান', 'ভৌত বিজ্ঞান', 'জীববিজ্ঞান'), correct: 2, explanation: 'রসায়ন ভৌত বিজ্ঞানের একটি শাখা।', chapter: 1 },

      // Chapter 2: পদার্থের অবস্থা
      { id: 2, question: 'পদার্থের মৌলিক অবস্থা কয়টি?', options: opts('২টি', '৩টি', '৪টি', '৫টি'), correct: 1, explanation: 'পদার্থের তিনটি মৌলিক অবস্থা: কঠিন, তরল ও বায়বীয়। প্লাজমা চতুর্থ অবস্থা।', chapter: 2 },
      { id: 3, question: 'গ্যাসের অণুগুলোর গতিশক্তি কিসের উপর নির্ভর করে?', options: opts('চাপ', 'আয়তন', 'তাপমাত্রা', 'ঘনত্ব'), correct: 2, explanation: 'গ্যাসের অণুগুলোর গড় গতিশক্তি পরম তাপমাত্রার সমানুপাতিক।', chapter: 2 },

      // Chapter 3: পদার্থের গঠন
      { id: 4, question: 'পরমাণুর কেন্দ্রে কী থাকে?', options: opts('ইলেকট্রন ও প্রোটন', 'প্রোটন ও নিউট্রন', 'ইলেকট্রন ও নিউট্রন', 'শুধু প্রোটন'), correct: 1, explanation: 'পরমাণুর কেন্দ্রে (নিউক্লিয়াসে) প্রোটন ও নিউট্রন থাকে।', chapter: 3 },
      { id: 5, question: 'পারমাণবিক সংখ্যা কী নির্দেশ করে?', options: opts('নিউট্রন সংখ্যা', 'প্রোটন সংখ্যা', 'ইলেকট্রন ও নিউট্রনের যোগফল', 'ভর সংখ্যা'), correct: 1, explanation: 'পারমাণবিক সংখ্যা = প্রোটন সংখ্যা = ইলেকট্রন সংখ্যা (নিরপেক্ষ পরমাণুতে)।', chapter: 3 },
      { id: 6, question: 'আইসোটোপ বলতে কী বোঝায়?', options: opts('একই প্রোটন, ভিন্ন নিউট্রন', 'একই নিউট্রন, ভিন্ন প্রোটন', 'একই ভর সংখ্যা', 'একই ইলেকট্রন বিন্যাস'), correct: 0, explanation: 'আইসোটোপ: একই মৌলের পরমাণু যাদের প্রোটন সংখ্যা একই কিন্তু নিউট্রন সংখ্যা ভিন্ন।', chapter: 3 },

      // Chapter 4: পর্যায় সারণি
      { id: 7, question: 'আধুনিক পর্যায় সারণিতে পর্যায় সংখ্যা কতটি?', options: opts('৫', '৬', '৭', '৮'), correct: 2, explanation: 'আধুনিক পর্যায় সারণিতে ৭টি পর্যায় আছে।', chapter: 4 },
      { id: 8, question: 'নিষ্ক্রিয় গ্যাস কোন গ্রুপে?', options: opts('গ্রুপ ১', 'গ্রুপ ১৭', 'গ্রুপ ১৮', 'গ্রুপ ২'), correct: 2, explanation: 'নিষ্ক্রিয় গ্যাস (He, Ne, Ar, Kr, Xe, Rn) গ্রুপ ১৮-তে অবস্থিত।', chapter: 4 },
      { id: 9, question: 'পর্যায় সারণিতে বাম থেকে ডানে গেলে পারমাণবিক ব্যাসার্ধ —', options: opts('বাড়ে', 'কমে', 'একই থাকে', 'প্রথমে বাড়ে পরে কমে'), correct: 1, explanation: 'পর্যায়ে বাম থেকে ডানে পারমাণবিক ব্যাসার্ধ কমে, কারণ নিউক্লীয় আধান বাড়ে।', chapter: 4 },

      // Chapter 5: রাসায়নিক বন্ধন
      { id: 10, question: 'NaCl-এ কোন ধরনের বন্ধন বিদ্যমান?', options: opts('সমযোজী', 'আয়নিক', 'ধাতব', 'হাইড্রোজেন'), correct: 1, explanation: 'NaCl (সোডিয়াম ক্লোরাইড) আয়নিক বন্ধনযুক্ত যৌগ।', chapter: 5 },
      { id: 11, question: 'সমযোজী বন্ধনে কী ঘটে?', options: opts('ইলেকট্রন স্থানান্তর', 'ইলেকট্রন শেয়ার', 'প্রোটন শেয়ার', 'নিউট্রন স্থানান্তর'), correct: 1, explanation: 'সমযোজী বন্ধনে দুটি পরমাণু ইলেকট্রন শেয়ার করে।', chapter: 5 },

      // Chapter 6: মোলের ধারণা
      { id: 12, question: 'অ্যাভোগাড্রো সংখ্যার মান কত?', options: opts('6.022 × 10²³', '6.022 × 10²²', '6.626 × 10⁻³⁴', '3 × 10⁸'), correct: 0, explanation: 'অ্যাভোগাড্রো সংখ্যা N_A = 6.022 × 10²³', chapter: 6 },
      { id: 13, question: '1 মোল পানির ভর কত?', options: opts('16 g', '18 g', '2 g', '32 g'), correct: 1, explanation: 'H₂O এর আণবিক ভর = 2(1) + 16 = 18। তাই 1 মোল পানির ভর 18 g।', chapter: 6 },

      // Chapter 7: রাসায়নিক বিক্রিয়া
      { id: 14, question: 'সংশ্লেষণ বিক্রিয়ায় কী ঘটে?', options: opts('এক পদার্থ ভাঙে', 'দুই পদার্থ মিলে এক হয়', 'ইলেকট্রন হারায়', 'তাপ শোষণ হয়'), correct: 1, explanation: 'সংশ্লেষণ বিক্রিয়ায় দুই বা ততোধিক পদার্থ মিলে একটি নতুন পদার্থ তৈরি হয়।', chapter: 7 },
      { id: 15, question: 'জারণ বিক্রিয়ায় কী ঘটে?', options: opts('ইলেকট্রন গ্রহণ', 'ইলেকট্রন বর্জন', 'প্রোটন গ্রহণ', 'নিউট্রন বর্জন'), correct: 1, explanation: 'জারণ = ইলেকট্রন বর্জন (Oxidation Is Loss)।', chapter: 7 },

      // Chapter 8: রাসায়নিক পরিবর্তন
      { id: 16, question: 'তাপোৎপাদী বিক্রিয়ায় —', options: opts('তাপ শোষিত হয়', 'তাপ উৎপন্ন হয়', 'তাপ পরিবর্তন হয় না', 'আলো উৎপন্ন হয়'), correct: 1, explanation: 'তাপোৎপাদী বিক্রিয়ায় তাপ উৎপন্ন হয় (exothermic)।', chapter: 8 },
      { id: 17, question: 'ভিনেগারে কোন এসিড থাকে?', options: opts('হাইড্রোক্লোরিক', 'সালফিউরিক', 'এসিটিক', 'নাইট্রিক'), correct: 2, explanation: 'ভিনেগারে এসিটিক এসিড (CH₃COOH) থাকে।', chapter: 8 },

      // Chapter 9: এসিড-ক্ষার সাম্যাবস্থা
      { id: 18, question: 'pH = 7 হলে দ্রবণটি —', options: opts('এসিডিক', 'ক্ষারীয়', 'নিরপেক্ষ', 'তীব্র এসিড'), correct: 2, explanation: 'pH = 7 নিরপেক্ষ দ্রবণ (বিশুদ্ধ পানি)।', chapter: 9 },
      { id: 19, question: 'pH < 7 হলে দ্রবণটি —', options: opts('ক্ষারীয়', 'নিরপেক্ষ', 'এসিডিক', 'লবণাক্ত'), correct: 2, explanation: 'pH < 7 মানে H⁺ আয়ন বেশি, তাই দ্রবণ এসিডিক।', chapter: 9 },
      { id: 20, question: 'লিটমাস পেপার নীল থেকে লাল হলে —', options: opts('ক্ষার উপস্থিত', 'এসিড উপস্থিত', 'লবণ উপস্থিত', 'পানি উপস্থিত'), correct: 1, explanation: 'এসিড নীল লিটমাসকে লাল করে।', chapter: 9 },

      // Chapter 10: খনিজ সম্পদ
      { id: 21, question: 'লোহার আকরিক কোনটি?', options: opts('বক্সাইট', 'হেমাটাইট', 'চুনাপাথর', 'জিপসাম'), correct: 1, explanation: 'হেমাটাইট (Fe₂O₃) লোহার প্রধান আকরিক।', chapter: 10 },
      { id: 22, question: 'পেট্রোলিয়ামের প্রধান উপাদান কী?', options: opts('হাইড্রোকার্বন', 'কার্বনেট', 'সালফেট', 'নাইট্রেট'), correct: 0, explanation: 'পেট্রোলিয়াম মূলত হাইড্রোকার্বনের মিশ্রণ।', chapter: 10 },

      // Chapter 11: জীবনযাত্রায় রসায়ন
      { id: 23, question: 'সাবানের রাসায়নিক নাম কী?', options: opts('সোডিয়াম ক্লোরাইড', 'সোডিয়াম স্টিয়ারেট', 'ক্যালসিয়াম কার্বনেট', 'সোডিয়াম বাইকার্বনেট'), correct: 1, explanation: 'সাবান হলো উচ্চতর ফ্যাটি এসিডের সোডিয়াম বা পটাসিয়াম লবণ।', chapter: 11 },
      { id: 24, question: 'ব্লিচিং পাউডারের সংকেত কী?', options: opts('NaOCl', 'Ca(OCl)Cl', 'CaCO₃', 'NaHCO₃'), correct: 1, explanation: 'ব্লিচিং পাউডার = Ca(OCl)Cl (ক্যালসিয়াম হাইপোক্লোরাইট)।', chapter: 11 },

      // Mixed
      { id: 25, question: 'ক্যাটায়ন কী?', options: opts('ঋণাত্মক আয়ন', 'ধনাত্মক আয়ন', 'নিরপেক্ষ পরমাণু', 'অণু'), correct: 1, explanation: 'ক্যাটায়ন ধনাত্মক আয়ন — ইলেকট্রন হারিয়ে তৈরি হয়।', chapter: 3 },
      { id: 26, question: 'মিথেনের সংকেত কী?', options: opts('CH₃OH', 'C₂H₆', 'CH₄', 'C₂H₄'), correct: 2, explanation: 'মিথেন (CH₄) সবচেয়ে সরল হাইড্রোকার্বন।', chapter: 11 },
      { id: 27, question: 'পানির রাসায়নিক সংকেত কী?', options: opts('HO', 'H₂O', 'H₂O₂', 'OH⁻'), correct: 1, explanation: 'পানির সংকেত H₂O — দুটি হাইড্রোজেন ও একটি অক্সিজেন।', chapter: 6 },
      { id: 28, question: 'কোনটি তীব্র এসিড?', options: opts('এসিটিক এসিড', 'কার্বনিক এসিড', 'হাইড্রোক্লোরিক এসিড', 'সাইট্রিক এসিড'), correct: 2, explanation: 'HCl (হাইড্রোক্লোরিক এসিড) তীব্র এসিড — সম্পূর্ণ বিয়োজিত হয়।', chapter: 9 },
      { id: 29, question: 'সোডিয়ামের ইলেকট্রন বিন্যাস কী?', options: opts('2, 8', '2, 8, 1', '2, 8, 2', '2, 8, 8'), correct: 1, explanation: 'Na (Z=11): ইলেকট্রন বিন্যাস 2, 8, 1।', chapter: 3 },
      { id: 30, question: 'রাসায়নিক সমীকরণ সমতা করার নিয়ম কোনটি?', options: opts('ভর সংরক্ষণ সূত্র', 'শক্তি সংরক্ষণ সূত্র', 'চাপের সূত্র', 'গতির সূত্র'), correct: 0, explanation: 'রাসায়নিক সমীকরণ সমতা করা হয় ভর সংরক্ষণ সূত্র অনুযায়ী — বিক্রিয়ক ও উৎপাদের পরমাণু সংখ্যা সমান।', chapter: 7 },
    ],
  },

  // ──────────────────────────────────────────
  // 3. জীববিজ্ঞান — SSC 2024 Model
  // ──────────────────────────────────────────
  {
    id: 'ssc-2024-biology',
    title: 'এসএসসি জীববিজ্ঞান — মডেল টেস্ট ২০২৪',
    subject: 'biology',
    subjectBn: 'জীববিজ্ঞান',
    year: 2024,
    board: 'ঢাকা বোর্ড',
    classLevel: 10,
    duration: 30,
    totalMarks: 30,
    negativeMarking: 0.25,
    questions: [
      // Chapter 1: জীবন পাঠ
      { id: 1, question: 'জীববিজ্ঞানের জনক কে?', options: opts('ডারউইন', 'অ্যারিস্টটল', 'লিনিয়াস', 'মেন্ডেল'), correct: 1, explanation: 'অ্যারিস্টটলকে জীববিজ্ঞানের জনক বলা হয়।', chapter: 1 },

      // Chapter 2: কোষ ও কোষের গঠন
      { id: 2, question: 'কোষের ক্ষমতাঘর কোনটি?', options: opts('রাইবোজোম', 'মাইটোকন্ড্রিয়া', 'নিউক্লিয়াস', 'গলজি বডি'), correct: 1, explanation: 'মাইটোকন্ড্রিয়া কোষের ক্ষমতাঘর — এখানে ATP উৎপন্ন হয়।', chapter: 2 },
      { id: 3, question: 'DNA-র পূর্ণরূপ কী?', options: opts('Deoxyribo Nucleic Acid', 'Di Nucleic Acid', 'Dyna Nucleic Acid', 'Dual Nucleic Acid'), correct: 0, explanation: 'DNA = Deoxyribonucleic Acid (ডিঅক্সিরাইবোনিউক্লিক এসিড)।', chapter: 2 },
      { id: 4, question: 'প্রোক্যারিওটিক কোষে কোনটি নেই?', options: opts('রাইবোজোম', 'কোষঝিল্লি', 'নিউক্লিয়াস ঝিল্লি', 'DNA'), correct: 2, explanation: 'প্রোক্যারিওটিক কোষে সুগঠিত নিউক্লিয়াস ঝিল্লি থাকে না।', chapter: 2 },

      // Chapter 3: কোষ বিভাজন
      { id: 5, question: 'মাইটোসিস কোষ বিভাজনে ক্রোমোজোম সংখ্যা —', options: opts('অর্ধেক হয়', 'দ্বিগুণ হয়', 'অপরিবর্তিত থাকে', 'তিনগুণ হয়'), correct: 2, explanation: 'মাইটোসিসে ক্রোমোজোম সংখ্যা অপরিবর্তিত থাকে (2n → 2n)।', chapter: 3 },
      { id: 6, question: 'মিয়োসিস কোষ বিভাজন কোথায় ঘটে?', options: opts('দেহকোষে', 'জনন কোষে', 'স্নায়ুকোষে', 'রক্তকোষে'), correct: 1, explanation: 'মিয়োসিস জননকোষ তৈরির সময় ঘটে — ক্রোমোজোম অর্ধেক হয়।', chapter: 3 },

      // Chapter 4: জীবনীশক্তি
      { id: 7, question: 'সালোকসংশ্লেষণের কাঁচামাল কোনটি?', options: opts('O₂ ও গ্লুকোজ', 'CO₂ ও H₂O', 'N₂ ও H₂O', 'CO₂ ও O₂'), correct: 1, explanation: 'সালোকসংশ্লেষণ: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', chapter: 4 },
      { id: 8, question: 'শ্বসনে কোন গ্যাস নির্গত হয়?', options: opts('O₂', 'CO₂', 'N₂', 'H₂'), correct: 1, explanation: 'শ্বসনে গ্লুকোজ ভেঙে CO₂ ও H₂O তৈরি হয় এবং ATP মুক্ত হয়।', chapter: 4 },
      { id: 9, question: 'সালোকসংশ্লেষণের আলোক নির্ভর বিক্রিয়া কোথায় ঘটে?', options: opts('স্ট্রোমায়', 'থাইলাকয়েডে', 'মাইটোকন্ড্রিয়ায়', 'রাইবোজোমে'), correct: 1, explanation: 'আলোক নির্ভর বিক্রিয়া ক্লোরোপ্লাস্টের থাইলাকয়েড ঝিল্লিতে ঘটে।', chapter: 4 },

      // Chapter 5: খাদ্য, পুষ্টি ও পরিপাক
      { id: 10, question: 'ভিটামিন C-র অভাবে কোন রোগ হয়?', options: opts('রিকেট', 'স্কার্ভি', 'বেরিবেরি', 'রাতকানা'), correct: 1, explanation: 'ভিটামিন C-র অভাবে স্কার্ভি রোগ হয়।', chapter: 5 },
      { id: 11, question: 'প্রোটিন পরিপাকের এনজাইম কোনটি?', options: opts('অ্যামাইলেজ', 'লাইপেজ', 'পেপসিন', 'মল্টেজ'), correct: 2, explanation: 'পেপসিন পাকস্থলীতে প্রোটিন ভাঙতে সাহায্য করে।', chapter: 5 },

      // Chapter 6: পরিবহন
      { id: 12, question: 'মানুষের রক্তে লোহিত রক্তকণিকায় কী থাকে?', options: opts('মেলানিন', 'হিমোগ্লোবিন', 'ক্লোরোফিল', 'ক্যারোটিন'), correct: 1, explanation: 'হিমোগ্লোবিন O₂ বহন করে — এটি লোহিত রক্তকণিকায় থাকে।', chapter: 6 },
      { id: 13, question: 'হৃৎপিণ্ডের কোন প্রকোষ্ঠ থেকে মহাধমনী বের হয়?', options: opts('ডান অলিন্দ', 'বাম অলিন্দ', 'ডান নিলয়', 'বাম নিলয়'), correct: 3, explanation: 'বাম নিলয় থেকে মহাধমনী (aorta) বের হয়ে সারা দেহে রক্ত সরবরাহ করে।', chapter: 6 },

      // Chapter 7: গ্যাসীয় বিনিময়
      { id: 14, question: 'মানুষের শ্বাসতন্ত্রের প্রধান অঙ্গ কোনটি?', options: opts('হৃৎপিণ্ড', 'যকৃৎ', 'ফুসফুস', 'বৃক্ক'), correct: 2, explanation: 'ফুসফুসে O₂ ও CO₂-র গ্যাসীয় বিনিময় ঘটে।', chapter: 7 },
      { id: 15, question: 'ডায়াফ্রাম কোন প্রক্রিয়ায় সাহায্য করে?', options: opts('পরিপাক', 'শ্বাসক্রিয়া', 'রেচন', 'প্রজনন'), correct: 1, explanation: 'ডায়াফ্রাম শ্বাসক্রিয়ায় সাহায্য করে — সংকুচিত হলে ফুসফুসে বাতাস ঢোকে।', chapter: 7 },

      // Chapter 8: রেচন প্রক্রিয়া
      { id: 16, question: 'মানবদেহে রেচনের প্রধান অঙ্গ কোনটি?', options: opts('যকৃৎ', 'ফুসফুস', 'বৃক্ক', 'ত্বক'), correct: 2, explanation: 'বৃক্ক (kidney) রেচনের প্রধান অঙ্গ — রক্ত থেকে বর্জ্য পদার্থ ছাঁকে।', chapter: 8 },
      { id: 17, question: 'নেফ্রন কী?', options: opts('বৃক্কের কার্যকরী একক', 'যকৃতের একক', 'ফুসফুসের একক', 'হৃদযন্ত্রের একক'), correct: 0, explanation: 'নেফ্রন বৃক্কের গঠনগত ও কার্যগত একক।', chapter: 8 },

      // Chapter 9: দৃঢ়তা প্রদান ও চলন
      { id: 18, question: 'মানবদেহে মোট হাড়ের সংখ্যা কত?', options: opts('১৮৬', '২০৬', '২১৬', '২২৬'), correct: 1, explanation: 'প্রাপ্তবয়স্ক মানবদেহে ২০৬টি হাড় থাকে।', chapter: 9 },

      // Chapter 10: সমন্বয়
      { id: 19, question: 'মানুষের স্নায়ুতন্ত্রের প্রধান অংশ কোনটি?', options: opts('মেরুদণ্ড', 'মস্তিষ্ক ও সুষুম্নাকাণ্ড', 'যকৃৎ', 'হৃৎপিণ্ড'), correct: 1, explanation: 'কেন্দ্রীয় স্নায়ুতন্ত্র = মস্তিষ্ক + সুষুম্নাকাণ্ড।', chapter: 10 },
      { id: 20, question: 'ইনসুলিন কোন গ্রন্থি থেকে নিঃসৃত হয়?', options: opts('থাইরয়েড', 'অগ্ন্যাশয়', 'পিটুইটারি', 'অ্যাড্রেনাল'), correct: 1, explanation: 'ইনসুলিন অগ্ন্যাশয়ের আইলেটস অফ ল্যাঙ্গারহ্যান্স থেকে নিঃসৃত হয়।', chapter: 10 },

      // Chapter 11: প্রজনন
      { id: 21, question: 'মানুষের ক্রোমোজোম সংখ্যা কত?', options: opts('২৩', '৪৪', '৪৬', '৪৮'), correct: 2, explanation: 'মানুষের দেহকোষে ৪৬টি (২৩ জোড়া) ক্রোমোজোম থাকে।', chapter: 11 },
      { id: 22, question: 'X ও Y ক্রোমোজোম কী নির্ধারণ করে?', options: opts('রক্তের গ্রুপ', 'লিঙ্গ', 'উচ্চতা', 'গায়ের রং'), correct: 1, explanation: 'XX = মেয়ে, XY = ছেলে — লিঙ্গ নির্ধারণ করে।', chapter: 11 },

      // Chapter 12: জীবের বংশগতি ও বিবর্তন
      { id: 23, question: 'বংশগতির জনক কে?', options: opts('ডারউইন', 'মেন্ডেল', 'ল্যামার্ক', 'ওয়ালেস'), correct: 1, explanation: 'গ্রেগর জোহান মেন্ডেলকে বংশগতিবিদ্যার জনক বলা হয়।', chapter: 12 },
      { id: 24, question: 'জিনের রাসায়নিক ভিত্তি কী?', options: opts('RNA', 'DNA', 'প্রোটিন', 'লিপিড'), correct: 1, explanation: 'জিনের রাসায়নিক ভিত্তি DNA (ডিঅক্সিরাইবোনিউক্লিক এসিড)।', chapter: 12 },
      { id: 25, question: 'বিবর্তনবাদের প্রবক্তা কে?', options: opts('মেন্ডেল', 'ডারউইন', 'ল্যামার্ক', 'লিনিয়াস'), correct: 1, explanation: 'চার্লস ডারউইন প্রাকৃতিক নির্বাচনের মাধ্যমে বিবর্তনবাদ প্রস্তাব করেন।', chapter: 12 },

      // Chapter 13: জীবের পরিবেশ
      { id: 26, question: 'বাস্তুতন্ত্রের শক্তির প্রধান উৎস কী?', options: opts('পানি', 'মাটি', 'সূর্য', 'বায়ু'), correct: 2, explanation: 'বাস্তুতন্ত্রের সকল শক্তির মূল উৎস সূর্য।', chapter: 13 },
      { id: 27, question: 'খাদ্য শৃঙ্খলে প্রথম স্তরে কারা থাকে?', options: opts('তৃণভোজী', 'মাংসভোজী', 'উৎপাদক', 'বিয়োজক'), correct: 2, explanation: 'খাদ্য শৃঙ্খলে প্রথমে উৎপাদক (সবুজ উদ্ভিদ) থাকে।', chapter: 13 },
      { id: 28, question: 'ওজোন স্তর কোন রশ্মি শোষণ করে?', options: opts('দৃশ্যমান আলো', 'অবলোহিত রশ্মি', 'অতিবেগুনি রশ্মি', 'এক্স-রে'), correct: 2, explanation: 'ওজোন স্তর ক্ষতিকর অতিবেগুনি (UV) রশ্মি শোষণ করে পৃথিবীকে রক্ষা করে।', chapter: 13 },
      { id: 29, question: 'গ্রিনহাউস গ্যাসের উদাহরণ কোনটি?', options: opts('O₂', 'N₂', 'CO₂', 'H₂'), correct: 2, explanation: 'CO₂ প্রধান গ্রিনহাউস গ্যাস — বায়ুমণ্ডলে তাপ আটকে রাখে।', chapter: 13 },
      { id: 30, question: 'সুন্দরবনের প্রধান বৃক্ষ কোনটি?', options: opts('সেগুন', 'সুন্দরী', 'শিমুল', 'মেহগনি'), correct: 1, explanation: 'সুন্দরবনের নাম সুন্দরী বৃক্ষ থেকে এসেছে।', chapter: 13 },
    ],
  },
];

// ── Helper: Get exam by ID ──
export function getExam(id: string): ExamPaper | undefined {
  return EXAMS.find((e) => e.id === id);
}

// ── Helper: Get exams by subject ──
export function getExamsBySubject(subject: string): ExamPaper[] {
  return EXAMS.filter((e) => e.subject === subject);
}
