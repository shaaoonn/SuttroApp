-- ============================================
-- Add department column to profiles
-- বিভাগ: বিজ্ঞান | মানবিক | বানিজ্য
-- ============================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department TEXT
    CHECK (department IN ('science', 'humanities', 'commerce'));
