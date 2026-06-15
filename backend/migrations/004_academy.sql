-- ============================================================
-- NEST Academy — Progress & Gamification Tables
-- Migration: 004_academy.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE: academy_progress
-- Per-user, per-exam running totals
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_progress (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             TEXT        NOT NULL,          -- JWT sub or anonymous session ID
  exam_code           TEXT        NOT NULL,          -- 'S7' | 'S52' | 'S54' | 'S28'
  questions_answered  INT         DEFAULT 0,
  questions_correct   INT         DEFAULT 0,
  xp_earned           INT         DEFAULT 0,
  current_streak      INT         DEFAULT 0,
  longest_streak      INT         DEFAULT 0,
  last_activity       TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exam_code)
);

CREATE INDEX IF NOT EXISTS idx_academy_progress_user_id
  ON academy_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_academy_progress_exam_code
  ON academy_progress(exam_code);

-- ────────────────────────────────────────────────────────────
-- TABLE: academy_xp
-- Aggregate XP, level, and badges per user
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_xp (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  total_xp    INT     DEFAULT 0,
  level       INT     DEFAULT 1,
  level_name  TEXT    DEFAULT 'Analyst',
  badges      JSONB   DEFAULT '[]',
  weekly_xp   INT     DEFAULT 0,
  week_start  DATE    DEFAULT CURRENT_DATE,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_xp_user_id
  ON academy_xp(user_id);

CREATE INDEX IF NOT EXISTS idx_academy_xp_total_xp
  ON academy_xp(total_xp DESC);

-- ────────────────────────────────────────────────────────────
-- TABLE: academy_sessions
-- Daily session log — one row per practice session
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_sessions (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             TEXT    NOT NULL,
  session_date        DATE    DEFAULT CURRENT_DATE,
  questions_answered  INT     DEFAULT 0,
  xp_earned           INT     DEFAULT 0,
  exams_practiced     TEXT[]  DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_sessions_user_id
  ON academy_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_academy_sessions_date
  ON academy_sessions(session_date DESC);

-- ────────────────────────────────────────────────────────────
-- TABLE: academy_badges
-- Badge catalog — reference table, rarely changes
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_badges (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_id    TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  description TEXT,
  xp_reward   INT     DEFAULT 0,
  icon        TEXT    DEFAULT '🏆'
);

CREATE INDEX IF NOT EXISTS idx_academy_badges_badge_id
  ON academy_badges(badge_id);

-- ────────────────────────────────────────────────────────────
-- TRIGGER: auto-update academy_progress.updated_at
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_academy_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_academy_progress_updated_at ON academy_progress;

CREATE TRIGGER trg_academy_progress_updated_at
  BEFORE UPDATE ON academy_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_academy_progress_updated_at();

-- ────────────────────────────────────────────────────────────
-- SEED: academy_badges
-- Insert only if not already present (idempotent)
-- ────────────────────────────────────────────────────────────
INSERT INTO academy_badges (badge_id, name, description, xp_reward, icon)
VALUES
  (
    'first_answer',
    'First Answer',
    'Answered your first question correctly. Every bond desk starts somewhere.',
    10,
    '🎯'
  ),
  (
    'muni_master',
    'Muni Master',
    'Answered 50 Series 52 questions correctly. You know your way around the municipal market.',
    250,
    '🏛️'
  ),
  (
    'bond_pro',
    'Bond Pro',
    'Answered 50 Series 7 questions correctly. General securities knowledge locked in.',
    250,
    '📈'
  ),
  (
    'streak_king',
    'Streak King',
    'Hit a 10-question correct streak. Consistency is the edge.',
    150,
    '🔥'
  ),
  (
    'perfect_score',
    'Perfect Score',
    'Completed a 10-question set with 100% accuracy. Zero errors — JPMorgan standard.',
    200,
    '💎'
  ),
  (
    'speed_run',
    'Speed Run',
    'Answered 20 questions in a single session. Volume breeds mastery.',
    100,
    '⚡'
  ),
  (
    'centurion',
    'Centurion',
    'Answered 100 questions total across all exams. You are putting in the work.',
    300,
    '⚔️'
  ),
  (
    's54_specialist',
    'S54 Specialist',
    'Answered 50 Series 54 questions correctly. Municipal fund management is your domain.',
    250,
    '🏙️'
  ),
  (
    's28_closer',
    'S28 Closer',
    'Answered 50 Series 28 questions correctly. Operations and financial responsibility — dialed in.',
    250,
    '🔐'
  ),
  (
    'iron_week',
    'Iron Week',
    'Practiced every day for 7 consecutive days. Discipline compounds like interest.',
    500,
    '🗓️'
  ),
  (
    'leaderboard_top10',
    'Top 10',
    'Ranked in the top 10 on the weekly XP leaderboard.',
    400,
    '🥇'
  ),
  (
    'xp_1000',
    '1,000 XP Club',
    'Accumulated 1,000 total XP. Associate-track confirmed.',
    100,
    '💰'
  )
ON CONFLICT (badge_id) DO NOTHING;
