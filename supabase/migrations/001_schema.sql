-- ============================================
-- Suttro App — Database Schema
-- Supabase (PostgreSQL) migration
-- ============================================

-- ── Reference Tables ──

CREATE TABLE subjects (
  id         TEXT PRIMARY KEY,          -- 'physics', 'chemistry', etc.
  name_bn    TEXT NOT NULL,             -- 'পদার্থবিজ্ঞান'
  icon       TEXT NOT NULL DEFAULT '',  -- '⚡'
  color      TEXT NOT NULL DEFAULT '#2563EB',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chapters (
  id          SERIAL PRIMARY KEY,
  subject_id  TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_num INTEGER NOT NULL,
  name_bn     TEXT NOT NULL,
  UNIQUE(subject_id, chapter_num)
);

-- ── Content Tables ──

CREATE TABLE class_recordings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  subject_id       TEXT NOT NULL REFERENCES subjects(id),
  chapter_num      INTEGER NOT NULL,
  class_level      INTEGER NOT NULL DEFAULT 9,
  date_label       TEXT NOT NULL,              -- '০২ এপ্রিল ২০২৬'
  duration         TEXT NOT NULL,              -- '৪৫ মিনিট'
  available        BOOLEAN NOT NULL DEFAULT true,
  youtube_id       TEXT,
  hls_src          TEXT,
  description      TEXT NOT NULL DEFAULT '',
  related_sim_slug TEXT,
  related_sim_label TEXT,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exam_papers (
  id               TEXT PRIMARY KEY,           -- 'ssc-2024-physics'
  title            TEXT NOT NULL,
  subject_id       TEXT NOT NULL REFERENCES subjects(id),
  subject_bn       TEXT NOT NULL,
  year             INTEGER NOT NULL,
  board            TEXT,
  class_level      INTEGER NOT NULL DEFAULT 10,
  duration         INTEGER NOT NULL,           -- minutes
  total_marks      INTEGER NOT NULL,
  negative_marking NUMERIC(4,2) NOT NULL DEFAULT 0.25,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mcq_questions (
  id              SERIAL PRIMARY KEY,
  exam_paper_id   TEXT NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
  question_order  INTEGER NOT NULL,
  question        TEXT NOT NULL,
  option_ka       TEXT NOT NULL,               -- ক
  option_kha      TEXT NOT NULL,               -- খ
  option_ga       TEXT NOT NULL,               -- গ
  option_gha      TEXT NOT NULL,               -- ঘ
  correct         INTEGER NOT NULL CHECK (correct >= 0 AND correct <= 3),
  explanation     TEXT,
  chapter_num     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exam_paper_id, question_order)
);

CREATE TABLE cq_collections (
  id           TEXT PRIMARY KEY,               -- 'cq-physics'
  subject_id   TEXT NOT NULL REFERENCES subjects(id),
  subject_bn   TEXT NOT NULL,
  class_level  INTEGER NOT NULL DEFAULT 10,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE creative_questions (
  id            SERIAL PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES cq_collections(id) ON DELETE CASCADE,
  chapter_num   INTEGER NOT NULL,
  stem          TEXT NOT NULL,                 -- উদ্দীপক
  source        TEXT,                          -- 'ঢাকা বোর্ড ২০২৩'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cq_parts (
  id         SERIAL PRIMARY KEY,
  cq_id      INTEGER NOT NULL REFERENCES creative_questions(id) ON DELETE CASCADE,
  label      TEXT NOT NULL CHECK (label IN ('ক','খ','গ','ঘ')),
  part_type  TEXT NOT NULL,                    -- 'জ্ঞানমূলক', 'অনুধাবনমূলক', etc.
  marks      INTEGER NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(cq_id, label)
);

-- ── User Tables ──

CREATE TABLE profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone                   TEXT UNIQUE,
  name                    TEXT,
  class_level             INTEGER DEFAULT 9,
  subscription_plan       TEXT NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin','admin','editor')),
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Analytics Tables ──

CREATE TABLE user_activity (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES auth.users ON DELETE SET NULL,
  event_type   TEXT NOT NULL,                  -- 'exam_started', 'exam_completed', etc.
  content_type TEXT,                           -- 'exam', 'class', 'simulation', 'cq'
  content_id   TEXT,                           -- exam paper id, class slug, sim slug
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exam_attempts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  exam_paper_id    TEXT NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
  score            NUMERIC(6,2) NOT NULL,
  total_marks      INTEGER NOT NULL,
  correct_count    INTEGER NOT NULL,
  wrong_count      INTEGER NOT NULL,
  skipped_count    INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  answers          JSONB DEFAULT '[]',         -- [{question_order, selected, correct}, ...]
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_chapters_subject ON chapters(subject_id);
CREATE INDEX idx_class_recordings_subject ON class_recordings(subject_id);
CREATE INDEX idx_class_recordings_chapter ON class_recordings(subject_id, chapter_num);
CREATE INDEX idx_mcq_questions_exam ON mcq_questions(exam_paper_id);
CREATE INDEX idx_mcq_questions_chapter ON mcq_questions(chapter_num) WHERE chapter_num IS NOT NULL;
CREATE INDEX idx_creative_questions_collection ON creative_questions(collection_id);
CREATE INDEX idx_cq_parts_cq ON cq_parts(cq_id);
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_created ON user_activity(created_at);
CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam ON exam_attempts(exam_paper_id);

-- ============================================
-- Row Level Security
-- ============================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── subjects ──
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Admin manage subjects" ON subjects FOR ALL USING (is_admin());

-- ── chapters ──
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Admin manage chapters" ON chapters FOR ALL USING (is_admin());

-- ── class_recordings ──
ALTER TABLE class_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published classes" ON class_recordings FOR SELECT USING (is_published = true);
CREATE POLICY "Admin read all classes" ON class_recordings FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage classes" ON class_recordings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update classes" ON class_recordings FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete classes" ON class_recordings FOR DELETE USING (is_admin());

-- ── exam_papers ──
ALTER TABLE exam_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published exams" ON exam_papers FOR SELECT USING (is_published = true);
CREATE POLICY "Admin read all exams" ON exam_papers FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage exams" ON exam_papers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update exams" ON exam_papers FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete exams" ON exam_papers FOR DELETE USING (is_admin());

-- ── mcq_questions ──
ALTER TABLE mcq_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read questions" ON mcq_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exam_papers WHERE id = exam_paper_id AND is_published = true
  ));
CREATE POLICY "Admin read all questions" ON mcq_questions FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage questions" ON mcq_questions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update questions" ON mcq_questions FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete questions" ON mcq_questions FOR DELETE USING (is_admin());

-- ── cq_collections ──
ALTER TABLE cq_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published cq" ON cq_collections FOR SELECT USING (is_published = true);
CREATE POLICY "Admin read all cq" ON cq_collections FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage cq" ON cq_collections FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update cq" ON cq_collections FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete cq" ON cq_collections FOR DELETE USING (is_admin());

-- ── creative_questions ──
ALTER TABLE creative_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read creative questions" ON creative_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cq_collections WHERE id = collection_id AND is_published = true
  ));
CREATE POLICY "Admin read all creative questions" ON creative_questions FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage creative questions" ON creative_questions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update creative questions" ON creative_questions FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete creative questions" ON creative_questions FOR DELETE USING (is_admin());

-- ── cq_parts ──
ALTER TABLE cq_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cq parts" ON cq_parts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM creative_questions cq
    JOIN cq_collections cc ON cc.id = cq.collection_id
    WHERE cq.id = cq_id AND cc.is_published = true
  ));
CREATE POLICY "Admin read all cq parts" ON cq_parts FOR SELECT USING (is_admin());
CREATE POLICY "Admin manage cq parts" ON cq_parts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update cq parts" ON cq_parts FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete cq parts" ON cq_parts FOR DELETE USING (is_admin());

-- ── profiles ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (is_admin());

-- ── admin_users ──
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read admins" ON admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Super admin manage admins" ON admin_users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ── user_activity ──
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin read all activity" ON user_activity FOR SELECT USING (is_admin());

-- ── exam_attempts ──
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own attempts" ON exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own attempts" ON exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin read all attempts" ON exam_attempts FOR SELECT USING (is_admin());

-- ============================================
-- Auto-create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NULLIF(NEW.phone, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_class_recordings_updated
  BEFORE UPDATE ON class_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_exam_papers_updated
  BEFORE UPDATE ON exam_papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
