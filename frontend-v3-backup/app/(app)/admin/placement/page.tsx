'use client'
import { useState, useMemo } from "react";
import {
  Loader2, Users, Target, FileText, BookOpen, Send, DollarSign,
  CheckCircle2, Calendar, MessageSquare, TrendingUp, Building2,
  Flame, ThermometerSun, Snowflake, Plus, Phone, ClipboardList,
  BarChart3, ArrowRight, X, RefreshCw, Mail, Eye, AlertTriangle,
} from "lucide-react";

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

/* ─── Demo Data ─── */
const DEMO_OFFERINGS = [
  {
    id: "jacaranda",
    name: "Jacaranda Trace PLOM — Series 2025",
    totalRaise: 231_000_000,
    rating: "BBB+",
    coupon: 7.0,
    spread: 85,
    subscribed: 143_220_000,
    targetClose: "2025-08-15",
    status: "marketing",
    tranches: [
      { series: "A", size: 173_250_000, subscribed: 124_740_000, rating: "A" },
      { series: "B", size: 57_750_000, subscribed: 18_480_000, rating: "BBB" },
    ],
  },
  {
    id: "harbor",
    name: "Harbor Point Industrial — Series A",
    totalRaise: 89_000_000,
    rating: "A",
    coupon: 6.5,
    spread: 72,
    subscribed: 78_320_000,
    targetClose: "2025-07-30",
    status: "closing",
    tranches: [
      { series: "A", size: 66_750_000, subscribed: 66_750_000, rating: "A" },
      { series: "B", size: 22_250_000, subscribed: 11_570_000, rating: "BBB-" },
    ],
  },
  {
    id: "oakwood",
    name: "Oakwood Multifamily — Development Bond",
    totalRaise: 67_000_000,
    rating: "BBB",
    coupon: 7.5,
    spread: 110,
    subscribed: 16_750_000,
    targetClose: "2025-09-30",
    status: "pre-marketing",
    tranches: [
      { series: "A", size: 50_250_000, subscribed: 12_060_000, rating: "BBB+" },
      { series: "B", size: 16_750_000, subscribed: 4_690_000, rating: "BB+" },
    ],
  },
];

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

const DEMO_INVESTORS: Record<string, InvestorType[]> = {
  insurance: [
    { id: "met", name: "Metropolitan Life Insurance", type: "insurance", aum: 650_000_000_000, minTicket: 10_000_000, maxTicket: 50_000_000, appetite: "hot", sectors: ["Healthcare", "Mixed Use", "Industrial"], lastDeal: "Took $25M Series A in Q1 CMBS pool", yieldFloor: 5.5 },
    { id: "pru", name: "Prudential Financial", type: "insurance", aum: 1_500_000_000_000, minTicket: 25_000_000, maxTicket: 100_000_000, appetite: "warm", sectors: ["Industrial", "Multifamily"], lastDeal: "Passed on last healthcare deal — spread too tight", yieldFloor: 5.8 },
    { id: "aig", name: "AIG Global Real Assets", type: "insurance", aum: 380_000_000_000, minTicket: 15_000_000, maxTicket: 75_000_000, appetite: "hot", sectors: ["Healthcare", "Office", "Mixed Use"], lastDeal: "Active buyer — 3 deals in last 6 months", yieldFloor: 5.2 },
  ],
  banks: [
    { id: "usb", name: "US Bancorp — Fixed Income", type: "bank", aum: 85_000_000_000, minTicket: 5_000_000, maxTicket: 25_000_000, appetite: "warm", sectors: ["Multifamily", "Industrial", "Healthcare"], lastDeal: "Regulatory capital constraints — smaller tickets only", yieldFloor: 6.0 },
    { id: "bmo", name: "BMO Capital Markets", type: "bank", aum: 120_000_000_000, minTicket: 10_000_000, maxTicket: 50_000_000, appetite: "hot", sectors: ["Healthcare", "Construction"], lastDeal: "Looking to deploy $200M in structured credit this quarter", yieldFloor: 5.5 },
    { id: "rbc", name: "RBC Global Asset Mgmt", type: "bank", aum: 420_000_000_000, minTicket: 20_000_000, maxTicket: 75_000_000, appetite: "cold", sectors: ["Office", "Retail"], lastDeal: "On hold — internal credit committee review", yieldFloor: 6.5 },
  ],
  family_offices: [
    { id: "bh", name: "Brookfield Heritage Partners", type: "family_office", aum: 2_800_000_000, minTicket: 5_000_000, maxTicket: 20_000_000, appetite: "hot", sectors: ["Healthcare", "Mixed Use", "Industrial"], lastDeal: "Co-invested in Soparrow's last deal", yieldFloor: 6.5 },
    { id: "ev", name: "Evergreen Wealth Advisors", type: "family_office", aum: 1_200_000_000, minTicket: 2_000_000, maxTicket: 10_000_000, appetite: "warm", sectors: ["Multifamily", "Healthcare"], lastDeal: "First-time buyer — needs education on structure", yieldFloor: 7.0 },
  ],
  credit_funds: [
    { id: "oa", name: "Oaktree Capital — Credit Strategies", type: "credit_fund", aum: 190_000_000_000, minTicket: 25_000_000, maxTicket: 100_000_000, appetite: "warm", sectors: ["Distressed", "Industrial", "Healthcare"], lastDeal: "Interested in B tranches and mezzanine only", yieldFloor: 8.0 },
    { id: "ag", name: "Angelo Gordon & Co", type: "credit_fund", aum: 55_000_000_000, minTicket: 10_000_000, maxTicket: 50_000_000, appetite: "hot", sectors: ["CRE", "Healthcare", "Mixed Use"], lastDeal: "Active in sub-IG — will take BB+ at right spread", yieldFloor: 9.0 },
    { id: "pg", name: "PGIM Fixed Income", type: "credit_fund", aum: 830_000_000_000, minTicket: 50_000_000, maxTicket: 200_000_000, appetite: "hot", sectors: ["Investment Grade", "CMBS"], lastDeal: "Anchor buyer — can take full A tranche", yieldFloor: 5.0 },
  ],
  pension_funds: [
    { id: "calpers", name: "CalPERS — Real Assets", type: "pension", aum: 502_000_000_000, minTicket: 50_000_000, maxTicket: 200_000_000, appetite: "hot", sectors: ["Infrastructure", "Healthcare", "Industrial", "CMBS"], lastDeal: "Increased real assets allocation by $8B — actively deploying", yieldFloor: 4.8 },
    { id: "calstrs", name: "CalSTRS — Fixed Income", type: "pension", aum: 340_000_000_000, minTicket: 25_000_000, maxTicket: 100_000_000, appetite: "warm", sectors: ["Investment Grade", "Multifamily", "Healthcare"], lastDeal: "Conservative mandate — A-rated only, long duration preferred", yieldFloor: 5.0 },
    { id: "nycers", name: "NYC Employees' Retirement System", type: "pension", aum: 85_000_000_000, minTicket: 15_000_000, maxTicket: 75_000_000, appetite: "hot", sectors: ["Healthcare", "Mixed Use", "Affordable Housing"], lastDeal: "ESG mandate — prioritizes healthcare and community impact", yieldFloor: 5.2 },
    { id: "wsib", name: "Washington State Investment Board", type: "pension", aum: 190_000_000_000, minTicket: 20_000_000, maxTicket: 100_000_000, appetite: "warm", sectors: ["Industrial", "Infrastructure", "CMBS"], lastDeal: "Took $40M in Pacific NW infrastructure bond last quarter", yieldFloor: 5.0 },
    { id: "trs", name: "Teacher Retirement System of Texas", type: "pension", aum: 210_000_000_000, minTicket: 25_000_000, maxTicket: 150_000_000, appetite: "hot", sectors: ["Healthcare", "CRE", "Mixed Use"], lastDeal: "New structured credit allocation — $2B to deploy in FY26", yieldFloor: 5.5 },
  ],
  ria_wealth: [
    { id: "lpl", name: "LPL Financial — Fixed Income Desk", type: "ria", aum: 1_100_000_000_000, minTicket: 2_000_000, maxTicket: 15_000_000, appetite: "warm", sectors: ["Healthcare", "Multifamily"], lastDeal: "Distributes to 20K+ advisor network — slower execution", yieldFloor: 6.0 },
    { id: "rj", name: "Raymond James — Structured Products", type: "ria", aum: 210_000_000_000, minTicket: 5_000_000, maxTicket: 25_000_000, appetite: "hot", sectors: ["CMBS", "Healthcare", "Industrial"], lastDeal: "Strong appetite — syndicate desk wants co-manager role", yieldFloor: 5.8 },
  ],
  strategic: [
    { id: "hyl", name: "Hylant Insurance — Surety Division", type: "strategic", aum: 4_500_000_000, minTicket: 5_000_000, maxTicket: 30_000_000, appetite: "hot", sectors: ["Healthcare", "Construction", "Municipal"], lastDeal: "Existing NEST partner — surety + direct investment", yieldFloor: 6.0 },
    { id: "sop", name: "Soparrow Capital Partners", type: "strategic", aum: 800_000_000, minTicket: 10_000_000, maxTicket: 50_000_000, appetite: "hot", sectors: ["Healthcare", "Mixed Use", "Industrial"], lastDeal: "Co-GP on Jacaranda — anchor investor commitment", yieldFloor: 5.5 },
  ],
};

const DEMO_ORDERS = [
  { id: 1, investor: "PGIM Fixed Income", amount: 50_000_000, status: "firm" as const, spreadBid: 82, tranche: "A", notes: "Firm order — compliance approved" },
  { id: 2, investor: "Metropolitan Life", amount: 25_000_000, status: "firm" as const, spreadBid: 85, tranche: "A", notes: "Standard allocation from insurance book" },
  { id: 3, investor: "AIG Global Real Assets", amount: 20_000_000, status: "soft" as const, spreadBid: 88, tranche: "A", notes: "Soft — pending IC approval Thursday" },
  { id: 4, investor: "BMO Capital Markets", amount: 15_000_000, status: "firm" as const, spreadBid: 85, tranche: "A", notes: "Will increase to $25M if spread widens to T+90" },
  { id: 5, investor: "Brookfield Heritage", amount: 10_000_000, status: "indicated" as const, spreadBid: null, tranche: "A", notes: "Verbal indication — awaiting written confirm" },
  { id: 6, investor: "Angelo Gordon", amount: 15_000_000, status: "firm" as const, spreadBid: 145, tranche: "B", notes: "B tranche only — wants 145bp minimum" },
  { id: 7, investor: "Oaktree Capital", amount: 8_250_000, status: "soft" as const, spreadBid: 155, tranche: "B", notes: "Will commit if we add cash sweep covenant" },
  { id: 8, investor: "Evergreen Wealth", amount: 5_000_000, status: "indicated" as const, spreadBid: null, tranche: "A", notes: "First-time — needs call with Bernard" },
];

const DEMO_ROADSHOW = [
  { id: 1, investor: "PGIM Fixed Income", date: "2025-06-12", time: "10:00 AM", status: "completed" as const, feedback: "Very positive — ready to anchor. Wants par call protection through Y3." },
  { id: 2, investor: "Metropolitan Life", date: "2025-06-12", time: "2:00 PM", status: "completed" as const, feedback: "Standard process. Will allocate from insurance general account." },
  { id: 3, investor: "Oaktree Capital", date: "2025-06-13", time: "9:30 AM", status: "completed" as const, feedback: "Only interested in B tranche. Wants higher spread or cash sweep." },
  { id: 4, investor: "US Bancorp", date: "2025-06-15", time: "11:00 AM", status: "scheduled" as const, feedback: null },
  { id: 5, investor: "Prudential Financial", date: "2025-06-16", time: "3:00 PM", status: "scheduled" as const, feedback: null },
  { id: 6, investor: "RBC Global Asset Mgmt", date: "2025-06-18", time: "10:00 AM", status: "cancelled" as const, feedback: "IC pushed back — revisit in 30 days" },
];

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
  indicated: "border-slate-400/30 bg-slate-400/10 text-slate-300",
};

const appetiteIcon = (appetite: string) => {
  if (appetite === "hot") return <Flame size={13} className="text-red-400" />;
  if (appetite === "warm") return <ThermometerSun size={13} className="text-amber-400" />;
  return <Snowflake size={13} className="text-blue-400" />;
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
  offering: (typeof DEMO_OFFERINGS)[0];
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
            <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.56rem] text-slate-300">
              {offering.rating}
            </span>
            <span className="font-mono text-[0.62rem] text-slate-400">
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
          <span className="text-slate-400">Subscribed</span>
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
              <div className="flex items-center justify-between font-mono text-[0.48rem] text-slate-500">
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

      <p className="mt-2 font-mono text-[0.52rem] text-slate-500">
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
          <p className="mt-1 font-mono text-[0.58rem] text-slate-400">
            AUM {money(investor.aum)} · Ticket {money(investor.minTicket)}–{money(investor.maxTicket)}
          </p>
        </div>
        <span className="font-mono text-[0.52rem] text-[#C4A048]">{investor.yieldFloor}% floor</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {investor.sectors.map((s) => (
          <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.48rem] text-slate-400">
            {s}
          </span>
        ))}
      </div>

      <p className="mt-2 font-mono text-[0.52rem] italic text-slate-500">
        {investor.lastDeal}
      </p>

      <button
        onClick={() => onAddToBook(investor)}
        className="mt-2 w-full rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/8 px-2 py-1 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-fuchsia-200 hover:bg-fuchsia-500/15"
      >
        <Plus size={10} className="mr-1 inline" /> Add to Book
      </button>
    </div>
  );
}

/* ─── Pipeline ─── */
function OutreachPipeline() {
  const stages = [
    { label: "Contacted", count: 18, color: "bg-slate-500" },
    { label: "Responded", count: 12, color: "bg-blue-500" },
    { label: "Meeting", count: 8, color: "bg-fuchsia-500" },
    { label: "Indication", count: 5, color: "bg-amber-500" },
    { label: "Allocated", count: 3, color: "bg-emerald-500" },
  ];
  return (
    <div className="mt-3 space-y-1.5">
      <p className="font-mono text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Outreach Pipeline
      </p>
      {stages.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="w-16 font-mono text-[0.52rem] text-slate-500">{s.label}</span>
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
export default function PlacementPage() {
  const [selectedOffering, setSelectedOffering] = useState(DEMO_OFFERINGS[0].id);
  const [investorTab, setInvestorTab] = useState<string>("insurance");
  const [bookInvestors, setBookInvestors] = useState<string[]>([]);
  const [teaserContent, setTeaserContent] = useState<string | null>(null);
  const [teaserGenerating, setTeaserGenerating] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState<any>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || '';

  const offering = DEMO_OFFERINGS.find((o) => o.id === selectedOffering) ?? DEMO_OFFERINGS[0];

  /* Book building stats */
  const bookStats = useMemo(() => {
    const firmTotal = DEMO_ORDERS.filter((o) => o.status === "firm").reduce((s, o) => s + o.amount, 0);
    const softTotal = DEMO_ORDERS.filter((o) => o.status === "soft").reduce((s, o) => s + o.amount, 0);
    const indicatedTotal = DEMO_ORDERS.filter((o) => o.status === "indicated").reduce((s, o) => s + o.amount, 0);
    const total = firmTotal + softTotal + indicatedTotal;
    const trancheA = DEMO_ORDERS.filter((o) => o.tranche === "A").reduce((s, o) => s + o.amount, 0);
    const trancheB = DEMO_ORDERS.filter((o) => o.tranche === "B").reduce((s, o) => s + o.amount, 0);
    return { firmTotal, softTotal, indicatedTotal, total, trancheA, trancheB };
  }, []);

  const oversubscribed = bookStats.total > offering.totalRaise;

  async function handleAllocate() {
    setAllocating(true);
    try {
      const res = await fetch(`${API}/api/hawkeye/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: offering.id, params: { target_raise_usd: offering.totalRaise } }),
      });
      const data = await res.json();
      if (data.success) setAllocationResult(data.data);
    } catch {
      // silent
    } finally {
      setAllocating(false);
    }
  }

  async function handleGenerateTeaser() {
    setTeaserGenerating(true);
    try {
      const res = await fetch(`${API}/api/hawkeye/teaser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: offering.id,
          dealName: offering.name,
          totalRaise: offering.totalRaise,
          coupon: offering.coupon,
          rating: offering.rating,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.content) {
        setTeaserContent(data.data.content);
      } else {
        throw new Error('fallback');
      }
    } catch {
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
    } finally {
      setTeaserGenerating(false);
    }
  }

  /* ─── Full Dashboard ─── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fuchsia-200">
            <Target size={17} /> Hawkeye — Institutional Placement Engine
          </div>
          <p className="mt-1 font-[Space_Grotesk] text-sm text-slate-400">
            Book building, investor matching, roadshow management, and AI teasers.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.56rem] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live
          </span>
          <span>|</span>
          <span>{DEMO_OFFERINGS.length} offerings</span>
          <span>|</span>
          <span>{DEMO_ORDERS.length} orders</span>
        </div>
      </div>

      {/* Section 1: Active Offerings */}
      <div>
        <h2 className="mb-3 font-[Cormorant_Garamond] text-lg font-semibold text-white">
          Active Offerings
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {DEMO_OFFERINGS.map((o) => (
            <OfferingCard
              key={o.id}
              offering={o}
              selected={o.id === selectedOffering}
              onSelect={() => setSelectedOffering(o.id)}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Three-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Investor Universe */}
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
                    : "border border-transparent bg-white/5 text-slate-400 hover:bg-white/8 hover:text-slate-300"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[0.44rem] text-slate-500">
                  {(DEMO_INVESTORS[tab.key] ?? []).length}
                </span>
              </button>
            ))}
          </div>

          {/* Investor cards */}
          <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {(DEMO_INVESTORS[investorTab] ?? []).map((inv) => (
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

        {/* Center: Book Building */}
        <div className="col-span-5 rounded-2xl border border-fuchsia-300/20 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
              <BookOpen size={15} className="text-fuchsia-300" /> Book Building
              <span className="font-mono text-[0.56rem] text-slate-400">— {offering.name.split(" — ")[0]}</span>
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
              <span className="text-slate-400">Total Book</span>
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
                className="h-full bg-slate-500 transition-all"
                style={{ width: `${pct(bookStats.indicatedTotal, offering.totalRaise)}%` }}
                title={`Indicated: ${money(bookStats.indicatedTotal)}`}
              />
            </div>
            <div className="mt-1 flex gap-4 font-mono text-[0.48rem]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Firm {money(bookStats.firmTotal)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-400">Soft {money(bookStats.softTotal)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">Indicated {money(bookStats.indicatedTotal)}</span>
              </span>
            </div>
          </div>

          {/* Breakdown by tranche */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <p className="font-mono text-[0.52rem] text-slate-500">Series A Orders</p>
              <p className="font-mono text-sm font-semibold text-[#C4A048]">{money(bookStats.trancheA)}</p>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-fuchsia-400"
                  style={{ width: `${pct(bookStats.trancheA, offering.tranches[0]?.size ?? 1)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
              <p className="font-mono text-[0.52rem] text-slate-500">Series B Orders</p>
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
            <p className="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Individual Orders ({DEMO_ORDERS.length})
            </p>
            <div className="mt-2 max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
              {DEMO_ORDERS.map((order) => (
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
                      <span className="rounded bg-white/5 px-1 py-0.5 font-mono text-[0.44rem] text-slate-500">
                        Ser. {order.tranche}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-[#C4A048]">
                        {money(order.amount)}
                      </span>
                      <span className="ml-2 font-mono text-[0.52rem] text-slate-400">
                        {bps(order.spreadBid)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 font-mono text-[0.5rem] italic text-slate-500">{order.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAllocate}
              disabled={allocating}
              className="flex flex-1 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-emerald-200 hover:bg-emerald-500/18 disabled:opacity-50"
            >
              <CheckCircle2 size={12} className="mr-1" /> Allocate
            </button>
            <button className="flex flex-1 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-amber-200 hover:bg-amber-500/18">
              <BookOpen size={12} className="mr-1" /> Close Book
            </button>
          </div>

          {allocationResult && (
            <div className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/8 p-2.5">
              <p className="font-mono text-[0.56rem] font-semibold uppercase text-emerald-200">
                Allocation complete · {allocationResult.coverage_pct}% coverage · {money(allocationResult.total_allocated_usd)} allocated
              </p>
            </div>
          )}
        </div>

        {/* Right: Roadshow & Outreach */}
        <div className="col-span-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
            <Calendar size={15} className="text-fuchsia-300" /> Roadshow & Outreach
          </h2>

          {/* Meetings list */}
          <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {DEMO_ROADSHOW.map((mtg) => (
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
                <p className="mt-0.5 font-mono text-[0.52rem] text-slate-400">
                  {mtg.date} · {mtg.time}
                </p>
                {mtg.feedback && (
                  <div className="mt-1.5 rounded-lg bg-black/20 p-2">
                    <p className="flex items-start gap-1 font-mono text-[0.5rem] italic text-slate-300">
                      <MessageSquare size={9} className="mt-0.5 flex-shrink-0 text-slate-500" />
                      {mtg.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/8 px-2 py-1.5 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-fuchsia-200 hover:bg-fuchsia-500/15">
              <Phone size={10} className="mr-1" /> Schedule Meeting
            </button>
            <button className="flex flex-1 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-500/8 px-2 py-1.5 font-mono text-[0.52rem] font-semibold uppercase tracking-[0.1em] text-cyan-200 hover:bg-cyan-500/15">
              <ClipboardList size={10} className="mr-1" /> Log Feedback
            </button>
          </div>

          {/* Pipeline */}
          <OutreachPipeline />
        </div>
      </div>

      {/* Section 3: AI Teaser */}
      <div className="rounded-2xl border border-cyan-300/20 bg-black/30 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[Cormorant_Garamond] text-base font-semibold text-white">
            <FileText size={15} className="text-cyan-300" /> AI Investor Teaser
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateTeaser}
              disabled={teaserGenerating}
              className="flex items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
            >
              {teaserGenerating ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw size={11} className="mr-1" />
              )}
              {teaserContent ? "Regenerate" : "Generate Teaser"}
            </button>
            {teaserContent && (
              <button className="flex items-center rounded-lg border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1.5 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-fuchsia-100 hover:bg-fuchsia-400/20">
                <Mail size={11} className="mr-1" /> Send to Selected Investors
              </button>
            )}
          </div>
        </div>

        {teaserContent ? (
          <div className="mt-4 rounded-xl border border-cyan-300/15 bg-black/20 p-4">
            <pre className="whitespace-pre-wrap font-mono text-[0.72rem] leading-5 text-slate-300">
              {teaserContent}
            </pre>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-8">
            <div className="text-center">
              <FileText size={24} className="mx-auto text-slate-600" />
              <p className="mt-2 font-mono text-[0.62rem] text-slate-500">
                Click "Generate Teaser" to create an AI-powered investor teaser for {offering.name.split(" — ")[0]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
