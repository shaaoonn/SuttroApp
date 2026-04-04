// ─────────────────────────────────────────────
// Simulation Narration Templates — সূত্র TTS
// Welcome messages + contextual feedback generators
// for all 13 simulations.
// ─────────────────────────────────────────────

import type { NarrationTemplate } from '@/hooks/useSimNarration';

// Helper — round nicely
const r = (n: number, d = 2) => Number(n.toFixed(d));

// ─────────────────── PHYSICS ───────────────────

const ohmsLaw: NarrationTemplate = {
  welcome:
    'এটি ওহমের সূত্রের সিমুলেশন। ভোল্টেজ ও রোধ স্লাইডার পরিবর্তন করে দেখো কারেন্ট কীভাবে বদলায়।',
  generateMessage: (v) => {
    const voltage = v.voltage ?? 6;
    const resistance = v.resistance ?? 10;
    const current = r(voltage / resistance, 3);
    const power = r(voltage * current, 2);
    return `ভোল্টেজ ${voltage} ভোল্ট, রোধ ${resistance} ওহম। কারেন্ট হচ্ছে ${current} অ্যাম্পিয়ার এবং পাওয়ার ${power} ওয়াট।`;
  },
};

const lightReflection: NarrationTemplate = {
  welcome:
    'এটি আলোর প্রতিফলন পরীক্ষা। আপতন কোণ পরিবর্তন করে দেখো প্রতিফলন কোণ কীভাবে সমান থাকে।',
  generateMessage: (v) => {
    const angle = v.incidenceAngle ?? 45;
    const mirror = v.mirrorLength ?? 200;
    return `আপতন কোণ ${angle} ডিগ্রি, তাই প্রতিফলন কোণও ${angle} ডিগ্রি। দর্পণের দৈর্ঘ্য ${mirror} সেন্টিমিটার।`;
  },
};

const lightRefraction: NarrationTemplate = {
  welcome:
    'এটি আলোর প্রতিসরণ পরীক্ষা। স্লাইডার থেকে আপতন কোণ ও প্রতিসরাঙ্ক পরিবর্তন করে দেখো কী ঘটে।',
  generateMessage: (v) => {
    const angle = v.incidenceAngle ?? 30;
    const n1 = v.n1 ?? 1.5;
    const n2 = v.n2 ?? 1.0;
    const sinRefracted = (n1 * Math.sin((angle * Math.PI) / 180)) / n2;
    if (n1 > n2) {
      const criticalAngle = r((Math.asin(n2 / n1) * 180) / Math.PI, 1);
      if (sinRefracted >= 1) {
        return `আপতন কোণ ${angle} ডিগ্রি। ক্রান্তি কোণ ${criticalAngle} ডিগ্রি ছাড়িয়ে গেছে — পূর্ণ অভ্যন্তরীণ প্রতিফলন ঘটছে!`;
      }
      const refrAngle = r((Math.asin(sinRefracted) * 180) / Math.PI, 1);
      return `আপতন কোণ ${angle} ডিগ্রি, প্রতিসরণ কোণ ${refrAngle} ডিগ্রি। ক্রান্তি কোণ ${criticalAngle} ডিগ্রি।`;
    }
    if (sinRefracted >= 1) {
      return `আপতন কোণ ${angle} ডিগ্রি। প্রতিসরাঙ্ক n1 = ${n1}, n2 = ${n2}।`;
    }
    const refrAngle = r((Math.asin(sinRefracted) * 180) / Math.PI, 1);
    return `আপতন কোণ ${angle} ডিগ্রি, প্রতিসরণ কোণ ${refrAngle} ডিগ্রি। হালকা মাধ্যম থেকে ঘন মাধ্যমে যাচ্ছে — আলো অভিলম্বের দিকে বেঁকে যাচ্ছে।`;
  },
};

// ─────────────────── CHEMISTRY ───────────────────

const acidBase: NarrationTemplate = {
  welcome:
    'এটি অ্যাসিড-ক্ষার ও pH স্কেল সিমুলেশন। অ্যাসিড ও ক্ষারের পরিমাণ বাড়িয়ে-কমিয়ে দেখো pH কীভাবে বদলায়।',
  generateMessage: (v) => {
    const acidVol = v.acidVolume ?? 0;
    const baseVol = v.baseVolume ?? 0;
    const acidStr = v.acidStrength ?? 1.0;
    const baseStr = v.baseStrength ?? 1.0;
    const totalVol = acidVol + baseVol;
    if (totalVol === 0) return 'বিকারে কোনো দ্রবণ নেই। অ্যাসিড বা ক্ষার যোগ করো।';
    const acidMoles = acidVol * acidStr / 1000;
    const baseMoles = baseVol * baseStr / 1000;
    const netMoles = acidMoles - baseMoles;
    let ph: number;
    if (Math.abs(netMoles) < 1e-10) {
      ph = 7;
    } else if (netMoles > 0) {
      ph = Math.max(0, -Math.log10((netMoles / (totalVol / 1000))));
    } else {
      const pOH = Math.max(0, -Math.log10((-netMoles / (totalVol / 1000))));
      ph = Math.min(14, 14 - pOH);
    }
    const nature = ph < 6.5 ? 'অ্যাসিডিক' : ph > 7.5 ? 'ক্ষারীয়' : 'প্রশম';
    return `অ্যাসিড ${acidVol} মিলিলিটার, ক্ষার ${baseVol} মিলিলিটার। pH মান ${r(ph, 1)}। দ্রবণটি ${nature}।`;
  },
};

const atomicStructure: NarrationTemplate = {
  welcome:
    'এটি পরমাণুর গঠন — বোর মডেল সিমুলেশন। পারমাণবিক সংখ্যা পরিবর্তন করে বিভিন্ন মৌলের ইলেকট্রন বিন্যাস দেখো।',
  generateMessage: (v) => {
    const z = Math.round(v.atomicNumber ?? 1);
    const ELEMENT_NAMES: Record<number, string> = {
      1: 'হাইড্রোজেন', 2: 'হিলিয়াম', 3: 'লিথিয়াম', 4: 'বেরিলিয়াম',
      5: 'বোরন', 6: 'কার্বন', 7: 'নাইট্রোজেন', 8: 'অক্সিজেন',
      9: 'ফ্লোরিন', 10: 'নিয়ন', 11: 'সোডিয়াম', 12: 'ম্যাগনেসিয়াম',
      13: 'অ্যালুমিনিয়াম', 14: 'সিলিকন', 15: 'ফসফরাস', 16: 'সালফার',
      17: 'ক্লোরিন', 18: 'আর্গন', 19: 'পটাসিয়াম', 20: 'ক্যালসিয়াম',
    };
    const name = ELEMENT_NAMES[z] || `মৌল ${z}`;
    // Compute electron config
    const maxPerShell = [2, 8, 8, 2];
    const shells: number[] = [];
    let remaining = z;
    for (const max of maxPerShell) {
      if (remaining <= 0) break;
      const inShell = Math.min(remaining, max);
      shells.push(inShell);
      remaining -= inShell;
    }
    const config = shells.join(', ');
    return `মৌল ${name}, পারমাণবিক সংখ্যা ${z}। ইলেকট্রন বিন্যাস: ${config}। প্রোটন সংখ্যা ${z}।`;
  },
};

// ─────────────────── BIOLOGY ───────────────────

const PHASE_NAMES = ['ইন্টারফেজ', 'প্রোফেজ', 'মেটাফেজ', 'অ্যানাফেজ', 'টেলোফেজ', 'সাইটোকাইনেসিস'];

const cellDivision: NarrationTemplate = {
  welcome:
    'এটি কোষ বিভাজন — মাইটোসিস সিমুলেশন। ধাপ পরিবর্তন করে দেখো কোষ কীভাবে বিভাজিত হয়।',
  generateMessage: (v) => {
    const phase = Math.round(v.phase ?? 0);
    const phaseName = PHASE_NAMES[phase] || `ধাপ ${phase}`;
    const speed = v.speed ?? 1;
    const descriptions: Record<number, string> = {
      0: 'DNA প্রতিলিপি তৈরি হচ্ছে, কোষ বৃদ্ধি পাচ্ছে।',
      1: 'ক্রোমাটিন কুণ্ডলিত হয়ে ক্রোমোজোম তৈরি হচ্ছে।',
      2: 'ক্রোমোজোমগুলো কোষের মধ্যরেখায় সজ্জিত হচ্ছে।',
      3: 'ক্রোমাটিড বিভক্ত হয়ে বিপরীত মেরুতে যাচ্ছে।',
      4: 'নতুন নিউক্লিয়ার মেমব্রেন তৈরি হচ্ছে।',
      5: 'সাইটোপ্লাজম বিভক্ত হয়ে দুটি কোষ তৈরি হচ্ছে।',
    };
    return `বর্তমান ধাপ: ${phaseName}। ${descriptions[phase] || ''} অ্যানিমেশন গতি ${speed} গুণ।`;
  },
};

const photosynthesis: NarrationTemplate = {
  welcome:
    'এটি সালোকসংশ্লেষণ সিমুলেশন। আলো, কার্বন ডাই-অক্সাইড ও পানির পরিমাণ বদলে দেখো সালোকসংশ্লেষণ কীভাবে প্রভাবিত হয়।',
  generateMessage: (v) => {
    const light = v.lightIntensity ?? 50;
    const co2 = v.co2Level ?? 50;
    const water = v.waterLevel ?? 50;
    const rate = r(Math.min(light, co2, water) / 100, 2);
    const ratePercent = Math.round(rate * 100);
    let status = '';
    if (light === 0) status = ' আলো নেই — সালোকসংশ্লেষণ বন্ধ।';
    else if (co2 === 0) status = ' কার্বন ডাই-অক্সাইড নেই — সালোকসংশ্লেষণ বন্ধ।';
    else if (water === 0) status = ' পানি নেই — সালোকসংশ্লেষণ বন্ধ।';
    else status = ` সালোকসংশ্লেষণের হার প্রায় ${ratePercent} শতাংশ।`;
    return `আলোর তীব্রতা ${light} শতাংশ, CO2 ${co2} শতাংশ, পানি ${water} শতাংশ।${status}`;
  },
};

// ─────────────────── MATH ───────────────────

const pythagorean: NarrationTemplate = {
  welcome:
    'এটি পিথাগোরাসের উপপাদ্যের সিমুলেশন। ভূমি ও লম্বের মান পরিবর্তন করে দেখো অতিভুজ কীভাবে বদলায়।',
  generateMessage: (v) => {
    const a = v.sideA ?? 3;
    const b = v.sideB ?? 4;
    const c = r(Math.sqrt(a * a + b * b), 2);
    return `ভূমি a = ${a}, লম্ব b = ${b}। অতিভুজ c = ${c}। কারণ ${a} বর্গ যোগ ${b} বর্গ সমান ${r(a * a + b * b, 2)}, যার বর্গমূল ${c}।`;
  },
};

const circleGeometry: NarrationTemplate = {
  welcome:
    'এটি বৃত্তের ক্ষেত্রফল ও পরিধির সিমুলেশন। ব্যাসার্ধ পরিবর্তন করে দেখো ক্ষেত্রফল ও পরিধি কীভাবে বদলায়।',
  generateMessage: (v) => {
    const radius = v.radius ?? 5;
    const area = r(Math.PI * radius * radius, 2);
    const circumference = r(2 * Math.PI * radius, 2);
    return `ব্যাসার্ধ ${radius}। ক্ষেত্রফল পাই আর স্কয়ার = ${area} বর্গ একক। পরিধি 2 পাই আর = ${circumference} একক।`;
  },
};

// ─────────────────── HIGHER MATH ───────────────────

const trigonometry: NarrationTemplate = {
  welcome:
    'এটি ত্রিকোণমিতিক অনুপাতের সিমুলেশন। কোণ পরিবর্তন করে দেখো সাইন, কোসাইন ও ট্যানজেন্ট কীভাবে বদলায়।',
  generateMessage: (v) => {
    const angle = v.angle ?? 45;
    const rad = (angle * Math.PI) / 180;
    const sinVal = r(Math.sin(rad), 4);
    const cosVal = r(Math.cos(rad), 4);
    const tanVal = Math.abs(Math.cos(rad)) < 0.001 ? 'অসীম' : r(Math.tan(rad), 4).toString();
    return `কোণ থিটা = ${angle} ডিগ্রি। সাইন = ${sinVal}, কোসাইন = ${cosVal}, ট্যানজেন্ট = ${tanVal}।`;
  },
};

const straightLine: NarrationTemplate = {
  welcome:
    'এটি সরলরেখার সমীকরণ সিমুলেশন। ঢাল ও y-ছেদাংশ পরিবর্তন করে দেখো রেখা কীভাবে বদলায়।',
  generateMessage: (v) => {
    const m = v.slope ?? 1;
    const c = v.intercept ?? 0;
    let equation = 'y = ';
    if (m === 0) {
      equation += `${c}`;
    } else if (m === 1) {
      equation += c === 0 ? 'x' : c > 0 ? `x + ${c}` : `x - ${Math.abs(c)}`;
    } else if (m === -1) {
      equation += c === 0 ? '-x' : c > 0 ? `-x + ${c}` : `-x - ${Math.abs(c)}`;
    } else {
      equation += c === 0 ? `${m}x` : c > 0 ? `${m}x + ${c}` : `${m}x - ${Math.abs(c)}`;
    }
    const angleWithX = r((Math.atan(m) * 180) / Math.PI, 1);
    return `সমীকরণ ${equation}। ঢাল ${m}, y-ছেদাংশ ${c}। x-অক্ষের সাথে কোণ ${angleWithX} ডিগ্রি।`;
  },
};

// ─────────────────── ENGLISH ───────────────────

const SENTENCE_TYPE_NAMES = ['বিবৃতিমূলক', 'প্রশ্নবোধক', 'আদেশমূলক', 'বিস্ময়সূচক', 'নেতিবাচক'];

const sentenceStructure: NarrationTemplate = {
  welcome:
    'এটি ইংরেজি বাক্য গঠনের সিমুলেশন। বিভিন্ন ধরনের বাক্য নির্বাচন করে Subject, Verb, Object চিনতে শেখো।',
  generateMessage: (v) => {
    const type = Math.round(v.sentenceType ?? 0);
    const typeName = SENTENCE_TYPE_NAMES[type] || 'সাধারণ';
    return `বাক্যের ধরন: ${typeName}। Subject হলো কর্তা, Verb হলো ক্রিয়া, এবং Object হলো কর্ম।`;
  },
};

const TENSE_GROUP_NAMES = ['অতীত', 'বর্তমান', 'ভবিষ্যৎ'];
const SUB_TYPE_NAMES = ['সাধারণ', 'চলমান', 'পূর্ণ', 'পূর্ণ চলমান'];

const tenseTimeline: NarrationTemplate = {
  welcome:
    'এটি টেন্স টাইমলাইন সিমুলেশন। কালের প্রকার ও উপ-প্রকার পরিবর্তন করে ১২টি টেন্স শেখো।',
  generateMessage: (v) => {
    const group = Math.round(v.tenseGroup ?? 0);
    const sub = Math.round(v.subType ?? 0);
    const groupName = TENSE_GROUP_NAMES[group] || 'বর্তমান';
    const subName = SUB_TYPE_NAMES[sub] || 'সাধারণ';
    return `কাল: ${groupName} ${subName}। ৩টি কাল ও ৪টি রূপ মিলিয়ে মোট ১২টি টেন্স তৈরি হয়।`;
  },
};

// ─────────────────── EXPORT MAP ───────────────────

/** Narration template map — keyed by simulation slug */
export const SIM_NARRATIONS: Record<string, NarrationTemplate> = {
  'ohms-law': ohmsLaw,
  'light-reflection': lightReflection,
  'light-refraction': lightRefraction,
  'acid-base': acidBase,
  'atomic-structure': atomicStructure,
  'cell-division': cellDivision,
  'photosynthesis': photosynthesis,
  'pythagorean': pythagorean,
  'circle-geometry': circleGeometry,
  'trigonometry': trigonometry,
  'straight-line': straightLine,
  'sentence-structure': sentenceStructure,
  'tense-timeline': tenseTimeline,
};
