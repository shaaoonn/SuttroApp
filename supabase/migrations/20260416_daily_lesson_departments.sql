-- ═══════════════════════════════════════════════════════════════
-- Add department targeting to daily_lessons
-- ═══════════════════════════════════════════════════════════════
-- departments is a TEXT[] array so a lesson can target:
--   - NULL or '{}' → all departments (সবার জন্য)
--   - '{science}' → শুধু বিজ্ঞান
--   - '{science,commerce}' → বিজ্ঞান + বাণিজ্য
--   - '{science,humanities,commerce}' → সব (explicit)

ALTER TABLE daily_lessons
  ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

-- Allow multiple lessons per date (different departments/classes)
-- Drop the old unique constraint on lesson_date alone
ALTER TABLE daily_lessons DROP CONSTRAINT IF EXISTS daily_lessons_lesson_date_key;

-- Add a new unique constraint: one lesson per date + class_level combo
-- (departments are handled at query time, not as unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_lessons_date_class
  ON daily_lessons (lesson_date, class_level);

COMMENT ON COLUMN daily_lessons.departments IS 'Target departments: science, humanities, commerce. Empty = all.';
