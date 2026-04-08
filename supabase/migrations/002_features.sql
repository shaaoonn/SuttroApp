-- ============================================
-- Suttro App — Feature Expansion Migration
-- Learning Engine, Gamification, Payments, SRS
-- ============================================

-- ── Learning Engine ──

CREATE TABLE user_chapter_progress (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject_id    TEXT NOT NULL REFERENCES subjects(id),
  chapter_num   INTEGER NOT NULL,
  mcq_attempted INTEGER DEFAULT 0,
  mcq_correct   INTEGER DEFAULT 0,
  mastery_pct   NUMERIC(5,2) DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  sims_used     INTEGER DEFAULT 0,
  cq_practiced  INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, subject_id, chapter_num)
);

CREATE TABLE question_attempts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question_id   INTEGER NOT NULL REFERENCES mcq_questions(id) ON DELETE CASCADE,
  selected      INTEGER NOT NULL,
  is_correct    BOOLEAN NOT NULL,
  time_spent_ms INTEGER,
  attempt_num   INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Spaced Repetition System (SRS) ──

CREATE TABLE srs_cards (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  question_id   INTEGER NOT NULL REFERENCES mcq_questions(id) ON DELETE CASCADE,
  ease_factor   NUMERIC(4,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  repetitions   INTEGER DEFAULT 0,
  next_review   DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMPTZ,
  UNIQUE(user_id, question_id)
);

-- ── Gamification ──

CREATE TABLE user_stats (
  user_id        UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  total_xp       INTEGER DEFAULT 0,
  level          INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  daily_goal_xp  INTEGER DEFAULT 50,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE xp_transactions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  source      TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_activity (
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  active_date DATE NOT NULL,
  xp_earned   INTEGER DEFAULT 0,
  PRIMARY KEY(user_id, active_date)
);

CREATE TABLE badges (
  id          TEXT PRIMARY KEY,
  name_bn     TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  category    TEXT NOT NULL,
  criteria    JSONB NOT NULL,
  xp_reward   INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE user_badges (
  user_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  badge_id   TEXT NOT NULL REFERENCES badges(id),
  earned_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, badge_id)
);

CREATE TABLE daily_challenges (
  challenge_date DATE PRIMARY KEY,
  question_ids   INTEGER[] NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_challenge_attempts (
  user_id        UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  score          INTEGER NOT NULL,
  total          INTEGER NOT NULL DEFAULT 5,
  completed_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, challenge_date)
);

-- ── Payment & Subscription ──

CREATE TABLE subscription_plans (
  id            TEXT PRIMARY KEY,
  name_bn       TEXT NOT NULL,
  price_bdt     INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  features      JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_id         TEXT NOT NULL REFERENCES subscription_plans(id),
  amount_bdt      INTEGER NOT NULL,
  gateway         TEXT NOT NULL DEFAULT 'bkash',
  gateway_trx_id  TEXT,
  gateway_payment_id TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  callback_data   JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE coupons (
  code           TEXT PRIMARY KEY,
  discount_pct   INTEGER NOT NULL,
  max_uses       INTEGER,
  current_uses   INTEGER DEFAULT 0,
  valid_until    DATE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referrals (
  referrer_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  referred_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  referral_code  TEXT NOT NULL,
  reward_given   BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(referrer_id, referred_id)
);

-- ── Push Notifications ──

CREATE TABLE push_tokens (
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT NOT NULL DEFAULT 'web',
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, token)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_chapter_progress_user ON user_chapter_progress(user_id);
CREATE INDEX idx_chapter_progress_subject ON user_chapter_progress(user_id, subject_id);
CREATE INDEX idx_question_attempts_user ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_srs_cards_user_review ON srs_cards(user_id, next_review);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at);
CREATE INDEX idx_daily_activity_user ON daily_activity(user_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_payment_id);

-- ============================================
-- Row Level Security
-- ============================================

-- ── user_chapter_progress ──
ALTER TABLE user_chapter_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON user_chapter_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read all progress" ON user_chapter_progress FOR SELECT USING (is_admin());

-- ── question_attempts ──
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attempts" ON question_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read all attempts" ON question_attempts FOR SELECT USING (is_admin());

-- ── srs_cards ──
ALTER TABLE srs_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own SRS" ON srs_cards FOR ALL USING (auth.uid() = user_id);

-- ── user_stats ──
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public read stats for leaderboard" ON user_stats FOR SELECT USING (true);
CREATE POLICY "System insert stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── xp_transactions ──
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own XP" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own XP" ON xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all XP" ON xp_transactions FOR SELECT USING (is_admin());

-- ── daily_activity ──
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);

-- ── badges ──
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admin manage badges" ON badges FOR ALL USING (is_admin());

-- ── user_badges ──
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all badges" ON user_badges FOR SELECT USING (is_admin());

-- ── daily_challenges ──
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read challenges" ON daily_challenges FOR SELECT USING (true);
CREATE POLICY "Admin manage challenges" ON daily_challenges FOR ALL USING (is_admin());

-- ── daily_challenge_attempts ──
ALTER TABLE daily_challenge_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own challenge attempts" ON daily_challenge_attempts FOR ALL USING (auth.uid() = user_id);

-- ── subscription_plans ──
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plans" ON subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage plans" ON subscription_plans FOR ALL USING (is_admin());

-- ── payments ──
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all payments" ON payments FOR SELECT USING (is_admin());

-- ── coupons ──
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read valid coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admin manage coupons" ON coupons FOR ALL USING (is_admin());

-- ── referrals ──
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users insert referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- ── push_tokens ──
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Seed: Subscription Plans
-- ============================================

INSERT INTO subscription_plans (id, name_bn, price_bdt, duration_days, features) VALUES
  ('free', 'ফ্রি', 0, 36500, '{"exams_per_day": 3, "practice_per_day": 10, "ai_questions_per_day": 3, "videos": 5, "ads": true}'),
  ('premium', 'প্রিমিয়াম', 9900, 30, '{"exams_per_day": -1, "practice_per_day": -1, "ai_questions_per_day": 20, "videos": -1, "ads": false, "certificates": true}'),
  ('pro', 'প্রো', 19900, 30, '{"exams_per_day": -1, "practice_per_day": -1, "ai_questions_per_day": 50, "videos": -1, "ads": false, "certificates": true, "offline": true, "priority_support": true}');

-- ============================================
-- Seed: Badges
-- ============================================

INSERT INTO badges (id, name_bn, description, icon, category, criteria, xp_reward, sort_order) VALUES
  ('first-exam', 'প্রথম পদক্ষেপ', 'প্রথম পরীক্ষা সম্পন্ন করো', '🎯', 'milestone', '{"type": "exam_count", "value": 1}', 10, 1),
  ('exam-10', 'পরীক্ষার্থী', '১০টি পরীক্ষা সম্পন্ন করো', '📝', 'milestone', '{"type": "exam_count", "value": 10}', 50, 2),
  ('exam-50', 'পরীক্ষা যোদ্ধা', '৫০টি পরীক্ষা সম্পন্ন করো', '⚔️', 'milestone', '{"type": "exam_count", "value": 50}', 200, 3),
  ('perfect-score', 'নিখুঁত স্কোর', 'যেকোনো পরীক্ষায় ১০০% পাও', '💯', 'milestone', '{"type": "perfect_score"}', 100, 4),
  ('score-80', 'মেধাবী', 'যেকোনো পরীক্ষায় ৮০%+ পাও', '🌟', 'milestone', '{"type": "score_above", "value": 80}', 30, 5),
  ('streak-7', 'সপ্তাহের যোদ্ধা', '৭ দিন একটানা অ্যাক্টিভ থাকো', '🔥', 'streak', '{"type": "streak", "value": 7}', 50, 6),
  ('streak-30', 'মাসিক চ্যাম্পিয়ন', '৩০ দিন একটানা অ্যাক্টিভ থাকো', '🏆', 'streak', '{"type": "streak", "value": 30}', 200, 7),
  ('streak-100', 'শতদিনের বীর', '১০০ দিন একটানা অ্যাক্টিভ থাকো', '👑', 'streak', '{"type": "streak", "value": 100}', 500, 8),
  ('sim-explorer', 'সিমুলেশন এক্সপ্লোরার', 'সব সিমুলেশন ব্যবহার করো', '🔬', 'mastery', '{"type": "all_sims"}', 100, 9),
  ('physics-master', 'পদার্থবিজ্ঞান মাস্টার', 'পদার্থবিজ্ঞানের সব অধ্যায়ে ৮০%+ মাস্টারি', '⚡', 'mastery', '{"type": "subject_mastery", "subject": "physics", "value": 80}', 300, 10),
  ('chemistry-master', 'রসায়ন মাস্টার', 'রসায়নের সব অধ্যায়ে ৮০%+ মাস্টারি', '🧪', 'mastery', '{"type": "subject_mastery", "subject": "chemistry", "value": 80}', 300, 11),
  ('biology-master', 'জীববিজ্ঞান মাস্টার', 'জীববিজ্ঞানের সব অধ্যায়ে ৮০%+ মাস্টারি', '🧬', 'mastery', '{"type": "subject_mastery", "subject": "biology", "value": 80}', 300, 12),
  ('math-master', 'গণিত মাস্টার', 'গণিতের সব অধ্যায়ে ৮০%+ মাস্টারি', '📐', 'mastery', '{"type": "subject_mastery", "subject": "math", "value": 80}', 300, 13),
  ('daily-champ', 'দৈনিক চ্যাম্পিয়ন', 'ডেইলি চ্যালেঞ্জে ৫/৫ পাও', '🎖️', 'milestone', '{"type": "daily_perfect"}', 50, 14),
  ('xp-1000', 'হাজারি', '১,০০০ XP অর্জন করো', '✨', 'milestone', '{"type": "total_xp", "value": 1000}', 0, 15),
  ('xp-10000', 'দশ হাজারি', '১০,০০০ XP অর্জন করো', '💎', 'milestone', '{"type": "total_xp", "value": 10000}', 0, 16),
  ('review-master', 'রিভিউ মাস্টার', '১০০টি SRS কার্ড রিভিউ করো', '🧠', 'milestone', '{"type": "srs_reviews", "value": 100}', 100, 17),
  ('practice-100', 'অনুশীলন বীর', '১০০টি প্র্যাক্টিস প্রশ্নের উত্তর দাও', '💪', 'milestone', '{"type": "practice_count", "value": 100}', 50, 18);

-- ============================================
-- Auto-create user_stats on user signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, last_active_date)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_stats();

-- ============================================
-- Updated_at triggers for new tables
-- ============================================

CREATE TRIGGER trg_chapter_progress_updated
  BEFORE UPDATE ON user_chapter_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RPC Functions
-- ============================================

-- Update chapter progress (called from practice/exam APIs)
CREATE OR REPLACE FUNCTION public.update_chapter_progress(
  p_user_id UUID,
  p_subject_id TEXT,
  p_chapter_num INTEGER,
  p_correct INTEGER DEFAULT 0,
  p_attempted INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_chapter_progress (user_id, subject_id, chapter_num, mcq_attempted, mcq_correct, last_activity)
  VALUES (p_user_id, p_subject_id, p_chapter_num, p_attempted, p_correct, now())
  ON CONFLICT (user_id, subject_id, chapter_num)
  DO UPDATE SET
    mcq_attempted = user_chapter_progress.mcq_attempted + p_attempted,
    mcq_correct = user_chapter_progress.mcq_correct + p_correct,
    mastery_pct = CASE
      WHEN (user_chapter_progress.mcq_attempted + p_attempted) > 0
      THEN ROUND(((user_chapter_progress.mcq_correct + p_correct)::numeric / (user_chapter_progress.mcq_attempted + p_attempted)::numeric) * 100, 2)
      ELSE 0
    END,
    last_activity = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Increment user XP (called from badge system)
CREATE OR REPLACE FUNCTION public.increment_user_xp(uid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_stats
  SET total_xp = total_xp + xp_amount,
      level = FLOOR(SQRT((total_xp + xp_amount) / 100.0)) + 1
  WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
