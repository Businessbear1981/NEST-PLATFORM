"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CreditCard,
  DollarSign,
  Flame,
  Globe,
  Leaf,
  LineChart,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ── Types ────────────────────────────────────────────────────────────

interface PhoenixDeal {
  id: string;
  name: string;
  address: string;
  asset_type: string;
  market_value: number;
  purchase_price: number;
  discount_pct: number;
  ltv_at_acquisition: number;
  instant_equity: number;
  track: string;
  current_noi: number;
  target_noi: number;
  current_occupancy: number;
  target_occupancy: number;
  current_dscr: number;
  stabilized_dscr: number;
  no_pi_months: number;
  source: string;
  stage: string;
}

interface RadarItem {
  id: string;
  address: string;
  type: string;
  value: number;
  asking: number;
  discount: number;
  track: string;
  score: number;
  msa: string;
}

interface WarchestAsset {
  deal_id: string;
  name: string;
  acquisition_price: number;
  current_estimated_value?: number;
  exit_price?: number;
  realized_gain?: number;
  occupancy_pct?: number;
  cash_accumulated?: number;
  months_to_maturity?: number;
  hold_months?: number;
  irr?: number;
  multiple?: number;
  status: string;
}

interface WarchestData {
  active_stabilization: WarchestAsset[];
  completed: WarchestAsset[];
  exited: WarchestAsset[];
}

interface WarchestEconomics {
  total_assets: number;
  total_acquired: number;
  total_equity_created: number;
  total_cash_accumulated: number;
  total_exits_realized: number;
  portfolio_nav: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

const API = (process.env.NEXT_PUBLIC_API_URL || "") + "/api/phoenix";

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

function money(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const STAGE_COLORS: Record<string, string> = {
  sourced: "border-[#2D6B3D]/30 bg-[#2D6B3D]/10 text-[#EDE8DC]",
  underwriting: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  loi: "border-[#C4A048]/30 bg-[#C4A048]/10 text-[#EDE8DC]",
  due_diligence: "border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-100",
  bond_structuring: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
  closed: "border-green-300/30 bg-green-400/10 text-green-100",
};

const TRACK_LABEL: Record<string, string> = {
  rent_shortfall: "Rent Shortfall",
  environmental: "Environmental",
  both: "Both",
};

type Tab = "deals" | "radar" | "warchest";

// ── Component ────────────────────────────────────────────────────────

export function PhoenixDesk() {
  const [tab, setTab] = useState<Tab>("deals");
  const [deals, setDeals] = useState<PhoenixDeal[]>([]);
  const [radar, setRadar] = useState<RadarItem[]>([]);
  const [warchest, setWarchest] = useState<WarchestData | null>(null);
  const [economics, setEconomics] = useState<WarchestEconomics | null>(null);
  const [loading, setLoading] = useState(true);
  const [radarFilter, setRadarFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData<PhoenixDeal[]>("/deals").then((d) => setDeals(d ?? [])),
      fetchData<RadarItem[]>("/radar/feed").then((d) => setRadar(d ?? [])),
      fetchData<WarchestData>("/warchest").then(setWarchest),
      fetchData<WarchestEconomics>("/warchest/economics").then(setEconomics),
    ]).finally(() => setLoading(false));
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof Flame }[] = [
    { id: "deals", label: "Deal Desk", icon: Target },
    { id: "radar", label: "Sourcing Radar", icon: Globe },
    { id: "warchest", label: "Warchest", icon: Wallet },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-red-200" />
        <span className="font-mono text-sm text-[#7A9A82]">Loading Phoenix data...</span>
      </div>
    );
  }

  const filteredRadar = radarFilter === "all" ? radar : radar.filter((r) => r.track === radarFilter);

  return (
    <div className="space-y-5">
      {/* ── Overview Metrics ─────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active Deals", value: String(deals.filter((d) => d.stage !== "closed").length), icon: Target, tone: "text-red-200 border-red-400/30 bg-red-500/8" },
          { label: "Total Equity Created", value: money(economics?.total_equity_created ?? 0), icon: TrendingUp, tone: "text-amber-200 border-amber-300/35 bg-amber-300/9" },
          { label: "Radar Opportunities", value: String(radar.length), icon: Globe, tone: "text-[#E8C87A] border-[#C4A048]/30 bg-[#C4A048]/8" },
          { label: "Portfolio NAV", value: money(economics?.portfolio_nav ?? 0), icon: Wallet, tone: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8" },
        ].map((m) => (
          <article key={m.label} className={`relative overflow-hidden rounded-[1.25rem] border p-4 ${m.tone}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{m.label}</span>
              <m.icon size={16} />
            </div>
            <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
          </article>
        ))}
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition ${
              tab === t.id
                ? "bg-red-400/15 text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.12)]"
                : "text-[#7A9A82] hover:bg-white/5 hover:text-[#EDE8DC]"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Deal Desk ────────────────────────────────────────────── */}
      {tab === "deals" && (
        <div className="space-y-5">
          {/* Pipeline */}
          <Card className="border-red-400/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-red-200">
                <Flame className="mr-2 inline h-4 w-4" />
                Phoenix Pipeline ({deals.length} deals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deals.length === 0 && (
                  <p className="py-8 text-center font-mono text-sm text-[#7A9A82]">No deals in pipeline.</p>
                )}
                {deals.map((deal) => (
                  <div key={deal.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-[0.82rem] font-semibold text-white">{deal.name}</h3>
                          <Badge variant="outline" className={`text-[0.54rem] ${STAGE_COLORS[deal.stage] ?? STAGE_COLORS.sourced}`}>
                            {deal.stage.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#7A9A82]">
                          <MapPin size={12} />
                          <span>{deal.address}</span>
                          <span>|</span>
                          <span>{deal.asset_type}</span>
                          <span>|</span>
                          <Badge variant="outline" className={`text-[0.5rem] ${deal.track === "environmental" ? "border-green-400/30 bg-green-500/10 text-green-200" : deal.track === "both" ? "border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-200" : "border-amber-300/30 bg-amber-400/10 text-amber-100"}`}>
                            {TRACK_LABEL[deal.track] ?? deal.track}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-[#7A9A82]">Market: {money(deal.market_value)}</p>
                        <p className="font-mono text-sm font-semibold text-amber-200">{money(deal.purchase_price)}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-5">
                      {[
                        { label: "Discount", value: `${deal.discount_pct}%`, color: "text-red-300" },
                        { label: "Equity", value: money(deal.instant_equity), color: "text-amber-200" },
                        { label: "LTV", value: `${deal.ltv_at_acquisition}%`, color: deal.ltv_at_acquisition < 70 ? "text-emerald-300" : "text-amber-300" },
                        { label: "DSCR (stab)", value: deal.stabilized_dscr.toFixed(2), color: deal.stabilized_dscr > 1.25 ? "text-emerald-300" : "text-amber-300" },
                        { label: "No P&I", value: `${deal.no_pi_months}mo`, color: "text-[#C4A048]" },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center">
                          <span className="font-mono text-[0.5rem] uppercase text-[#7A9A82]">{m.label}</span>
                          <p className={`font-mono text-sm font-semibold ${m.color}`}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Sourcing Radar ───────────────────────────────────────── */}
      {tab === "radar" && (
        <div className="space-y-5">
          <div className="flex gap-2">
            {["all", "rent_shortfall", "environmental", "both"].map((f) => (
              <button
                key={f}
                onClick={() => setRadarFilter(f)}
                className={`rounded-lg px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition ${
                  radarFilter === f ? "bg-[#C4A048]/15 text-[#EDE8DC]" : "text-[#7A9A82] hover:bg-white/5 hover:text-[#EDE8DC]"
                }`}
              >
                {f === "all" ? "All" : TRACK_LABEL[f] ?? f}
              </button>
            ))}
          </div>

          <Card className="border-[#C4A048]/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#E8C87A]">
                <Globe className="mr-2 inline h-4 w-4" />
                Sourcing Radar ({filteredRadar.length} opportunities)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1E4A2E] hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Address</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Type</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Value</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Asking</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Discount</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Track</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRadar.map((item) => (
                    <TableRow key={item.id} className="border-[#0D2218] hover:bg-[#030A06]/50">
                      <TableCell>
                        <div>
                          <p className="font-mono text-xs text-white">{item.address}</p>
                          <p className="font-mono text-[0.56rem] text-[#7A9A82]">{item.msa}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#EDE8DC]">{item.type}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#EDE8DC]">{money(item.value)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(item.asking)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-red-300">{item.discount}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[0.5rem] ${item.track === "environmental" ? "border-green-400/30 bg-green-500/10 text-green-200" : item.track === "both" ? "border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-200" : "border-amber-300/30 bg-amber-400/10 text-amber-100"}`}>
                          {TRACK_LABEL[item.track] ?? item.track}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.score} className="h-1.5 w-12" />
                          <span className={`font-mono text-xs ${item.score >= 85 ? "text-emerald-300" : item.score >= 75 ? "text-amber-300" : "text-red-300"}`}>
                            {item.score}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Warchest ─────────────────────────────────────────────── */}
      {tab === "warchest" && (!warchest || !economics) && (
        <div className="flex items-center justify-center py-20">
          <span className="font-mono text-sm text-[#7A9A82]">No warchest data available.</span>
        </div>
      )}
      {tab === "warchest" && warchest && economics && (
        <div className="space-y-5">
          {/* Economics Summary */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Acquired", value: money(economics.total_acquired), tone: "border-red-400/30 bg-red-500/8 text-red-200" },
              { label: "Equity Created", value: money(economics.total_equity_created), tone: "border-amber-300/35 bg-amber-300/9 text-amber-200" },
              { label: "Cash Accumulated", value: money(economics.total_cash_accumulated), tone: "border-emerald-300/30 bg-emerald-400/8 text-emerald-200" },
              { label: "Exits Realized", value: money(economics.total_exits_realized), tone: "border-fuchsia-300/30 bg-fuchsia-500/8 text-fuchsia-200" },
            ].map((m) => (
              <article key={m.label} className={`rounded-[1.25rem] border p-4 ${m.tone}`}>
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{m.label}</span>
                <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
              </article>
            ))}
          </div>

          {/* Active Stabilization */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <Building2 className="mr-2 inline h-4 w-4" />
                Active Stabilization ({warchest.active_stabilization.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warchest.active_stabilization.map((asset) => (
                  <div key={asset.deal_id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-white">{asset.name}</p>
                      <p className="font-mono text-[0.6rem] text-[#7A9A82]">Acquired: {money(asset.acquisition_price)} | Current: {money(asset.current_estimated_value ?? 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-emerald-300">{asset.occupancy_pct}% occupied</p>
                      <p className="font-mono text-xs text-amber-200">Cash: {money(asset.cash_accumulated ?? 0)}</p>
                      <p className="font-mono text-[0.56rem] text-[#7A9A82]">{asset.months_to_maturity}mo to maturity</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exited */}
          <Card className="border-emerald-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-emerald-200">
                <TrendingUp className="mr-2 inline h-4 w-4" />
                Exited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warchest.exited.map((asset) => (
                  <div key={asset.deal_id} className="flex items-center justify-between rounded-lg border border-emerald-300/15 bg-emerald-400/5 px-4 py-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-white">{asset.name}</p>
                      <p className="font-mono text-[0.6rem] text-[#7A9A82]">Acquired: {money(asset.acquisition_price)} → Exited: {money(asset.exit_price ?? 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-emerald-300">+{money(asset.realized_gain ?? 0)}</p>
                      <p className="font-mono text-[0.6rem] text-[#7A9A82]">{asset.hold_months}mo | {asset.irr}% IRR | {asset.multiple}x</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PhoenixDesk;
