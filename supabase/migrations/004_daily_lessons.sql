-- ============================================
-- Suttro App — আজকের পড়া (Daily Lesson) System
-- Daily assignments, marking, photo submissions
-- ============================================

-- ── Daily Lessons (Admin creates one per day) ──

CREATE TABLE daily_lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_date   DATE NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  subject_id    TEXT REFERENCES subjects(id),
  chapter_num   INTEGER,
  class_level   INTEGER DEFAULT 10,
  total_marks   INTEGER DEFAULT 100,
  is_published  BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Items within a daily lesson ──
-- Types: video, simulation, pdf, image, note, mcq_set, written_question
-- Categories: study (পড়া), memorize (মুখস্ত), homework (বাড়ির কাজ), challenge (চ্যালেঞ্জ)

CREATE TABLE daily_lesson_items (
  id            SERIAL PRIMARY KEY,
  lesson_id     UUID NOT NULL REFERENCES daily_lessons(id) ON DELETE CASCADE,
  item_type     TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'study',
  title         TEXT NOT NULL,
  description   TEXT,
  content_ref   TEXT,        -- reference to existing content (class slug, sim slug, exam ID)
  media_url     TEXT,        -- for uploaded PDFs, images
  content_body  TEXT,        -- for inline text content (notes, question text)
  marks         INTEGER DEFAULT 0,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── MCQ questions within a daily lesson item ──

CREATE TABLE daily_lesson_mcqs (
  id            SERIAL PRIMARY KEY,
  item_id       INTEGER NOT NULL REFERENCES daily_lesson_items(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  option_ka     TEXT NOT NULL,
  option_kha    TEXT NOT NULL,
  option_ga     TEXT NOT NULL,
  option_gha    TEXT NOT NULL,
  correct       INTEGER NOT NULL,  -- 0-3
  explanation   TEXT,
  marks         INTEGER DEFAULT 1,
  sort_order    INTEGER DEFAULT 0
);

-- ── Student submissions ──
-- One per user per item. Supports MCQ answers, text, and photo uploads.

CREATE TABLE daily_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id         INTEGER NOT NULL REFERENCES daily_lesson_items(id) ON DELETE CASCADE,
  -- MCQ
  mcq_answers     JSONB,           -- [{mcq_id, selected, is_correct}]
  mcq_score       INTEGER,
  mcq_total       INTEGER,
  -- Written / Photo
  text_answer     TEXT,
  photo_urls      TEXT[],          -- array of uploaded photo URLs
  -- Status
  is_completed    BOOLEAN DEFAULT false,
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  -- Admin review
  marks_given     NUMERIC(5,2),
  feedback        TEXT,
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  -- Auto-grading (future: OpenRouter)
  auto_grade      NUMERIC(5,2),
  auto_reviewed   BOOLEAN DEFAULT false,
  UNIQUE(user_id, item_id)
);

-- ── Aggregated daily scores ──

CREATE TABLE daily_scores (
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date      DATE NOT NULL,
  lesson_id       UUID REFERENCES daily_lessons(id) ON DELETE SET NULL,
  marks_earned    NUMERIC(5,2) DEFAULT 0,
  marks_possible  NUMERIC(5,2) DEFAULT 0,
  score_pct       NUMERIC(5,2) DEFAULT 0,
  items_completed INTEGER DEFAULT 0,
  items_total     INTEGER DEFAULT 0,
  computed_at     TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, score_date)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_daily_lessons_date ON daily_lessons(lesson_date);
CREATE INDEX idx_daily_lesson_items_lesson ON daily_lesson_items(lesson_id);
CREATE INDEX idx_daily_lesson_mcqs_item ON daily_lesson_mcqs(item_id);
CREATE INDEX idx_daily_submissions_user ON daily_submissions(user_id);
CREATE INDEX idx_daily_submissions_item ON daily_submissions(item_id);
CREATE INDEX idx_daily_submissions_review ON daily_submissions(reviewed_at) WHERE reviewed_at IS NULL AND marks_given IS NULL;
CREATE INDEX idx_daily_scores_user ON daily_scores(user_id);
CREATE INDEX idx_daily_scores_date ON daily_scores(score_date);
CREATE INDEX idx_daily_scores_user_month ON daily_scores(user_id, score_date);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published lessons" ON daily_lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manage lessons" ON daily_lessons FOR ALL USING (is_admin());

ALTER TABLE daily_lesson_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read items of published lessons" ON daily_lesson_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM daily_lessons WHERE id = lesson_id AND is_published = true));
CREATE POLICY "Admin manage items" ON daily_lesson_items FOR ALL USING (is_admin());

ALTER TABLE daily_lesson_mcqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mcqs of published lessons" ON daily_lesson_mcqs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM daily_lesson_items i
    JOIN daily_lessons l ON l.id = i.lesson_id
    WHERE i.id = item_id AND l.is_published = true
  ));
CREATE POLICY "Admin manage mcqs" ON daily_lesson_mcqs FOR ALL USING (is_admin());

ALTER TABLE daily_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own submissions" ON daily_submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read all submissions" ON daily_submissions FOR SELECT USING (is_admin());
CREATE POLICY "Admin update submissions" ON daily_submissions FOR UPDATE USING (is_admin());

ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own scores" ON daily_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own scores" ON daily_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scores" ON daily_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin read all scores" ON daily_scores FOR SELECT USING (is_admin());

-- ============================================
-- Triggers
-- ============================================

CREATE TRIGGER trg_daily_lessons_updated
  BEFORE UPDATE ON daily_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RPC: Compute daily score for a user
-- ============================================

CREATE OR REPLACE FUNCTION public.compute_daily_score(
  p_user_id UUID,
  p_lesson_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_marks_earned NUMERIC(5,2) := 0;
  v_marks_possible NUMERIC(5,2) := 0;
  v_items_completed INTEGER := 0;
  v_items_total INTEGER := 0;
BEGIN
  -- Count total items and total possible marks
  SELECT COUNT(*), COALESCE(SUM(marks), 0)
  INTO v_items_total, v_marks_possible
  FROM daily_lesson_items
  WHERE lesson_id = p_lesson_id AND marks > 0;

  -- Sum up earned marks from submissions
  SELECT COUNT(*), COALESCE(SUM(
    CASE
      WHEN s.mcq_score IS NOT NULL THEN
        (s.mcq_score::numeric / NULLIF(s.mcq_total, 0)::numeric) * i.marks
      WHEN s.marks_given IS NOT NULL THEN s.marks_given
      WHEN s.is_completed AND i.marks > 0 THEN i.marks
      ELSE 0
    END
  ), 0)
  INTO v_items_completed, v_marks_earned
  FROM daily_submissions s
  JOIN daily_lesson_items i ON i.id = s.item_id
  WHERE s.user_id = p_user_id AND i.lesson_id = p_lesson_id AND s.is_completed = true;

  -- Upsert score
  INSERT INTO daily_scores (user_id, score_date, lesson_id, marks_earned, marks_possible, score_pct, items_completed, items_total, computed_at)
  VALUES (
    p_user_id, p_date, p_lesson_id,
    v_marks_earned, v_marks_possible,
    CASE WHEN v_marks_possible > 0 THEN ROUND((v_marks_earned / v_marks_possible) * 100, 2) ELSE 0 END,
    v_items_completed, v_items_total,
    now()
  )
  ON CONFLICT (user_id, score_date)
  DO UPDATE SET
    marks_earned = EXCLUDED.marks_earned,
    marks_possible = EXCLUDED.marks_possible,
    score_pct = EXCLUDED.score_pct,
    items_completed = EXCLUDED.items_completed,
    items_total = EXCLUDED.items_total,
    computed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
