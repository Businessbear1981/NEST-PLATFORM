import { authHeader } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000";

function authJsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...authHeader() };
}

export type ContentType = { value: string; label: string };

export type Generation = {
  id: string;
  content_type: string;
  content_type_label: string;
  content: string;
  word_count: number;
  estimated_read_time: string;
  generated_at: string;
  context: Record<string, unknown>;
  error?: string | null;
};

export async function listContentTypes(): Promise<ContentType[]> {
  const r = await fetch(`${BASE}/api/marketing/content-types`, { cache: "no-store" });
  return r.json();
}

export async function generate(content_type: string, context: Record<string, unknown>): Promise<Generation> {
  const r = await fetch(`${BASE}/api/marketing/generate`, {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify({ content_type, context }),
  });
  return r.json();
}

export async function generateBatch(deal_id: string, context: Record<string, unknown>) {
  const r = await fetch(`${BASE}/api/marketing/batch`, {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify({ deal_id, context }),
  });
  return r.json();
}

export async function listHistory(): Promise<Generation[]> {
  const r = await fetch(`${BASE}/api/marketing/history`, {
    cache: "no-store",
    headers: authHeader(),
  });
  if (!r.ok) return [];
  return r.json();
}

export type IntakePayload = {
  name: string;
  company: string;
  email?: string;
  project_type: string;
  size_usd?: number;
  timeline?: string;
};

export type IntakeResult = {
  lead_id: string;
  classification: { kind: string; priority: string; suggested_next: string };
  immediate_response: { content: string; error?: string | null };
  received_at: string;
  error?: string;
};

export async function submitIntake(payload: IntakePayload): Promise<IntakeResult> {
  const r = await fetch(`${BASE}/api/marketing/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export type ActiveDeal = {
  id: string;
  name: string;
  asset_class: string;
  location: string;
  size_usd: number;
  projected_yield_pct: number;
  stage: string;
  target_close: string;
  summary: string;
};

export async function listActiveDeals(): Promise<ActiveDeal[]> {
  const r = await fetch(`${BASE}/api/deals/active`, { cache: "no-store" });
  return r.json();
}
