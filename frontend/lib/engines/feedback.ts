// lib/engines/feedback.ts
// Logs engine runs, SHAP values, and outcomes to Supabase for self-learning feedback

export interface EngineRunLog {
  engine: "dscr" | "surety" | "cdo" | "shap" | "cds" | "shadow_rating" | "bond_workflow" | "tefra" | "refi" | "eagleeye";
  dealId?: string;
  dealName?: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  shapValues?: Record<string, number>;
  grade?: string;
  userFeedback?: "accurate" | "too_conservative" | "too_aggressive" | null;
  sessionId: string;
  timestamp: string;
}

export interface FeedbackStats {
  totalRuns: number;
  byEngine: Record<string, number>;
  avgAccuracyFeedback: number; // % rated "accurate"
  recentRuns: EngineRunLog[];
}

const SUPABASE_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  : "";
const SUPABASE_ANON_KEY = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  : "";

// Generate deterministic session ID for the browser session
function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem("nest_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("nest_session_id", id);
  }
  return id;
}

export async function logEngineRun(log: Omit<EngineRunLog, "sessionId" | "timestamp">): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return; // silent no-op if not configured

  const fullLog: EngineRunLog = {
    ...log,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/engine_runs`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(fullLog),
    });
  } catch {
    // Never throw — feedback logging must never break the app
  }
}

export async function submitFeedback(runId: string, feedback: EngineRunLog["userFeedback"]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/engine_runs?id=eq.${runId}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_feedback: feedback }),
    });
  } catch { /* silent */ }
}

// In-memory fallback store when Supabase is unavailable
const _localRuns: EngineRunLog[] = [];

export function logLocal(log: Omit<EngineRunLog, "sessionId" | "timestamp">): EngineRunLog {
  const full: EngineRunLog = { ...log, sessionId: getSessionId(), timestamp: new Date().toISOString() };
  _localRuns.unshift(full);
  if (_localRuns.length > 50) _localRuns.pop();
  logEngineRun(log); // async fire-and-forget
  return full;
}

export function getLocalRuns(engine?: string): EngineRunLog[] {
  return engine ? _localRuns.filter(r => r.engine === engine) : _localRuns;
}
