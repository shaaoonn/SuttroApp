import { getSupabase } from './supabase-server';

// ─────────────────────────────────────────────
// Site Content — Fetch dynamic text from DB
// Used by server components to get CMS content
// Falls back to hardcoded defaults if DB unavailable
// ─────────────────────────────────────────────

export type ContentMap = Record<string, string>;

// In-memory cache (per server instance, refreshed every 10s)
let cache: Record<string, ContentMap> = {};
let cacheTime = 0;
const CACHE_TTL = 10_000; // 10 seconds

export function clearCache() {
  cache = {};
  cacheTime = 0;
}

export async function getSiteContent(page: string): Promise<ContentMap> {
  const now = Date.now();
  if (cache[page] && now - cacheTime < CACHE_TTL) {
    return cache[page];
  }

  const sb = getSupabase();
  if (!sb) return DEFAULTS[page] || {};

  try {
    const { data } = await sb
      .from('site_content')
      .select('key, value')
      .eq('page', page)
      .order('sort_order');

    if (data && data.length > 0) {
      const map: ContentMap = {};
      for (const row of data) {
        map[row.key] = row.value;
      }
      cache[page] = map;
      cacheTime = now;
      return map;
    }
  } catch {
    // Fall through to defaults
  }

  return DEFAULTS[page] || {};
}

export async function getAllSiteContent(): Promise<Record<string, ContentMap>> {
  const sb = getSupabase();
  if (!sb) return DEFAULTS;

  try {
    const { data } = await sb
      .from('site_content')
      .select('page, key, value')
      .order('sort_order');

    if (data && data.length > 0) {
      const result: Record<string, ContentMap> = {};
      for (const row of data) {
        if (!result[row.page]) result[row.page] = {};
        result[row.page][row.key] = row.value;
      }
      cache = result;
      cacheTime = Date.now();
      return result;
    }
  } catch {
    // Fall through
  }

  return DEFAULTS;
}

// ── Hardcoded defaults (used if DB is unavailable) ──
const DEFAULTS: Record<string, ContentMap> = {
  home: {
    welcome_logged_in: 'আজ কী শিখবে? তোমার পড়াশোনা শুরু করো।',
    welcome_guest_title: 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো',
    welcome_guest_subtitle: 'ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স — NCTB পাঠ্যবইয়ের প্রতিটি অধ্যায়।',
    daily_study_title: 'আজকের পড়া',
    daily_study_subtitle: 'ক্লাস, MCQ, বাড়ির কাজ',
    new_class_label: 'নতুন ক্লাস!',
    recent_classes_title: 'সাম্প্রতিক ক্লাস',
    all_classes_link: 'সব ক্লাস',
    mcq_section_title: 'MCQ পরীক্ষা',
    all_exams_link: 'সব পরীক্ষা',
    sim_cta: 'সিমুলেশন চালাও',
    today_progress: 'আজকের প্রগ্রেস',
    mobile_guest_subtitle: 'ক্লাস ৯-১০ ইন্টারেক্টিভ সিমুলেশন',
    start_btn: 'শুরু',
  },
  about: {
    page_title: 'আমাদের সম্পর্কে',
    mission_title: 'আমাদের মিশন',
    mission_text: 'সূত্র বাংলাদেশের শিক্ষার্থীদের জন্য বিজ্ঞানকে স্পর্শযোগ্য করে তোলে — বইয়ের স্থির ছবিকে ইন্টারেক্টিভ সিমুলেশনে রূপান্তরিত করে। প্রতিটি বাংলাদেশী শিক্ষার্থী যেন ল্যাব ছাড়াই ল্যাবের অভিজ্ঞতা পায়।',
    experience_title: '১০ বছরের অভিজ্ঞতা',
    experience_text1: 'সূত্র-র পেছনে আছে একজন অভিজ্ঞ বিজ্ঞান শিক্ষকের ১০ বছরের পড়ানোর অভিজ্ঞতা। হাজার হাজার শিক্ষার্থীদের পড়িয়ে তিনি জানেন — ঠিক কোথায় শিক্ষার্থীরা আটকে যায়, কোন concept-গুলো শুধু বই পড়ে বোঝা যায় না।',
    experience_text2: 'সেই অভিজ্ঞতা থেকেই তৈরি হয়েছে প্রতিটি সিমুলেশন — যাতে শিক্ষার্থীরা নিজে হাত দিয়ে ভ্যারিয়েবল বদলে দেখতে পারে বিজ্ঞান কীভাবে কাজ করে।',
    company_title: 'EJOSB IT',
    company_text: 'সূত্র তৈরি করেছে EJOSB IT — বাংলাদেশের একটি প্রযুক্তি প্রতিষ্ঠান যারা AI, automation, এবং ed-tech নিয়ে কাজ করে।',
    vision_title: 'বিজ্ঞান পড়া নয়, বিজ্ঞান করা।',
    vision_text: 'সূত্র-র ভিশন — বাংলাদেশের প্রতিটি শিক্ষার্থীর হাতে interactive science lab।',
    vision_cta: 'সিমুলেশন দেখো',
  },
  guide: {
    page_title: 'গাইড',
    page_subtitle: 'বিষয় বেছে নাও',
    page_description: 'অধ্যায় অনুযায়ী সব কন্টেন্ট — সিমুলেশন, ভিডিও, MCQ, সৃজনশীল',
  },
  exams: {
    page_title: 'পরীক্ষা',
    page_subtitle: 'MCQ মডেল টেস্ট ও বোর্ড সৃজনশীল প্রশ্ন',
    mcq_tab: 'MCQ পরীক্ষা',
    cq_tab: 'সৃজনশীল প্রশ্ন',
  },
  simulations: {
    page_title: 'সিমুলেশন',
    page_subtitle: 'NCTB ক্লাস ৯-১০ পাঠ্যবইয়ের প্রতিটি অধ্যায়ের ইন্টারেক্টিভ সিমুলেশন',
    filter_label: 'ফিল্টার করো',
    info_text: '৬ বিষয়ে ১৩টি সিমুলেশন প্রস্তুত — NCTB পাঠ্যক্রম অনুযায়ী',
  },
  classes: {
    page_title: 'ক্লাস আর্কাইভ',
    page_subtitle: 'বিষয় ও অধ্যায় ধরে ফিল্টার করো',
    page_description: 'প্রতিদিনের ক্লাস রেকর্ডিং — বিষয় ও অধ্যায় অনুযায়ী সাজানো',
    info_text: 'প্রতিদিন নতুন ক্লাস যোগ হচ্ছে — ৬ বিষয়ের ক্লাস রেকর্ডিং',
  },
  nav: {
    guide: 'গাইড',
    exams: 'পরীক্ষা',
    simulations: 'সিমুলেশন',
    classes: 'ক্লাস',
    challenge: 'চ্যালেঞ্জ',
    pricing: 'প্রাইসিং',
    dashboard: 'ড্যাশবোর্ড',
    login: 'লগ ইন',
    subjects_menu: 'বিষয়',
    all_subjects: 'সব বিষয় দেখো',
  },
  footer: {
    tagline: 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো',
    description: 'ক্লাস ৯-১০ বিজ্ঞান — ইন্টারেক্টিভ সিমুলেশন, ভিডিও ক্লাস, MCQ পরীক্ষা।',
    platform_heading: 'প্ল্যাটফর্ম',
    subjects_heading: 'বিষয়',
    company_heading: 'কোম্পানি',
    bottom_tagline: 'বিজ্ঞান পড়া নয়, বিজ্ঞান করা।',
  },
  quicklinks: {
    mcq_label: 'MCQ পরীক্ষা',
    mcq_detail: '৮৪০+ প্রশ্ন',
    srs_label: 'SRS রিভিউ',
    srs_detail: 'স্পেসড রিপিটিশন',
    achievement_label: 'অ্যাচিভমেন্ট',
    achievement_detail: 'ব্যাজ সংগ্রহ',
    leaderboard_label: 'লিডারবোর্ড',
    leaderboard_detail: 'র‍্যাংকিং দেখো',
  },
  subjects: {
    physics: 'পদার্থবিজ্ঞান',
    physics_short: 'পদার্থ',
    physics_chapters: '১৩ অধ্যায়',
    chemistry: 'রসায়ন',
    chemistry_chapters: '১১ অধ্যায়',
    biology: 'জীববিজ্ঞান',
    biology_chapters: '১২ অধ্যায়',
  },
};
