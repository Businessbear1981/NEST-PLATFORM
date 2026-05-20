import { authHeader } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Position = {
  client_id: string;
  invested_amount: number;
  current_value: number;
  net_gain: number;
  yield_ytd_pct: number;
  daily_return_pct: number;
  monthly_return_pct: number;
  maturity_reserve_date: string;
  days_to_maturity_reserve_return: number;
  b_tranche_covered: boolean;
  surplus_to_war_chest: number;
  days_active: number;
  timestamp: string;
};

export async function getPosition(clientId?: string): Promise<Position> {
  const qs = clientId ? `?client_id=${clientId}` : "";
  const r = await fetch(`${BASE}/api/fund/position${qs}`, {
    cache: "no-store",
    headers: authHeader(),
  });
  if (!r.ok) throw new Error(`position ${r.status}`);
  return r.json();
}

export async function getBenchmark() {
  const r = await fetch(`${BASE}/api/fund/benchmark`, {
    cache: "no-store",
    headers: authHeader(),
  });
  return r.json();
}

export async function getWcEligibility(clientId?: string) {
  const qs = clientId ? `?client_id=${clientId}` : "";
  const r = await fetch(`${BASE}/api/fund/wc/eligibility${qs}`, {
    cache: "no-store",
    headers: authHeader(),
  });
  return r.json();
}

export async function requestWc(clientId: string | null, amount: number) {
  const r = await fetch(`${BASE}/api/fund/wc/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ client_id: clientId ?? undefined, amount }),
  });
  return r.json();
}
