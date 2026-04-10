-- ─────────────────────────────────────────────
-- 005: Site Content CMS
-- Stores all editable page text for admin management
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_content (
  page       TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  label      TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (page, key)
);

-- Allow public read (anon), admin write
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Service role can manage site_content" ON site_content FOR ALL USING (true) WITH CHECK (true);

-- ── Seed: Home Page ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('home', 'welcome_logged_in', 'আজ কী শিখবে? তোমার পড়াশোনা শুরু করো।', 'লগইন ইউজার সাবটাইটেল', 1),
  ('home', 'welcome_guest_title', 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো', 'গেস্ট টাইটেল', 2),
  ('home', 'welcome_guest_subtitle', 'ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স — NCTB পাঠ্যবইয়ের প্রতিটি অধ্যায়।', 'গেস্ট সাবটাইটেল', 3),
  ('home', 'daily_study_title', 'আজকের পড়া', 'আজকের পড়া টাইটেল', 4),
  ('home', 'daily_study_subtitle', 'ক্লাস, MCQ, বাড়ির কাজ', 'আজকের পড়া সাবটাইটেল', 5),
  ('home', 'new_class_label', 'নতুন ক্লাস!', 'নতুন ক্লাস লেবেল', 6),
  ('home', 'recent_classes_title', 'সাম্প্রতিক ক্লাস', 'সাম্প্রতিক ক্লাস শিরোনাম', 7),
  ('home', 'all_classes_link', 'সব ক্লাস', 'সব ক্লাস লিংক', 8),
  ('home', 'mcq_section_title', 'MCQ পরীক্ষা', 'MCQ সেকশন শিরোনাম', 9),
  ('home', 'all_exams_link', 'সব পরীক্ষা', 'সব পরীক্ষা লিংক', 10),
  ('home', 'sim_cta', 'সিমুলেশন চালাও', 'সিমুলেশন CTA', 11),
  ('home', 'today_progress', 'আজকের প্রগ্রেস', 'প্রগ্রেস লেবেল', 12),
  ('home', 'mobile_guest_subtitle', 'ক্লাস ৯-১০ ইন্টারেক্টিভ সিমুলেশন', 'মোবাইল গেস্ট সাবটাইটেল', 13),
  ('home', 'start_btn', 'শুরু', 'শুরু বাটন', 14)
ON CONFLICT DO NOTHING;

-- ── Seed: About Page ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('about', 'page_title', 'আমাদের সম্পর্কে', 'পেজ শিরোনাম', 1),
  ('about', 'mission_title', 'আমাদের মিশন', 'মিশন শিরোনাম', 2),
  ('about', 'mission_text', 'সূত্র বাংলাদেশের শিক্ষার্থীদের জন্য বিজ্ঞানকে স্পর্শযোগ্য করে তোলে — বইয়ের স্থির ছবিকে ইন্টারেক্টিভ সিমুলেশনে রূপান্তরিত করে। প্রতিটি বাংলাদেশী শিক্ষার্থী যেন ল্যাব ছাড়াই ল্যাবের অভিজ্ঞতা পায়।', 'মিশন বিবরণ', 3),
  ('about', 'experience_title', '১০ বছরের অভিজ্ঞতা', 'অভিজ্ঞতা শিরোনাম', 4),
  ('about', 'experience_text1', 'সূত্র-র পেছনে আছে একজন অভিজ্ঞ বিজ্ঞান শিক্ষকের ১০ বছরের পড়ানোর অভিজ্ঞতা। হাজার হাজার শিক্ষার্থীদের পড়িয়ে তিনি জানেন — ঠিক কোথায় শিক্ষার্থীরা আটকে যায়, কোন concept-গুলো শুধু বই পড়ে বোঝা যায় না।', 'অভিজ্ঞতা বিবরণ ১', 5),
  ('about', 'experience_text2', 'সেই অভিজ্ঞতা থেকেই তৈরি হয়েছে প্রতিটি সিমুলেশন — যাতে শিক্ষার্থীরা নিজে হাত দিয়ে ভ্যারিয়েবল বদলে দেখতে পারে বিজ্ঞান কীভাবে কাজ করে।', 'অভিজ্ঞতা বিবরণ ২', 6),
  ('about', 'company_title', 'EJOSB IT', 'কোম্পানি শিরোনাম', 7),
  ('about', 'company_text', 'সূত্র তৈরি করেছে EJOSB IT — বাংলাদেশের একটি প্রযুক্তি প্রতিষ্ঠান যারা AI, automation, এবং ed-tech নিয়ে কাজ করে।', 'কোম্পানি বিবরণ', 8),
  ('about', 'vision_title', 'বিজ্ঞান পড়া নয়, বিজ্ঞান করা।', 'ভিশন শিরোনাম', 9),
  ('about', 'vision_text', 'সূত্র-র ভিশন — বাংলাদেশের প্রতিটি শিক্ষার্থীর হাতে interactive science lab।', 'ভিশন বিবরণ', 10),
  ('about', 'vision_cta', 'সিমুলেশন দেখো', 'ভিশন CTA বাটন', 11)
ON CONFLICT DO NOTHING;

-- ── Seed: Guide Page ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('guide', 'page_title', 'গাইড', 'পেজ শিরোনাম', 1),
  ('guide', 'page_subtitle', 'বিষয় বেছে নাও', 'সাবটাইটেল', 2),
  ('guide', 'page_description', 'অধ্যায় অনুযায়ী সব কন্টেন্ট — সিমুলেশন, ভিডিও, MCQ, সৃজনশীল', 'বিবরণ', 3)
ON CONFLICT DO NOTHING;

-- ── Seed: Exams Page ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('exams', 'page_title', 'পরীক্ষা', 'পেজ শিরোনাম', 1),
  ('exams', 'page_subtitle', 'MCQ মডেল টেস্ট ও বোর্ড সৃজনশীল প্রশ্ন', 'সাবটাইটেল', 2),
  ('exams', 'mcq_tab', 'MCQ পরীক্ষা', 'MCQ ট্যাব লেবেল', 3),
  ('exams', 'cq_tab', 'সৃজনশীল প্রশ্ন', 'সৃজনশীল ট্যাব লেবেল', 4)
ON CONFLICT DO NOTHING;

-- ── Seed: Simulations Page ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('simulations', 'page_title', 'সিমুলেশন', 'পেজ শিরোনাম', 1),
  ('simulations', 'page_subtitle', 'NCTB ক্লাস ৯-১০ পাঠ্যবইয়ের প্রতিটি অধ্যায়ের ইন্টারেক্টিভ সিমুলেশন', 'সাবটাইটেল', 2),
  ('simulations', 'filter_label', 'ফিল্টার করো', 'ফিল্টার লেবেল', 3),
  ('simulations', 'info_text', '৬ বিষয়ে ১৩টি সিমুলেশন প্রস্তুত — NCTB পাঠ্যক্রম অনুযায়ী', 'ইনফো টেক্সট', 4)
ON CONFLICT DO NOTHING;

-- ── Seed: Classes Page ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('classes', 'page_title', 'ক্লাস আর্কাইভ', 'পেজ শিরোনাম', 1),
  ('classes', 'page_subtitle', 'বিষয় ও অধ্যায় ধরে ফিল্টার করো', 'সাবটাইটেল', 2),
  ('classes', 'page_description', 'প্রতিদিনের ক্লাস রেকর্ডিং — বিষয় ও অধ্যায় অনুযায়ী সাজানো', 'বিবরণ', 3),
  ('classes', 'info_text', 'প্রতিদিন নতুন ক্লাস যোগ হচ্ছে — ৬ বিষয়ের ক্লাস রেকর্ডিং', 'ইনফো টেক্সট', 4)
ON CONFLICT DO NOTHING;

-- ── Seed: Navigation ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('nav', 'guide', 'গাইড', 'গাইড লিংক', 1),
  ('nav', 'exams', 'পরীক্ষা', 'পরীক্ষা লিংক', 2),
  ('nav', 'simulations', 'সিমুলেশন', 'সিমুলেশন লিংক', 3),
  ('nav', 'classes', 'ক্লাস', 'ক্লাস লিংক', 4),
  ('nav', 'challenge', 'চ্যালেঞ্জ', 'চ্যালেঞ্জ লিংক', 5),
  ('nav', 'pricing', 'প্রাইসিং', 'প্রাইসিং লিংক', 6),
  ('nav', 'dashboard', 'ড্যাশবোর্ড', 'ড্যাশবোর্ড লিংক', 7),
  ('nav', 'login', 'লগ ইন', 'লগইন লিংক', 8),
  ('nav', 'subjects_menu', 'বিষয়', 'বিষয় মেনু', 9),
  ('nav', 'all_subjects', 'সব বিষয় দেখো', 'সব বিষয় লিংক', 10)
ON CONFLICT DO NOTHING;

-- ── Seed: Footer ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('footer', 'tagline', 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো', 'ট্যাগলাইন', 1),
  ('footer', 'description', 'ক্লাস ৯-১০ বিজ্ঞান — ইন্টারেক্টিভ সিমুলেশন, ভিডিও ক্লাস, MCQ পরীক্ষা।', 'বিবরণ', 2),
  ('footer', 'platform_heading', 'প্ল্যাটফর্ম', 'প্ল্যাটফর্ম শিরোনাম', 3),
  ('footer', 'subjects_heading', 'বিষয়', 'বিষয় শিরোনাম', 4),
  ('footer', 'company_heading', 'কোম্পানি', 'কোম্পানি শিরোনাম', 5),
  ('footer', 'bottom_tagline', 'বিজ্ঞান পড়া নয়, বিজ্ঞান করা।', 'নিচের ট্যাগলাইন', 6)
ON CONFLICT DO NOTHING;

-- ── Seed: Quick Links ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('quicklinks', 'mcq_label', 'MCQ পরীক্ষা', 'MCQ লেবেল', 1),
  ('quicklinks', 'mcq_detail', '৮৪০+ প্রশ্ন', 'MCQ বিবরণ', 2),
  ('quicklinks', 'srs_label', 'SRS রিভিউ', 'SRS লেবেল', 3),
  ('quicklinks', 'srs_detail', 'স্পেসড রিপিটিশন', 'SRS বিবরণ', 4),
  ('quicklinks', 'achievement_label', 'অ্যাচিভমেন্ট', 'অ্যাচিভমেন্ট লেবেল', 5),
  ('quicklinks', 'achievement_detail', 'ব্যাজ সংগ্রহ', 'অ্যাচিভমেন্ট বিবরণ', 6),
  ('quicklinks', 'leaderboard_label', 'লিডারবোর্ড', 'লিডারবোর্ড লেবেল', 7),
  ('quicklinks', 'leaderboard_detail', 'র‍্যাংকিং দেখো', 'লিডারবোর্ড বিবরণ', 8)
ON CONFLICT DO NOTHING;

-- ── Seed: Subjects ──
INSERT INTO site_content (page, key, value, label, sort_order) VALUES
  ('subjects', 'physics', 'পদার্থবিজ্ঞান', 'পদার্থবিজ্ঞান', 1),
  ('subjects', 'physics_short', 'পদার্থ', 'পদার্থ (সংক্ষিপ্ত)', 2),
  ('subjects', 'physics_chapters', '১৩ অধ্যায়', 'পদার্থ অধ্যায় সংখ্যা', 3),
  ('subjects', 'chemistry', 'রসায়ন', 'রসায়ন', 4),
  ('subjects', 'chemistry_chapters', '১১ অধ্যায়', 'রসায়ন অধ্যায় সংখ্যা', 5),
  ('subjects', 'biology', 'জীববিজ্ঞান', 'জীববিজ্ঞান', 6),
  ('subjects', 'biology_chapters', '১২ অধ্যায়', 'জীববিজ্ঞান অধ্যায় সংখ্যা', 7)
ON CONFLICT DO NOTHING;
