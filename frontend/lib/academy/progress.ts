/**
 * NEST Academy — Progress & Gamification
 * Pure TypeScript functions for reading and writing academy progress.
 * All Supabase errors are caught and logged; nothing throws to the UI.
 */

import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ExamProgress {
  exam_code: string;
  questions_answered: number;
  questions_correct: number;
  xp_earned: number;
  current_streak: number;
  longest_streak: number;
  last_activity: string | null;
}

export interface AcademyProgress {
  user_id: string;
  exams: Record<string, ExamProgress>;
  total_questions_answered: number;
  total_questions_correct: number;
  total_xp: number;
}

export interface XPData {
  user_id: string;
  total_xp: number;
  weekly_xp: number;
  level: number;
  level_name: string;
  next_level_xp: number;
  level_progress: number; // 0–1 fraction through current level
  badges: string[];       // array of badge_ids
}

export interface LevelInfo {
  level: number;
  name: string;
  nextLevelXP: number;  // XP needed to reach NEXT level (total)
  progress: number;     // 0–1 fraction through current level
}

// ─────────────────────────────────────────────────────────────
// XP Level thresholds
// ─────────────────────────────────────────────────────────────

const LEVELS: Array<{ level: number; name: string; minXP: number }> = [
  { level: 1, name: "Analyst",          minXP: 0      },
  { level: 2, name: "Associate",        minXP: 500    },
  { level: 3, name: "VP",               minXP: 1_500  },
  { level: 4, name: "Director",         minXP: 3_500  },
  { level: 5, name: "Managing Director",minXP: 7_500  },
  { level: 6, name: "Partner",          minXP: 15_000 },
  { level: 7, name: "Principal",        minXP: 30_000 },
];

/**
 * Derive level, name, next-level threshold, and intra-level progress from
 * a raw XP total.
 */
export function xpToLevel(totalXP: number): LevelInfo {
  let current = LEVELS[0];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      current = LEVELS[i];
      break;
    }
  }

  const isMaxLevel = current.level === LEVELS[LEVELS.length - 1].level;

  if (isMaxLevel) {
    return {
      level: current.level,
      name: current.name,
      nextLevelXP: current.minXP, // already at cap
      progress: 1,
    };
  }

  const next = LEVELS[current.level]; // LEVELS is 0-indexed; level 1 → index 0; next level = index current.level
  const xpIntoLevel = totalXP - current.minXP;
  const levelWidth  = next.minXP - current.minXP;
  const progress    = Math.min(xpIntoLevel / levelWidth, 1);

  return {
    level: current.level,
    name: current.name,
    nextLevelXP: next.minXP,
    progress,
  };
}

// ─────────────────────────────────────────────────────────────
// Anonymous session ID
// ─────────────────────────────────────────────────────────────

const SESSION_KEY = "nest_academy_session_id";

/** Return an anonymous session ID, creating and persisting one if needed. */
export function getSessionId(): string {
  if (typeof window === "undefined") {
    // SSR guard: return a placeholder (never persisted)
    return "ssr-placeholder";
  }

  let id = localStorage.getItem(SESSION_KEY);

  if (!id) {
    // Crypto-random 128-bit hex string
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    id = Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem(SESSION_KEY, id);
  }

  return id;
}

// ─────────────────────────────────────────────────────────────
// Load progress
// ─────────────────────────────────────────────────────────────

/**
 * Load all exam-level progress rows for a user and flatten into
 * the AcademyProgress shape.
 */
export async function loadProgress(userId: string): Promise<AcademyProgress> {
  const empty: AcademyProgress = {
    user_id: userId,
    exams: {},
    total_questions_answered: 0,
    total_questions_correct: 0,
    total_xp: 0,
  };

  try {
    const { data, error } = await supabase
      .from("academy_progress")
      .select(
        "exam_code, questions_answered, questions_correct, xp_earned, current_streak, longest_streak, last_activity"
      )
      .eq("user_id", userId);

    if (error) {
      console.error("[academy] loadProgress error:", error.message);
      return empty;
    }

    const exams: Record<string, ExamProgress> = {};
    let totalAnswered = 0;
    let totalCorrect  = 0;
    let totalXP       = 0;

    for (const row of data ?? []) {
      exams[row.exam_code] = {
        exam_code:          row.exam_code,
        questions_answered: row.questions_answered ?? 0,
        questions_correct:  row.questions_correct  ?? 0,
        xp_earned:          row.xp_earned          ?? 0,
        current_streak:     row.current_streak      ?? 0,
        longest_streak:     row.longest_streak      ?? 0,
        last_activity:      row.last_activity       ?? null,
      };
      totalAnswered += row.questions_answered ?? 0;
      totalCorrect  += row.questions_correct  ?? 0;
      totalXP       += row.xp_earned          ?? 0;
    }

    return {
      user_id: userId,
      exams,
      total_questions_answered: totalAnswered,
      total_questions_correct:  totalCorrect,
      total_xp:                 totalXP,
    };
  } catch (err) {
    console.error("[academy] loadProgress unexpected:", err);
    return empty;
  }
}

// ─────────────────────────────────────────────────────────────
// Record an answer
// ─────────────────────────────────────────────────────────────

/**
 * Upsert the per-exam progress row and increment aggregates atomically.
 * Also appends a session log entry.
 */
export async function recordAnswer(
  userId: string,
  examCode: string,
  correct: boolean,
  xpEarned: number
): Promise<void> {
  try {
    // ── 1. Fetch current row (or treat as zeroed) ──────────────
    const { data: existing, error: fetchErr } = await supabase
      .from("academy_progress")
      .select("questions_answered, questions_correct, xp_earned, current_streak, longest_streak")
      .eq("user_id", userId)
      .eq("exam_code", examCode)
      .maybeSingle();

    if (fetchErr) {
      console.error("[academy] recordAnswer fetch error:", fetchErr.message);
      return;
    }

    const prev = existing ?? {
      questions_answered: 0,
      questions_correct:  0,
      xp_earned:          0,
      current_streak:     0,
      longest_streak:     0,
    };

    const newAnswered = prev.questions_answered + 1;
    const newCorrect  = prev.questions_correct  + (correct ? 1 : 0);
    const newXP       = prev.xp_earned          + (correct ? xpEarned : 0);
    const newStreak   = correct ? prev.current_streak + 1 : 0;
    const newLongest  = Math.max(prev.longest_streak, newStreak);

    // ── 2. Upsert progress row ─────────────────────────────────
    const { error: upsertErr } = await supabase
      .from("academy_progress")
      .upsert(
        {
          user_id:            userId,
          exam_code:          examCode,
          questions_answered: newAnswered,
          questions_correct:  newCorrect,
          xp_earned:          newXP,
          current_streak:     newStreak,
          longest_streak:     newLongest,
          last_activity:      new Date().toISOString(),
        },
        { onConflict: "user_id,exam_code" }
      );

    if (upsertErr) {
      console.error("[academy] recordAnswer upsert error:", upsertErr.message);
      return;
    }

    // ── 3. Update aggregate XP table ───────────────────────────
    if (correct && xpEarned > 0) {
      await _incrementXP(userId, xpEarned, examCode);
    }

    // ── 4. Log session entry ────────────────────────────────────
    await _logSession(userId, examCode, xpEarned > 0 && correct ? xpEarned : 0);
  } catch (err) {
    console.error("[academy] recordAnswer unexpected:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// XP data
// ─────────────────────────────────────────────────────────────

/** Return the full XP / level / badge payload for a user. */
export async function getXPData(userId: string): Promise<XPData> {
  const fallback: XPData = {
    user_id:        userId,
    total_xp:       0,
    weekly_xp:      0,
    level:          1,
    level_name:     "Analyst",
    next_level_xp:  500,
    level_progress: 0,
    badges:         [],
  };

  try {
    const { data, error } = await supabase
      .from("academy_xp")
      .select("total_xp, weekly_xp, level, level_name, badges, week_start")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[academy] getXPData error:", error.message);
      return fallback;
    }

    if (!data) return fallback;

    const levelInfo = xpToLevel(data.total_xp ?? 0);

    return {
      user_id:        userId,
      total_xp:       data.total_xp   ?? 0,
      weekly_xp:      data.weekly_xp  ?? 0,
      level:          levelInfo.level,
      level_name:     levelInfo.name,
      next_level_xp:  levelInfo.nextLevelXP,
      level_progress: levelInfo.progress,
      badges:         (data.badges as string[]) ?? [],
    };
  } catch (err) {
    console.error("[academy] getXPData unexpected:", err);
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────
// Badge checks
// ─────────────────────────────────────────────────────────────

/**
 * Evaluate which badges the user has newly earned and award them.
 * Returns the list of newly-awarded badge IDs (empty if none).
 */
export async function checkBadges(
  userId: string,
  progress: AcademyProgress
): Promise<string[]> {
  try {
    // ── 1. Load current badges ────────────────────────────────
    const { data: xpRow, error: xpErr } = await supabase
      .from("academy_xp")
      .select("badges, total_xp")
      .eq("user_id", userId)
      .maybeSingle();

    if (xpErr) {
      console.error("[academy] checkBadges xp fetch error:", xpErr.message);
      return [];
    }

    const currentBadges = new Set<string>((xpRow?.badges as string[]) ?? []);
    const totalXP       = xpRow?.total_xp ?? 0;
    const newBadges: string[] = [];

    // ── 2. Badge criteria ─────────────────────────────────────
    const totalCorrect  = progress.total_questions_correct;
    const s52Correct    = progress.exams["S52"]?.questions_correct ?? 0;
    const s7Correct     = progress.exams["S7"]?.questions_correct  ?? 0;
    const s54Correct    = progress.exams["S54"]?.questions_correct ?? 0;
    const s28Correct    = progress.exams["S28"]?.questions_correct ?? 0;
    const maxStreak     = Math.max(
      ...Object.values(progress.exams).map((e) => e.longest_streak),
      0
    );

    // Accuracy across any single exam with >=10 questions answered
    const anyPerfect10 = Object.values(progress.exams).some(
      (e) =>
        e.questions_answered >= 10 &&
        e.questions_correct === e.questions_answered
    );

    // Today's session questions total (approximated from all exams last_activity = today)
    const todayStr = new Date().toISOString().slice(0, 10);
    const sessionAnsweredToday = Object.values(progress.exams)
      .filter((e) => e.last_activity?.startsWith(todayStr))
      .reduce((sum, e) => sum + e.questions_answered, 0);

    const checks: Array<{ id: string; earned: boolean }> = [
      { id: "first_answer",      earned: totalCorrect >= 1         },
      { id: "muni_master",       earned: s52Correct  >= 50        },
      { id: "bond_pro",          earned: s7Correct   >= 50        },
      { id: "streak_king",       earned: maxStreak   >= 10        },
      { id: "perfect_score",     earned: anyPerfect10              },
      { id: "speed_run",         earned: sessionAnsweredToday >= 20 },
      { id: "centurion",         earned: progress.total_questions_answered >= 100 },
      { id: "s54_specialist",    earned: s54Correct  >= 50        },
      { id: "s28_closer",        earned: s28Correct  >= 50        },
      { id: "xp_1000",           earned: totalXP     >= 1_000     },
    ];

    for (const { id, earned } of checks) {
      if (earned && !currentBadges.has(id)) {
        newBadges.push(id);
        currentBadges.add(id);
      }
    }

    // ── 3. Persist new badges ─────────────────────────────────
    if (newBadges.length > 0) {
      const updatedBadges = Array.from(currentBadges);

      // Fetch XP reward for each new badge and sum
      const { data: badgeRows } = await supabase
        .from("academy_badges")
        .select("badge_id, xp_reward")
        .in("badge_id", newBadges);

      const bonusXP = (badgeRows ?? []).reduce(
        (sum: number, b: { badge_id: string; xp_reward: number }) => sum + (b.xp_reward ?? 0),
        0
      );

      const levelInfo = xpToLevel(totalXP + bonusXP);

      const { error: updateErr } = await supabase
        .from("academy_xp")
        .upsert(
          {
            user_id:    userId,
            badges:     updatedBadges,
            total_xp:   totalXP + bonusXP,
            level:      levelInfo.level,
            level_name: levelInfo.name,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (updateErr) {
        console.error("[academy] checkBadges update error:", updateErr.message);
      }
    }

    return newBadges;
  } catch (err) {
    console.error("[academy] checkBadges unexpected:", err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

async function _incrementXP(
  userId: string,
  xpDelta: number,
  examCode: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("academy_xp")
      .select("total_xp, weekly_xp, week_start")
      .eq("user_id", userId)
      .maybeSingle();

    const todayDate  = new Date().toISOString().slice(0, 10);
    const weekStart  = existing?.week_start ?? todayDate;
    const isNewWeek  = weekStart < _getWeekStart();

    const newTotal   = (existing?.total_xp  ?? 0) + xpDelta;
    const newWeekly  = isNewWeek
      ? xpDelta
      : (existing?.weekly_xp ?? 0) + xpDelta;

    const levelInfo  = xpToLevel(newTotal);

    await supabase.from("academy_xp").upsert(
      {
        user_id:    userId,
        total_xp:   newTotal,
        weekly_xp:  newWeekly,
        week_start: isNewWeek ? _getWeekStart() : weekStart,
        level:      levelInfo.level,
        level_name: levelInfo.name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.error("[academy] _incrementXP unexpected:", err);
  }
}

async function _logSession(
  userId: string,
  examCode: string,
  xpEarned: number
): Promise<void> {
  try {
    const todayDate = new Date().toISOString().slice(0, 10);

    // Check if a session row exists for today
    const { data: existing } = await supabase
      .from("academy_sessions")
      .select("id, questions_answered, xp_earned, exams_practiced")
      .eq("user_id", userId)
      .eq("session_date", todayDate)
      .maybeSingle();

    if (existing) {
      const exams = Array.from(
        new Set([...(existing.exams_practiced ?? []), examCode])
      );

      await supabase
        .from("academy_sessions")
        .update({
          questions_answered: (existing.questions_answered ?? 0) + 1,
          xp_earned:          (existing.xp_earned          ?? 0) + xpEarned,
          exams_practiced:    exams,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("academy_sessions").insert({
        user_id:            userId,
        session_date:       todayDate,
        questions_answered: 1,
        xp_earned:          xpEarned,
        exams_practiced:    [examCode],
      });
    }
  } catch (err) {
    console.error("[academy] _logSession unexpected:", err);
  }
}

/** Return the ISO date string for the Monday of the current week. */
function _getWeekStart(): string {
  const now  = new Date();
  const day  = now.getDay(); // 0=Sun…6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  const mon  = new Date(now);
  mon.setDate(now.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}
