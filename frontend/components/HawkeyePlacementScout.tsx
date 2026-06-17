"use client";
import { useState, useMemo, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nest-platform-production.up.railway.app";
import {
  Loader2, Users, Target, FileText, BookOpen, Send, DollarSign,
  CheckCircle2, Calendar, MessageSquare, TrendingUp, Building2,
  Flame, ThermometerSun, Snowflake, Plus, Phone, ClipboardList,
  BarChart3, ArrowRight, X, RefreshCw, Mail, Eye, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";

/* ─── Formatting ─── */
function money(val: number) {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function pct(num: number, denom: number) {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}

function bps(val: number | null) {
  if (val === null || val === undefined) return "—";
  return `T+${val}bp`;
}

/* ─── Offering Type ─── */
type OfferingType = {
  id: string;
  name: string;
  totalRaise: number;
  rating: string;
  coupon: number;
  spread: number | null;
  subscribed: number;
  targetClose: string;
  status: string;
  tranches: { series: string; size: number; subscribed: number; rating: string }[];
};

type InvestorType = {
  id: string;
  name: string;
  type: string;
  aum: number;
  minTicket: number;
  maxTicket: number;
  appetite: "hot" | "warm" | "cold";
  sectors: string[];
  lastDeal: string;
  yieldFloor: number;
};

// DEMO_INVESTORS removed — loaded from /api/hawkeye/buyers, grouped by type in component state

// DEMO_ORDERS removed — loaded from /api/hawkeye/order-book/<deal_id> in component state
// DEMO_ROADSHOW removed — TODO: add GET /api/hawkeye/roadshow endpoint

const INVESTOR_TABS = [
  { key: "insurance", label: "Insurance" },
  { key: "pension_funds", label: "Pension Funds" },
  { key: "banks", label: "Banks" },
  { key: "family_offices", label: "Family Offices" },
  { key: "credit_funds", label: "Credit Funds" },
  { key: "ria_wealth", label: "RIA/Wealth" },
  { key: "strategic", label: "Strategic" },
] as const;

const statusColors: Record<string, string> = {
  "pre-marketing": "border-amber-400/30 bg-amber-400/10 text-amber-200",
  marketing: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  closing: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

const orderStatusColors: Record<string, string> = {
  firm: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  soft: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  indicated: "border-[#2D6B3D]/30 bg-[#7A9A82]/10 text-[#EDE8DC]",
};

const appetiteIcon = (appetite: string) => {
  if (appetite === "hot") return <Flame size={13} className="text-red-400" />;
  if (appetite === "warm") return <ThermometerSun size={13} className="text-amber-400" />;
  return <Snowflake size={13} className="text-[#C4A048]" />;
};

const meetingStatusStyle: Record<string, string> = {
  completed: "border-emerald-400/25 bg-emerald-400/8 text-emerald-300",
  scheduled: "border-fuchsia-400/25 bg-fuchsia-400/8 text-fuchsia-200",
  cancelled: "border-red-400/25 bg-red-400/8 text-red-300",
};

/* ─── Sub-components ─── */

function OfferingCard({
  offering,
  selected,
  onSelect,
}: {
  offering: OfferingType;
  selected: boolean;
  onSelect: () => void;
}) {
  const subscribedPct = pct(offering.subscribed, offering.totalRaise);
  return (
    <button
      onClick={onSelect}
      className={`min-w-[300px] flex-shrink-0 rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-fuchsia-400/50 bg-fuchsia-500/10 ring-1 ring-fuchsia-400/30"
          : "border-white/10 bg-black/30 hover:border-fuchsia-300/25 hover:bg-black/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-[Cormorant_Garamond] text-[0.95rem] font-semibold text-white">
            {offering.name}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-[#C4A048]">
              {money(offering.totalRaise)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.56rem] text-[#EDE8DC]">
              {offering.rating}
            </span>
            <span className="font-mono text-[0.62rem] text-[#7A9A82]">
              {offering.coupon}% · {bps(offering.spread)}
            </span>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase ${statusColors[offering.status]}`}>
          {offering.status.replace("-", " ")}
        </span>
      </div>

      {/* Subscription bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between font-mono text-[0.56rem]">
          <span className="text-[#7A9A82]">Subscribed</span>
          <span className="font-semibold text-white">
            {money(offering.subscribed)} / {money(offering.totalRaise)} ({subscribedPct}%)
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all ${
              subscribedPct >= 90
                ? "bg-emerald-500"
                : subscribedPct >= 50
                ? "bg-fuchsia-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(subscribedPct, 100)}%` }}
          />
        </div>
        {/* Tranche breakdown */}
        <div className="mt-2 flex gap-3">
          {offering.tranches.map((t) => (
            <div key={t.series} className="flex-1">
              <div className="flex items-center justify-between font-mono text-[0.48rem] text-[#7A9A82]">
                <span>Series {t.series} ({t.rating})</span>
                <span>{pct(t.subscribed, t.size)}%</span>
              </div>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-fuchsia-400/60"
                  style={{ width: `${pct(t.subscribed, t.size)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-2 font-mono text-[0.52rem] text-[#7A9A82]">
        Target close: {offering.targetClose}
      </p>
    </button>
  );
}

function InvestorCard({ investor, onAddToBook }: { investor: InvestorType; onAddToBook: (inv: InvestorType) => void }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 p-3 hover:border-fuchsia-300/20">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {appetiteIcon(investor.appetite)}
            <p className="truncate font-[Space_Grotesk] text-sm font-semibold text-white">{investor.name}</p>
          </div>
          <p className="mt-1 font-mono text-[0.58rem] text-[#7A9A82]">
            AUM {money(investor.aum)} · Ticket {money(investor.minTicket)}–{money(investor.maxTicket)}
          </p>
        </div>
        <span className="font-mono text-[0.52rem] text-[#C4A048]">{investor.yieldFloor}% floor</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {investor.sectors.map((s) => (
          <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.48rem] text-[#7A9A82]">
            {s}
          </span>
        ))}
      </div>

      <p className="mt-2 font-mono text-[0.52rem] italic text-[#7A9A82]">
        {investor.lastDeal}
      </p>

      <Button
        onClick={() => onAddToBook(investor)}
        className="mt-2 w-full rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/8 px-2 py-1 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-fuchsia-200 hover:bg-fuchsia-500/15"
      >
        <Plus size={10} className="mr-1" /> Add to Book
      </Button>
    </div>
  );
}

/* ─── Pipeline ─── */
function OutreachPipeline() {
  const stages = [
    { label: "Contacted", count: 18, color: "bg-[#2D6B3D]" },
    { label: "Responded", count: 12, color: "bg-[#C4A048]" },
    { label: "Meeting", count: 8, color: "bg-fuchsia-500" },
    { label: "Indication", count: 5, color: "bg-amber-500" },
    { label: "Allocated", count: 3, color: "bg-emerald-500" },
  ];
  return (
    <div className="mt-3 space-y-1.5">
      <p className="font-mono text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-[#7A9A82]">
        Outreach Pipeline
      </p>
      {stages.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="w-16 font-mono text-[0.52rem] text-[#7A9A82]">{s.label}</span>
          <div className="flex-1">
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${s.color}`}
                style={{ width: `${(s.count / 18) * 100}%` }}
              />
            </div>
          </div>
          <span className="w-4 text-right font-mono text-[0.56rem] font-semibold text-white">{s.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function HawkeyePlacementScout({
  dealId,
  summaryMode,
}: {
  dealId?: string;
  summaryMode?: boolean;
}) {
  const [offerings, setOfferings] = useState<OfferingType[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<string>("");
  const [investors, setInvestors] = useState<Record<string, InvestorType[]>>({});
  const [orders, setOrders] = useState<{ id: string | number; investor: string; amount: number; status: "firm" | "soft" | "indicated"; spreadBid: number | null; tranche: string; notes: string }[]>([]);
  const [roadshow, setRoadshow] = useState<{ id: string | number; investor: string; date: string; time: string; status: "completed" | "scheduled" | "cancelled"; feedback: string | null }[]>([]);
  const [investorTab, setInvestorTab] = useState<string>("insurance");
  const [bookInvestors, setBookInvestors] = useState<string[]>([]);
  const [teaserContent, setTeaserContent] = useState<string | null>(null);
  const [teaserGenerating, setTeaserGenerating] = useState(false);

  /* ─── Fetch offerings from /api/hawkeye/deals ─── */
  useEffect(() => {
    fetch(`${API}/api/hawkeye/deals`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const mapped: OfferingType[] = (json.data?.deals ?? []).map((d: any) => ({
          id: d.id,
          name: d.name,
          totalRaise: d.bond_face ?? 0,
          rating: d.preferred_rating ?? "BBB+",
          coupon: 7.0,
          spread: null,
          subscribed: d.potential_demand_usd ?? 0,
          targetClose: "",
          status: d.status === "active" ? "marketing" : d.status === "pipeline" ? "pre-marketing" : d.status,
          tranches: [
            { series: "A", size: Math.round((d.bond_face ?? 0) * 0.75), subscribed: 0, rating: "A" },
            { series: "B", size: Math.round((d.bond_face ?? 0) * 0.25), subscribed: 0, rating: "BBB" },
          ],
        }));
        if (mapped.length > 0) {
          setOfferings(mapped);
          setSelectedOffering(mapped[0].id);
        }
      })
      .catch(() => {});
  }, []);

  /* ─── Fetch investors from /api/hawkeye/buyers ─── */
  useEffect(() => {
    fetch(`${API}/api/hawkeye/buyers`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const flat: any[] = json.data?.buyers ?? [];
        const grouped: Record<string, InvestorType[]> = {};
        for (const b of flat) {
          const key = b.type === "family_office" ? "family_offices"
            : b.type === "credit_fund" ? "credit_funds"
            : b.type === "pension" ? "pension_funds"
            : b.type === "ria" ? "ria_wealth"
            : b.type === "insurance" ? "insurance"
            : b.type === "bank" ? "banks"
            : "strategic";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            id: b.id,
            name: b.name,
            type: b.type,
            aum: b.aum_usd ?? 0,
            minTicket: b.min_ticket_usd ?? 0,
            maxTicket: b.max_ticket_usd ?? 0,
            appetite: b.relationship === "existing" ? "hot" : "warm",
            sectors: b.preferred_sectors ?? [],
            lastDeal: b.relationship === "existing" ? "Existing relationship" : "New prospect",
            yieldFloor: b.yield_floor_pct ?? 6.0,
          });
        }
        setInvestors(grouped);
      })
      .catch(() => {});
  }, []);

  /* ─── Fetch order book from /api/hawkeye/order-book/<deal_id> ─── */
  useEffect(() => {
    const id = dealId || selectedOffering;
    if (!id) return;
    fetch(`${API}/api/hawkeye/order-book/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const mapped = (json.data?.orders ?? []).map((o: any) => ({
          id: o.id,
          investor: o.investorName ?? o.investorId ?? "Unknown",
          amount: o.amount_usd ?? 0,
          status: (o.status === "allocated" ? "firm" : o.status === "indicated" ? "indicated" : "soft") as "firm" | "soft" | "indicated",
          spreadBid: o.yield_target_pct ? Math.round((o.yield_target_pct - 5) * 100) : null,
          tranche: o.tranche ?? "A",
          notes: o.notes ?? "",
        }));
        setOrders(mapped);
      })
      .catch(() => {});
  }, [dealId, selectedOffering]);

  // TODO: add GET /api/hawkeye/roadshow endpoint — roadshow stays empty until wired

  /* trpc hooks — kept from original */
  const buyersQuery = trpc.hawkeye.buyers.useQuery();
  const matchMutation = trpc.hawkeye.match.useMutation();
  const teaserMutation = trpc.hawkeye.teaser.useMutation();
  const orderBookQuery = trpc.hawkeye.orderBook.useQuery(
    dealId ? { dealId } : skipToken,
  );
  const indicateMutation = trpc.hawkeye.indicate.useMutation({
    onSuccess: () => orderBookQuery.refetch(),
  });
  const allocateMutation = trpc.hawkeye.allocate.useMutation();

  const offering: OfferingType = offerings.find((o) => o.id === selectedOffering) ?? {
    id: "", name: "—", totalRaise: 0, rating: "—", coupon: 0, spread: null,
    subscribed: 0, targetClose: "—", status: "pre-marketing", tranches: [],
  };

  /* Book building stats */
  const bookStats = useMemo(() => {
    const firmTotal = orders.filter((o) => o.status === "firm").reduce((s, o) => s + o.amount, 0);
    const softTotal = orders.filter((o) => o.status === "soft").reduce((s, o) => s + o.amount, 0);
    const indicatedTotal = orders.filter((o) => o.status === "indicated").reduce((s, o) => s + o.amount, 0);
    const total = firmTotal + softTotal + indicatedTotal;
    const trancheA = orders.filter((o) => o.tranche === "A").reduce((s, o) => s + o.amount, 0);
    const trancheB = orders.filter((o) => o.tranche === "B").reduce((s, o) => s + o.amount, 0);
    return { firmTotal, softTotal, indicatedTotal, total, trancheA, trancheB };
  }, [orders]);

  const oversubscribed = bookStats.total > offering.totalRaise;

  /* ─── Summary Mode ─── */
  if (summaryMode) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-fuchsia-200">
          <Target size={14} /> Hawkeye Placement
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Active Deals</p>
            <p className="font-mono text-xl font-semibold text-white">{offerings.length}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Book Size</p>
            <p className="font-mono text-xl font-semibold text-[#C4A048]">{money(bookStats.total)}</p>
          </div>
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[#7A9A82]">Investors</p>
            <p className="font-mono text-xl font-semibold text-amber-100">{orders.length}</p>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          {offerings.map((o) => (
            <div key={o.id} className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] p-2">
              <p className="truncate font-mono text-[0.48rem] text-[#7A9A82]">{o.name.split(" — ")[0]}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-fuchsia-500"
                  style={{ width: `${pct(o.subscribed, o.totalRaise)}%` }}
                />
              </div>
              <p className="mt-0.5 font-mono text-[0.44rem] text-[#7A9A82]">{pct(o.subscribed, o.totalRaise)}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Full Dashboard ─── */
  return (
    <div className="space-y-5">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fuchsia-200">
            <Target size={17} /> Hawkeye — Institutional Placement Engine
          </div>
          <p className="mt-1 font-[Space_Grotesk] text-sm text-[#7A9A82]">
            Book building, investor matching, roadshow management, and AI teasers.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.56rem] text-[#7A9A82]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live
          </span>
          <span>|</span>
          <span>{offerings.length} offerings</span>
          <span>|</span>
          <span>{orders.length} orders</span>
        </div>
      </div>

      {/* ═══ Section 1: Active Offerings ═══ */}
      <div>
        <h2 className="mb-3 font-[Cormorant_Garamond] text-lg font-semibold text-white">
          Active Offerings
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {offerings.map((o) => (
            <OfferingCard
              key={o.id}
              offering={o}
              selected={o.id === selectedOffering}
              onSelect={() => setSelectedOffering(o.id)}
            />
          ))}
        </div>
      </div>

      {/* ═══ Section 2: Three-Column Layout ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* ─── Left: Investor Universe ─── */}
        <div className="col-span-3 rounded-2xl border border-white/10 bg-black/30 p-4">
          <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
            <Users size={15} className="text-fuchsia-300" /> Investor Universe
          </h2>

          {/* Tabs */}
          <div className="mt-3 flex flex-wrap gap-1">
            {INVESTOR_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setInvestorTab(tab.key)}
                className={`rounded-lg px-2 py-1 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.1em] transition-all ${
                  investorTab === tab.key
                    ? "border border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200"
                    : "border border-transparent bg-white/5 text-[#7A9A82] hover:bg-white/8 hover:text-[#EDE8DC]"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[0.44rem] text-[#7A9A82]">
                  {(investors[tab.key] ?? []).length}
                </span>
              </button>
            ))}
          </div>

          {/* Investor cards */}
          <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {(investors[investorTab] ?? []).map((inv) => (
              <InvestorCard
                key={inv.id}
                investor={inv}
                onAddToBook={(i) => {
                  if (!bookInvestors.includes(i.id)) {
                    setBookInvestors([...bookInvestors, i.id]);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* ─── Center: Book Building ─── */}
        <div className="col-span-5 rounded-2xl border border-fuchsia-300/20 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
              <BookOpen size={15} className="text-fuchsia-300" /> Book Building
              <span className="font-mono text-[0.56rem] text-[#7A9A82]">— {offering.name.split(" — ")[0]}</span>
            </h2>
            {oversubscribed && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[0.52rem] font-semibold uppercase text-emerald-300">
                <TrendingUp size={10} /> Oversubscribed
              </span>
            )}
          </div>

          {/* Visual: Stacked bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono text-[0.56rem]">
              <span className="text-[#7A9A82]">Total Book</span>
              <span className="font-semibold text-white">{money(bookStats.total)} / {money(offering.totalRaise)}</span>
            </div>
            <div className="mt-1 flex h-5 w-full overflow-hidden rounded-full bg-white/5">
              {/* Firm */}
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${pct(bookStats.firmTotal, offering.totalRaise)}%` }}
                title={`Firm: ${money(bookStats.firmTotal)}`}
              />
              {/* Soft */}
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${pct(bookStats.softTotal, offering.totalRaise)}%` }}
                title={`Soft: ${money(bookStats.softTotal)}`}
              />
              {/* Indicated */}
              <div
                className="h-full bg-[#2D6B3D] transition-all"
                style={{ width: `${pct(bookStats.indicatedTotal, offering.totalRaise)}%` }}
                title={`Indicated: ${money(bookStats.indicatedTotal)}`}
              />
            </div>
            <div className="mt-1 flex gap-4 font-mono text-[0.48rem]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[#7A9A82]">Firm {money(bookStats.firmTotal)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[#7A9A82]">Soft {money(bookStats.softTotal)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#2D6B3D]" />
                <span className="text-[#7A9A82]">Indicated {money(bookStats.indicatedTotal)}</span>
              </span>
            </div>
          </div>

          {/* Breakdown by tranche */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <p className="font-mono text-[0.52rem] text-[#7A9A82]">Series A Orders</p>
              <p className="font-mono text-sm font-semibold text-[#C4A048]">{money(bookStats.trancheA)}</p>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-fuchsia-400"
                  style={{ width: `${pct(bookStats.trancheA, offering.tranches[0]?.size ?? 1)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <p className="font-mono text-[0.52rem] text-[#7A9A82]">Series B Orders</p>
              <p className="font-mono text-sm font-semibold text-[#C4A048]">{money(bookStats.trancheB)}</p>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-fuchsia-400"
                  style={{ width: `${pct(bookStats.trancheB, offering.tranches[1]?.size ?? 1)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Orders list */}
          <div className="mt-4">
            <p className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#7A9A82]">
              Individual Orders ({orders.length})
            </p>
            <div className="mt-2 max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-[Space_Grotesk] text-sm font-semibold text-white">
                        {order.investor}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 font-mono text-[0.48rem] font-semibold uppercase ${orderStatusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="rounded bg-white/5 px-1 py-0.5 font-mono text-[0.44rem] text-[#7A9A82]">
                        Ser. {order.tranche}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-[#C4A048]">
                        {money(order.amount)}
                      </span>
                      <span className="ml-2 font-mono text-[0.52rem] text-[#7A9A82]">
                        {bps(order.spreadBid)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 font-mono text-[0.5rem] italic text-[#7A9A82]">{order.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => allocateMutation.mutate({ dealId: dealId || offering.id, params: { target_raise_usd: offering.totalRaise } })}
              disabled={allocateMutation.isPending}
              className="flex-1 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-emerald-200 hover:bg-emerald-500/18"
            >
              <CheckCircle2 size={12} className="mr-1" /> Allocate
            </Button>
            <Button className="flex-1 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-amber-200 hover:bg-amber-500/18">
              <BookOpen size={12} className="mr-1" /> Close Book
            </Button>
          </div>

          {allocateMutation.data && (
            <div className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/8 p-2.5">
              <p className="font-mono text-[0.56rem] font-semibold uppercase text-emerald-200">
                Allocation complete · {(allocateMutation.data as any).coverage_pct}% coverage · {money((allocateMutation.data as any).total_allocated_usd)} allocated
              </p>
            </div>
          )}
        </div>

        {/* ─── Right: Roadshow & Outreach ─── */}
        <div className="col-span-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
            <Calendar size={15} className="text-fuchsia-300" /> Roadshow & Outreach
          </h2>

          {/* Meetings list */}
          <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {roadshow.map((mtg) => (
              <div
                key={mtg.id}
                className={`rounded-xl border p-2.5 ${meetingStatusStyle[mtg.status]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-[Space_Grotesk] text-sm font-semibold text-white">
                    {mtg.investor}
                  </span>
                  <span className="font-mono text-[0.52rem] font-semibold uppercase">
                    {mtg.status}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[0.52rem] text-[#7A9A82]">
                  {mtg.date} · {mtg.time}
                </p>
                {mtg.feedback && (
                  <div className="mt-1.5 rounded-lg bg-black/20 p-2">
                    <p className="flex items-start gap-1 font-mono text-[0.5rem] italic text-[#EDE8DC]">
                      <MessageSquare size={9} className="mt-0.5 flex-shrink-0 text-[#7A9A82]" />
                      {mtg.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex gap-2">
            <Button className="flex-1 rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/8 px-2 py-1.5 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-fuchsia-200 hover:bg-fuchsia-500/15">
              <Phone size={10} className="mr-1" /> Schedule Meeting
            </Button>
            <Button className="flex-1 rounded-lg border border-[#C4A048]/25 bg-[#C4A048]/8 px-2 py-1.5 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-[#E8C87A] hover:bg-[#C4A048]/15">
              <ClipboardList size={10} className="mr-1" /> Log Feedback
            </Button>
          </div>

          {/* Pipeline */}
          <OutreachPipeline />
        </div>
      </div>

      {/* ═══ Section 3: AI Teaser ═══ */}
      <div className="rounded-2xl border border-[#C4A048]/20 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
            <FileText size={15} className="text-[#C4A048]" /> AI Investor Teaser
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setTeaserGenerating(true);
                teaserMutation.mutate(
                  {
                    dealId: dealId || offering.id,
                    dealName: offering.name,
                    totalRaise: offering.totalRaise,
                    coupon: offering.coupon,
                    rating: offering.rating,
                  },
                  {
                    onSuccess: (data: any) => {
                      setTeaserContent(data?.content ?? "Teaser generated.");
                      setTeaserGenerating(false);
                    },
                    onError: () => {
                      setTeaserContent(
                        `CONFIDENTIAL — FOR QUALIFIED INSTITUTIONAL BUYERS ONLY\n\n` +
                        `${offering.name}\n\n` +
                        `Arden Edge Capital and Soparrow Capital are pleased to present an exclusive investment opportunity ` +
                        `in ${offering.name}, a ${money(offering.totalRaise)} structured private placement offering ` +
                        `rated ${offering.rating} with a ${offering.coupon}% coupon at ${bps(offering.spread)}.\n\n` +
                        `KEY TERMS\n` +
                        `  Total Raise:     ${money(offering.totalRaise)}\n` +
                        `  Rating:          ${offering.rating} (Shadow)\n` +
                        `  Coupon:          ${offering.coupon}%\n` +
                        `  Spread:          ${bps(offering.spread)}\n` +
                        `  Target Close:    ${offering.targetClose}\n` +
                        `  Structure:       Series A (${offering.tranches[0]?.rating}) / Series B (${offering.tranches[1]?.rating})\n\n` +
                        `INVESTMENT HIGHLIGHTS\n` +
                        `  - Senior secured position with Hylant surety wrap\n` +
                        `  - 2.5% maturity reserve escrowed from proceeds\n` +
                        `  - Par call protection through Year 3\n` +
                        `  - Florida LGFC qualified issuer designation\n` +
                        `  - Strong sponsor track record — 18yr JPMorgan pedigree\n\n` +
                        `Book is currently ${pct(offering.subscribed, offering.totalRaise)}% subscribed. ` +
                        `Allocations on a first-come, first-served basis. Contact Sterling desk for IOI submission.\n\n` +
                        `— NEST Advisors | Hawkeye Placement Desk`
                      );
                      setTeaserGenerating(false);
                    },
                  }
                );
              }}
              disabled={teaserGenerating}
              className="rounded-lg border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 py-1.5 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#EDE8DC] hover:bg-[#C4A048]/20"
            >
              {teaserGenerating ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw size={11} className="mr-1" />
              )}
              {teaserContent ? "Regenerate" : "Generate Teaser"}
            </Button>
            {teaserContent && (
              <Button className="rounded-lg border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1.5 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-fuchsia-100 hover:bg-fuchsia-400/20">
                <Mail size={11} className="mr-1" /> Send to Selected Investors
              </Button>
            )}
          </div>
        </div>

        {teaserContent ? (
          <div className="mt-4 rounded-xl border border-[#C4A048]/15 bg-black/20 p-4">
            <pre className="whitespace-pre-wrap font-mono text-[0.72rem] leading-5 text-[#EDE8DC]">
              {teaserContent}
            </pre>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-8">
            <div className="text-center">
              <FileText size={24} className="mx-auto text-[#7A9A82]" />
              <p className="mt-2 font-mono text-[0.62rem] text-[#7A9A82]">
                Click "Generate Teaser" to create an AI-powered investor teaser for {offering.name.split(" — ")[0]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
