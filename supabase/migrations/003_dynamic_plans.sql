-- ============================================
-- Suttro App — Dynamic Plans Migration
-- Add display columns to subscription_plans
-- ============================================

-- New columns for dynamic pricing page
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS display_features JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS badge_text       TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS highlight        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cta_text         TEXT DEFAULT 'বিকাশে পে করো',
  ADD COLUMN IF NOT EXISTS period_text      TEXT DEFAULT '/মাস',
  ADD COLUMN IF NOT EXISTS sort_order       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();

-- Populate display data for existing plans
UPDATE subscription_plans SET
  display_features = '["৩টি পরীক্ষা/দিন", "১০টি প্র্যাক্টিস প্রশ্ন/দিন", "সব সিমুলেশন", "৫টি ক্লাস ভিডিও", "AI টিউটর ৩ প্রশ্ন/দিন", "বেসিক ড্যাশবোর্ড"]',
  badge_text = '',
  highlight = false,
  cta_text = 'বর্তমান প্ল্যান',
  period_text = 'সবসময়',
  sort_order = 1
WHERE id = 'free';

UPDATE subscription_plans SET
  display_features = '["আনলিমিটেড পরীক্ষা", "আনলিমিটেড প্র্যাক্টিস", "সব ক্লাস ভিডিও", "AI টিউটর ২০ প্রশ্ন/দিন", "সার্টিফিকেট", "বিজ্ঞাপন মুক্ত"]',
  badge_text = 'জনপ্রিয়',
  highlight = true,
  cta_text = 'বিকাশে পে করো',
  period_text = '/মাস',
  sort_order = 2
WHERE id = 'premium';

UPDATE subscription_plans SET
  display_features = '["প্রিমিয়ামের সব কিছু", "AI টিউটর ৫০ প্রশ্ন/দিন", "অফলাইন ডাউনলোড", "অগ্রাধিকার সাপোর্ট", "নতুন ফিচার আগে পাবে", "সার্টিফিকেট"]',
  badge_text = '',
  highlight = false,
  cta_text = 'বিকাশে পে করো',
  period_text = '/মাস',
  sort_order = 3
WHERE id = 'pro';
