import { authHeader } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000";

export type ActivityEvent = {
  id: string;
  kind: string;
  kind_label: string;
  text: string;
  meta: Record<string, unknown>;
  at: string;
};

export async function listActivity(limit = 25): Promise<ActivityEvent[]> {
  const r = await fetch(`${BASE}/api/activity?limit=${limit}`, {
    cache: "no-store",
    headers: authHeader(),
  });
  if (!r.ok) return [];
  return r.json();
}
