-- ════════════════════════════════════════════════════════════════════
-- Daily lesson attachments — link existing exam_papers + CQ collections
-- to daily lesson items, plus support PDF student submissions.
-- ════════════════════════════════════════════════════════════════════

-- ── Daily lesson items: attach existing content ──
ALTER TABLE daily_lesson_items
  ADD COLUMN IF NOT EXISTS exam_paper_id      TEXT REFERENCES exam_papers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cq_collection_id   TEXT REFERENCES cq_collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS attachment_url     TEXT,                    -- Supabase Storage URL (image/PDF)
  ADD COLUMN IF NOT EXISTS attachment_type    TEXT;                    -- 'image' | 'pdf'

-- Indexes for joins
CREATE INDEX IF NOT EXISTS idx_dli_exam_paper      ON daily_lesson_items(exam_paper_id);
CREATE INDEX IF NOT EXISTS idx_dli_cq_collection   ON daily_lesson_items(cq_collection_id);

-- ── Daily submissions: PDF support ──
-- photo_urls already stores image arrays; add separate pdf_urls so the
-- UI can render PDFs differently (preview link vs thumbnail).
ALTER TABLE daily_submissions
  ADD COLUMN IF NOT EXISTS pdf_urls TEXT[] DEFAULT '{}';

-- ── Storage bucket for daily lesson attachments + submissions ──
-- Run separately in Supabase Studio if not yet created:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('daily-lessons', 'daily-lessons', true)
-- ON CONFLICT (id) DO NOTHING;

COMMENT ON COLUMN daily_lesson_items.exam_paper_id IS
  'When set, this item is a "model exam" — student can take the full exam from inside the daily lesson.';

COMMENT ON COLUMN daily_lesson_items.cq_collection_id IS
  'When set, this item is a CQ set — student sees all creative questions from the linked collection.';

COMMENT ON COLUMN daily_lesson_items.attachment_url IS
  'Supabase Storage URL for image/PDF attached directly to this item by admin.';

COMMENT ON COLUMN daily_submissions.pdf_urls IS
  'Array of PDF file URLs uploaded by student as part of submission.';
