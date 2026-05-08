-- ─────────────────────────────────────────────
-- Simulations metadata table
-- 2026-05-08 — admin-editable simulation metadata
-- Code defines the actual simulation (registry.ts).
-- This table is only for editable text/media + visibility.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS simulations (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,

  -- Display text (editable from admin)
  title_bn TEXT NOT NULL,
  title_en TEXT,
  description_bn TEXT,
  description_en TEXT,
  long_description_bn TEXT,    -- Optional rich detail shown below player

  -- Curriculum mapping (mirrors config.ts but DB is the source of truth for filters)
  subject TEXT NOT NULL CHECK (subject IN ('physics','chemistry','biology','math','higher-math','english')),
  nctb_class INTEGER NOT NULL CHECK (nctb_class IN (9, 10)),
  nctb_chapter INTEGER NOT NULL,
  nctb_section TEXT,

  -- Media
  youtube_url TEXT,             -- Tutorial video (embeds in TutorialFAB)
  thumbnail_url TEXT,           -- Optional external thumbnail (Drive / CDN)
  thumbnail_svg TEXT,           -- Inline SVG fallback thumbnail (default)

  -- Visibility
  status TEXT NOT NULL DEFAULT 'public' CHECK (status IN ('public','private','deleted')),
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Optional metadata
  tags TEXT[],
  duration_minutes INTEGER,     -- Estimated session length
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 5),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulations_slug ON simulations(slug);
CREATE INDEX IF NOT EXISTS idx_simulations_subject ON simulations(subject);
CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS idx_simulations_chapter
  ON simulations(subject, nctb_class, nctb_chapter);

-- Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION simulations_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_simulations_updated_at ON simulations;
CREATE TRIGGER trg_simulations_updated_at
  BEFORE UPDATE ON simulations
  FOR EACH ROW EXECUTE FUNCTION simulations_set_updated_at();

-- ─── Row-level security ───
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Public can read public simulations
DROP POLICY IF EXISTS "public_read_public_sims" ON simulations;
CREATE POLICY "public_read_public_sims"
  ON simulations FOR SELECT
  USING (status = 'public');

-- Authenticated users can also read all (admin panel uses service role anyway)
DROP POLICY IF EXISTS "auth_read_all_sims" ON simulations;
CREATE POLICY "auth_read_all_sims"
  ON simulations FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role bypasses RLS by default; admin writes happen via service role.

-- ─── Seed: motion sim ───
INSERT INTO simulations (
  slug, title_bn, title_en,
  description_bn, description_en,
  long_description_bn,
  subject, nctb_class, nctb_chapter, nctb_section,
  status, order_index, tags, duration_minutes, difficulty
) VALUES (
  'motion',
  'গতি',
  'Motion',
  'NCTB ক্লাস ৯-১০ পদার্থবিজ্ঞান অধ্যায় ২। গতির ৪টি সূত্র + মুক্ত পতন। সমাধান ও অনুসন্ধান দুই মোডে কাজ করে।',
  'NCTB Class 9-10 Physics Chapter 2. Four kinematic equations + free fall. Solver and explore modes.',
  'এই সিমুলেশনে তুমি বাস্তব সময়ের গাড়ি, মোটরসাইকেল, CNG, রকেট দিয়ে গতির ৪টি সূত্র (v=u+at, s=ut+½at², v²=u²+2as, s=(u+v)t/2) এবং মুক্ত পতন বোঝতে পারবে। প্রতিটি সূত্রের জন্য আলাদা ভেরিয়েবল solve করার option আছে — exam-এর প্রস্তুতি হিসেবে। অনুসন্ধান মোডে slider টানলেই scene সাথে সাথে update হয় — concept গভীরভাবে বুঝতে।',
  'physics', 9, 2, '2.0',
  'public', 1,
  ARRAY['kinematics','equations of motion','গতি','মুক্ত পতন','SSC','NCTB'],
  15,
  2
) ON CONFLICT (slug) DO UPDATE SET
  title_bn = EXCLUDED.title_bn,
  description_bn = EXCLUDED.description_bn,
  long_description_bn = EXCLUDED.long_description_bn,
  updated_at = NOW();
