/**
 * EagleEye Demo Data — comprehensive pre-loaded signals for investor demo.
 * Types here are the contract for frontend ↔ backend API shape.
 */

// ── Types ────────────────────────────────────────────────────────

export type SignalCategory = "ma" | "cre";
export type SignalStatus = "hot" | "warm" | "review" | "passed" | "converted";

export type MASubtype =
  | "edgar_8k"
  | "edgar_sc13d"
  | "edgar_formd"
  | "press_release"
  | "distress_signal"
  | "succession"
  | "pe_rollup"
  | "ucc_distress";

export type CRESubtype =
  | "dark_zone"
  | "maturing_loan"
  | "permit"
  | "rezoning"
  | "ucc_filing"
  | "title_transfer"
  | "superfund"
  | "foreclosure"
  | "mep_change_order"
  | "underperforming_lease";

export interface PEFirm {
  name: string;
  fundSize: string;
  mandate: string;
  recentAcquisitions: number;
  deploymentPct: number;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
}

export interface PortcoSignal {
  name: string;
  sponsor: string;
  revenue: string;
  relevance: string;
}

export interface UCCFiling {
  filingType: string;
  lender: string;
  amount: number;
  date: string;
  detail: string;
}

export interface OwnershipIntel {
  founderName: string;
  founderAge: number;
  generation: number;
  successionPlan: boolean;
  peSponsor: string | null;
  boardAdvisors: string[];
  bankerEngaged: boolean;
}

export interface MASignal {
  id: string;
  category: "ma";
  subtype: MASubtype;
  entity: string;
  description: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  naics: string;
  naicsDesc: string;
  revenueUsd: number;
  ebitdaUsd: number;
  evMultiple: string;
  score: number;
  status: SignalStatus;
  ownership: OwnershipIntel;
  peLandscape: PEFirm[];
  portcoSignals: PortcoSignal[];
  capitalFormation: string[];
  uccFilings: UCCFiling[];
  dealThesis: string;
  source: string;
  discoveredAt: string;
  // New M&A dimensions
  marketGrowthPct?: number;           // sector CAGR
  regionalGrowthFactor?: number;      // 1.0 = neutral, >1.0 = hot region
  revenueStreams?: number;            // count of distinct product/service lines
  geographicMarkets?: number;        // count of states/regions served
  techEnabled?: boolean;
  repeatableProcess?: boolean;
  capacityUtilizationPct?: number;
  hasSyndicatedDebt?: boolean;
  recentRefinancing?: boolean;
  announcedEquityRaise?: boolean;
  scalabilityScore?: number;          // 0-100 computed
  diversificationScore?: number;      // 0-100 computed
  syndicatedLoanSignal?: "hot" | "warm" | "none";
}

export interface DarkZoneAnalysis {
  currentCapRate: number;
  marketCapRate: number;
  currentNOI: number;
  debtService: number;
  dscr: number;
  whyEquityFails: string;
  bondCouponViable: string;
  bondStructureSummary: string;
}

export interface MaturingLoan {
  lender: string;
  originalAmount: number;
  currentBalance: number;
  maturityDate: string;
  currentRate: string;
  loanType: string;
}

export interface CRESignal {
  id: string;
  category: "cre";
  subtype: CRESubtype;
  entity: string;
  description: string;
  propertyType: string;
  address: string;
  state: string;
  county: string;
  city: string;
  lat: number;
  lng: number;
  naics: string;
  amountUsd: number;
  acreage?: number;
  units?: number;
  sqft?: number;
  score: number;
  status: SignalStatus;
  darkZone?: DarkZoneAnalysis;
  maturingLoan?: MaturingLoan;
  environmentalStatus?: string;
  permitDetails?: string;
  rezoningStatus?: string;
  mepChanges?: string;
  ownerIntel: string;
  dealThesis: string;
  source: string;
  discoveredAt: string;
}

export type EagleEyeSignal = MASignal | CRESignal;

export interface BullseyePitch {
  id: string;
  signalId: string;
  signalEntity: string;
  targetFirm: string;
  targetContact: string;
  targetTitle: string;
  targetEmail: string;
  whyThem: string[];
  whyThisDeal: string[];
  whyNow: string[];
  nestRole: string[];
  approachStrategy: string;
  warmIntroPath: string | null;
  emailTemplate: string;
  callScript: string;
  status: "draft" | "approved" | "deployed" | "converted";
  createdAt: string;
}

export type TouchType =
  | "email_welcome"
  | "email_intel"
  | "call"
  | "content_drip"
  | "case_study"
  | "targeted_intel"
  | "direct_ask"
  | "close";

export type TouchOutcome =
  | "sent"
  | "opened"
  | "clicked"
  | "replied"
  | "voicemail"
  | "connected"
  | "meeting_booked"
  | "no_answer"
  | "pending";

export interface Touch {
  touchNumber: number;
  type: TouchType;
  label: string;
  content: string;
  outcome: TouchOutcome;
  date: string | null;
  notes: string;
}

export interface BoxingOutProspect {
  id: string;
  signalId: string;
  pitchId: string | null;
  firmName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  source: string;
  currentTouch: number;
  status: "cold" | "warm" | "hot" | "meeting_booked" | "converted" | "recycled";
  touches: Touch[];
  emailOpens: number;
  emailClicks: number;
  nextTouchDate: string;
  nextTouchType: TouchType;
  notes: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  prospectId: string;
  type: "market_intel" | "case_study" | "trend_report" | "targeted_intel";
  title: string;
  body: string;
  status: "draft" | "approved" | "sent";
  scheduledFor: string;
}

// ── Status color map ─────────────────────────────────────────────

export const STATUS_COLORS: Record<SignalStatus, string> = {
  hot: "border-red-400/40 bg-red-500/15 text-red-200",
  warm: "border-amber-300/40 bg-amber-300/15 text-amber-200",
  review: "border-cyan-300/40 bg-cyan-400/15 text-cyan-200",
  passed: "border-slate-400/40 bg-slate-500/15 text-slate-300",
  converted: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
};

export const PROSPECT_STATUS_COLORS: Record<string, string> = {
  cold: "border-slate-400/40 bg-slate-500/15 text-slate-300",
  warm: "border-amber-300/40 bg-amber-300/15 text-amber-200",
  hot: "border-red-400/40 bg-red-500/15 text-red-200",
  meeting_booked: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
  converted: "border-green-300/40 bg-green-400/15 text-green-200",
  recycled: "border-slate-400/40 bg-slate-500/15 text-slate-300",
};

// ── Helpers ──────────────────────────────────────────────────────

export function formatMoney(val: number): string {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── M&A Demo Signals ─────────────────────────────────────────────

export const DEMO_MA_SIGNALS: MASignal[] = [
  {
    id: "ma_001",
    category: "ma",
    subtype: "succession",
    entity: "NexGen HVAC Holdings",
    description: "3rd generation family HVAC platform, Bay Area. Founder 71, no succession plan. PE consolidation active in sector. No banker engaged.",
    state: "CA",
    city: "Walnut Creek",
    lat: 37.9024,
    lng: -122.0616,
    naics: "238220",
    naicsDesc: "Plumbing, Heating & AC Contractors",
    revenueUsd: 62_000_000,
    ebitdaUsd: 8_200_000,
    evMultiple: "8.5x",
    score: 87,
    status: "hot",
    ownership: {
      founderName: "Robert Ramirez",
      founderAge: 71,
      generation: 3,
      successionPlan: false,
      peSponsor: null,
      boardAdvisors: [],
      bankerEngaged: false,
    },
    peLandscape: [
      { name: "Summit Growth Partners", fundSize: "$400M Fund III", mandate: "Essential services, platform builds", recentAcquisitions: 3, deploymentPct: 40, contactName: "Mike Chen", contactTitle: "Managing Partner", contactEmail: "mchen@summitgrowth.com" },
      { name: "Apex Service Capital", fundSize: "$275M Fund II", mandate: "Home services consolidation", recentAcquisitions: 5, deploymentPct: 55, contactName: "Sarah Kim", contactTitle: "Principal", contactEmail: "skim@apexservice.com" },
    ],
    portcoSignals: [
      { name: "ComfortFlow Mechanical", sponsor: "Summit Growth Partners", revenue: "$45M", relevance: "Bolt-on candidate — adjacent geography, same NAICS" },
      { name: "AllSeason Air", sponsor: "Apex Service Capital", revenue: "$28M", relevance: "Competitor portco — expanding into commercial HVAC" },
    ],
    capitalFormation: [
      "Summit Growth closed $400M Fund III (Jan 2026) — 60% dry powder",
      "Apex Service Capital deploying Fund II actively — 5 deals in 12mo",
      "Heritage Family Office committed $15M to essential services LP (Form D, Mar 2026)",
    ],
    uccFilings: [
      { filingType: "UCC-1", lender: "Pacific Western Bank", amount: 4_500_000, date: "2023-08-15", detail: "Equipment lien — HVAC inventory and fleet" },
    ],
    dealThesis: "Platform play: Acquire NexGen as anchor ($62M rev), bolt-on ComfortFlow ($45M) within 12 months. Combined platform $107M revenue, 15% EBITDA margin achievable post-synergies. Exit at $200M+ to strategic buyer or sponsor-to-sponsor in 4-5 years. NEST structures $35M Series A bond for acquisition financing, 45-day close. Founder retirement funded through earnout + equity rollover.",
    source: "EDGAR + OpenCorporates + OSINT",
    discoveredAt: "2026-05-18T09:30:00Z",
    marketGrowthPct: 7.2,
    regionalGrowthFactor: 1.3,
    revenueStreams: 3,
    geographicMarkets: 2,
    techEnabled: true,
    repeatableProcess: true,
    capacityUtilizationPct: 78,
    hasSyndicatedDebt: false,
    recentRefinancing: false,
    announcedEquityRaise: false,
    scalabilityScore: 72,
    diversificationScore: 58,
    syndicatedLoanSignal: "none",
  },
  {
    id: "ma_002",
    category: "ma",
    subtype: "succession",
    entity: "Cascadia Senior Services",
    description: "Regional home health + hospice platform. Founder 67, exploring options. $45M revenue, margins compressing. No PE engagement.",
    state: "OR",
    city: "Portland",
    lat: 45.5152,
    lng: -122.6784,
    naics: "621610",
    naicsDesc: "Home Health Care Services",
    revenueUsd: 45_000_000,
    ebitdaUsd: 5_100_000,
    evMultiple: "9.2x",
    score: 78,
    status: "hot",
    ownership: {
      founderName: "Patricia Nguyen",
      founderAge: 67,
      generation: 1,
      successionPlan: false,
      peSponsor: null,
      boardAdvisors: ["Local CPA — Morrison & Associates"],
      bankerEngaged: false,
    },
    peLandscape: [
      { name: "Valor Healthcare Partners", fundSize: "$600M Fund IV", mandate: "Healthcare services rollup", recentAcquisitions: 7, deploymentPct: 35, contactName: "James Wright", contactTitle: "Partner", contactEmail: "jwright@valorhcp.com" },
      { name: "Cascade Equity", fundSize: "$180M Fund I", mandate: "Pacific NW services", recentAcquisitions: 2, deploymentPct: 25, contactName: "Amy Torres", contactTitle: "Managing Director", contactEmail: "atorres@cascadeequity.com" },
    ],
    portcoSignals: [
      { name: "Pacific Home Health", sponsor: "Valor Healthcare Partners", revenue: "$72M", relevance: "Direct competitor — Valor could acquire Cascadia as tuck-in" },
    ],
    capitalFormation: [
      "Valor HCP closed Fund IV at $600M (Feb 2026) — largest fund yet, healthcare focus",
      "2 family offices in PNW committed to healthcare LP vehicles in Q1 2026",
    ],
    uccFilings: [],
    dealThesis: "Tuck-in acquisition for Valor HCP or standalone platform build with Cascade Equity. Cascadia's Medicare/Medicaid reimbursement base is stable, margins improvable with scale. NEST structures $25M bond for acquisition + working capital. CPA relationship (Morrison & Associates) is warm intro path.",
    source: "Secretary of State + CPA network",
    discoveredAt: "2026-05-15T14:20:00Z",
    marketGrowthPct: 12.4,
    regionalGrowthFactor: 1.2,
    revenueStreams: 4,
    geographicMarkets: 3,
    techEnabled: true,
    repeatableProcess: true,
    capacityUtilizationPct: 91,
    hasSyndicatedDebt: false,
    recentRefinancing: false,
    announcedEquityRaise: false,
    scalabilityScore: 81,
    diversificationScore: 74,
    syndicatedLoanSignal: "none",
  },
  {
    id: "ma_003",
    category: "ma",
    subtype: "pe_rollup",
    entity: "Lone Star Waste Services",
    description: "Commercial waste hauling platform, DFW metro. PE-backed competitor rolling up sector. Revenue $98M but EBITDA only $14M — banks won't engage.",
    state: "TX",
    city: "Fort Worth",
    lat: 32.7555,
    lng: -97.3308,
    naics: "562111",
    naicsDesc: "Solid Waste Collection",
    revenueUsd: 98_000_000,
    ebitdaUsd: 14_000_000,
    evMultiple: "7.8x",
    score: 72,
    status: "warm",
    ownership: {
      founderName: 'William "Buck" Henderson',
      founderAge: 63,
      generation: 2,
      successionPlan: false,
      peSponsor: null,
      boardAdvisors: [],
      bankerEngaged: false,
    },
    peLandscape: [
      { name: "Greenfield Industrial Partners", fundSize: "$850M Fund III", mandate: "Environmental services, waste mgmt", recentAcquisitions: 4, deploymentPct: 50, contactName: "David Park", contactTitle: "Senior Partner", contactEmail: "dpark@greenfieldip.com" },
    ],
    portcoSignals: [
      { name: "EcoHaul Texas", sponsor: "Greenfield Industrial", revenue: "$65M", relevance: "Direct competitor — 4 acquisitions in TX waste last 18mo, NexGen HVAC of waste" },
      { name: "Metro Disposal Group", sponsor: "Greenfield Industrial", revenue: "$42M", relevance: "Adjacent market — Greenfield building DFW waste platform" },
    ],
    capitalFormation: [
      "Greenfield Industrial Fund III ($850M) actively deploying in TX waste sector",
      "3 Form D filings for waste/environmental funds in TX in last 6 months",
    ],
    uccFilings: [
      { filingType: "UCC-1", lender: "Frost Bank", amount: 8_200_000, date: "2024-01-20", detail: "Fleet lien — 47 trucks + heavy equipment" },
      { filingType: "UCC-1", lender: "CAT Financial", amount: 3_100_000, date: "2024-06-10", detail: "Equipment lien — compactors and containers" },
    ],
    dealThesis: "Competitive dynamics play: Greenfield is building a TX waste platform and will need Lone Star's routes + contracts to dominate DFW. Buck Henderson has no succession plan and $11.3M in equipment debt. Approach Greenfield with Lone Star as bolt-on to EcoHaul platform. NEST structures $45M bond for acquisition. Alternatively, approach Buck directly — NEST helps him sell to the highest bidder with a structured debt vehicle that maximizes his take.",
    source: "EDGAR Form D + UCC filings + Press",
    discoveredAt: "2026-05-12T11:45:00Z",
    marketGrowthPct: 5.8,
    regionalGrowthFactor: 1.4,
    revenueStreams: 2,
    geographicMarkets: 2,
    techEnabled: false,
    repeatableProcess: true,
    capacityUtilizationPct: 85,
    hasSyndicatedDebt: true,
    recentRefinancing: true,
    announcedEquityRaise: false,
    scalabilityScore: 55,
    diversificationScore: 32,
    syndicatedLoanSignal: "warm",
  },
  {
    id: "ma_004",
    category: "ma",
    subtype: "ucc_distress",
    entity: "Heritage Precision Manufacturing",
    description: "CNC machining + aerospace parts. 3rd gen family, multiple UCC filings signal debt stacking. Revenue declining. Classic distressed middle market.",
    state: "IL",
    city: "Rockford",
    lat: 42.2711,
    lng: -89.0940,
    naics: "332710",
    naicsDesc: "Machine Shops",
    revenueUsd: 38_000_000,
    ebitdaUsd: 4_800_000,
    evMultiple: "6.5x",
    score: 65,
    status: "warm",
    ownership: {
      founderName: "Thomas Kowalski III",
      founderAge: 52,
      generation: 3,
      successionPlan: false,
      peSponsor: null,
      boardAdvisors: [],
      bankerEngaged: false,
    },
    peLandscape: [
      { name: "Midwest Industrial Holdings", fundSize: "$320M Fund II", mandate: "Industrial manufacturing, defense supply chain", recentAcquisitions: 3, deploymentPct: 45, contactName: "Robert Janssen", contactTitle: "Partner", contactEmail: "rjanssen@midwestih.com" },
    ],
    portcoSignals: [
      { name: "Precision Aero Components", sponsor: "Midwest Industrial", revenue: "$55M", relevance: "Same NAICS — potential synergy or competitive acquisition" },
    ],
    capitalFormation: [
      "Defense supply chain reshoring driving PE appetite for US machining capacity",
      "2 SBIC funds targeting manufacturing in Midwest (Form D, Q1 2026)",
    ],
    uccFilings: [
      { filingType: "UCC-1", lender: "BMO Harris", amount: 6_500_000, date: "2023-03-15", detail: "Blanket lien — all business assets" },
      { filingType: "UCC-1", lender: "Byline Bank", amount: 2_800_000, date: "2024-09-20", detail: "Equipment lien — 3 new CNC machines" },
      { filingType: "UCC-1", lender: "SBA 504", amount: 1_900_000, date: "2025-01-10", detail: "Real estate — manufacturing facility" },
    ],
    dealThesis: "Distressed play with upside. Heritage has $11.2M in stacked UCC debt, declining revenue, and a 3rd gen owner (70%+ failure rate). But the underlying business has aerospace certifications (AS9100) that are worth gold in the reshoring environment. Midwest Industrial would pay a premium for the certifications alone. NEST structures a bridge bond to clean up the debt stack, positions Heritage for sale at a clean basis. Or: approach Thomas directly with a debt restructuring that gives him runway to stabilize, then sell from a position of strength.",
    source: "UCC filings (IL SOS) + NAICS analysis",
    discoveredAt: "2026-05-10T08:15:00Z",
    marketGrowthPct: 8.1,
    regionalGrowthFactor: 0.9,
    revenueStreams: 2,
    geographicMarkets: 4,
    techEnabled: false,
    repeatableProcess: true,
    capacityUtilizationPct: 62,
    hasSyndicatedDebt: true,
    recentRefinancing: false,
    announcedEquityRaise: true,
    scalabilityScore: 44,
    diversificationScore: 38,
    syndicatedLoanSignal: "hot",
  },
  {
    id: "ma_005",
    category: "ma",
    subtype: "edgar_formd",
    entity: "Pacific Marine Services",
    description: "Marine vessel maintenance + repair, Puget Sound. Key employee departures, founder health event (public). Revenue $55M. PNW maritime services consolidation underway.",
    state: "WA",
    city: "Seattle",
    lat: 47.6062,
    lng: -122.3321,
    naics: "336611",
    naicsDesc: "Ship Building & Repairing",
    revenueUsd: 55_000_000,
    ebitdaUsd: 6_200_000,
    evMultiple: "7.5x",
    score: 61,
    status: "warm",
    ownership: {
      founderName: 'Gerald "Gerry" Olsen',
      founderAge: 69,
      generation: 1,
      successionPlan: false,
      peSponsor: null,
      boardAdvisors: [],
      bankerEngaged: false,
    },
    peLandscape: [
      { name: "Maritime Capital Group", fundSize: "$220M Fund I", mandate: "Maritime services + infrastructure", recentAcquisitions: 2, deploymentPct: 30, contactName: "Karen Liu", contactTitle: "Founder & Managing Partner", contactEmail: "kliu@maritimecap.com" },
    ],
    portcoSignals: [
      { name: "Sound Marine Works", sponsor: "Maritime Capital Group", revenue: "$32M", relevance: "Same port, complementary services — clear bolt-on logic" },
    ],
    capitalFormation: [
      "Maritime Capital Group raised first fund ($220M) specifically for PNW maritime services",
      "Navy/Coast Guard maintenance contracts expanding — tailwind for sector",
    ],
    uccFilings: [
      { filingType: "UCC-1", lender: "Columbia Bank", amount: 7_800_000, date: "2022-11-01", detail: "Drydock equipment + real estate" },
    ],
    dealThesis: "Founder health event + key employee departures signal urgency. Maritime Capital Group is building a PNW platform and needs Pacific Marine's Puget Sound drydock facilities + Navy maintenance contracts. Gerry has no heirs in the business. NEST structures $30M bond for acquisition financing. Time-sensitive — if Gerry exits involuntarily, the business deteriorates fast. Maritime Capital gets a call this week.",
    source: "Press + WA SOS + Key employee LinkedIn activity",
    discoveredAt: "2026-05-16T16:00:00Z",
    marketGrowthPct: 6.3,
    regionalGrowthFactor: 1.1,
    revenueStreams: 3,
    geographicMarkets: 2,
    techEnabled: false,
    repeatableProcess: false,
    capacityUtilizationPct: 70,
    hasSyndicatedDebt: true,
    recentRefinancing: false,
    announcedEquityRaise: false,
    scalabilityScore: 49,
    diversificationScore: 51,
    syndicatedLoanSignal: "warm",
  },
];

// ── CRE Demo Signals ─────────────────────────────────────────────

export const DEMO_CRE_SIGNALS: CRESignal[] = [
  {
    id: "cre_001",
    category: "cre",
    subtype: "dark_zone",
    entity: "Former Kmart / Sears Anchor — Fiesta Mall",
    description: "230,000 sqft vacant anchor, rezoning approved for mixed-use. Cap rate and NOI don't pencil for equity investors — classic dark zone. Bond structure makes this viable.",
    propertyType: "Retail → Mixed-Use Conversion",
    address: "1445 W Southern Ave",
    state: "AZ",
    county: "Maricopa",
    city: "Mesa",
    lat: 33.3928,
    lng: -111.8651,
    naics: "5311",
    amountUsd: 14_200_000,
    sqft: 230_000,
    acreage: 12.5,
    score: 92,
    status: "hot",
    darkZone: {
      currentCapRate: 3.2,
      marketCapRate: 6.5,
      currentNOI: 454_000,
      debtService: 890_000,
      dscr: 0.51,
      whyEquityFails: "Current NOI of $454K on a $14.2M basis = 3.2% cap rate. No equity investor touches this. DSCR 0.51x — deeply negative leverage.",
      bondCouponViable: "At 5.75% coupon with 10yr amortization, repositioned NOI of $1.8M (mixed-use) produces 1.45x DSCR. Bond math works where equity math doesn't.",
      bondStructureSummary: "Series A: $14.2M, 5.75%, 10yr. Construction holdback 30%. Lease-up reserve 12mo. Tax increment financing available (Mesa TIF district).",
    },
    maturingLoan: {
      lender: "Arizona Federal Credit Union",
      originalAmount: 16_500_000,
      currentBalance: 14_200_000,
      maturityDate: "2026-11-15",
      currentRate: "4.25%",
      loanType: "CMBS",
    },
    rezoningStatus: "Approved — PUD overlay for mixed-use (retail/residential/office). Mesa City Council, Feb 2026.",
    ownerIntel: "Brookfield Asset Management subsidiary. Portfolio pruning — non-core assets in secondary markets being shed.",
    dealThesis: "Textbook dark zone play. Brookfield shedding non-core assets at distressed pricing. $14.2M CMBS loan matures Nov 2026 — forced disposition. Rezoning already approved for mixed-use. Current retail NOI is negative, but repositioned NOI at $1.8M+ supports bond financing. NEST structures the bond, developer partner executes the conversion. Mesa TIF district provides tax increment subsidy. Nobody else can touch this because the equity math doesn't work — bonds are the only path.",
    source: "ATTOM + Maricopa County Recorder + Mesa City Council Minutes",
    discoveredAt: "2026-05-17T10:00:00Z",
  },
  {
    id: "cre_002",
    category: "cre",
    subtype: "permit",
    entity: "Puyallup Industrial Corridor — Logistics Hub",
    description: "3 building permits filed in 90 days. 420,000 sqft combined warehouse/logistics. Port of Tacoma 8mi, BNSF rail spur adjacent. Data center substation 2.3mi.",
    propertyType: "Industrial / Logistics",
    address: "River Road Industrial Park",
    state: "WA",
    county: "Pierce",
    city: "Puyallup",
    lat: 47.1854,
    lng: -122.2929,
    naics: "4931",
    amountUsd: 67_000_000,
    sqft: 420_000,
    acreage: 28,
    score: 78,
    status: "hot",
    permitDetails: "3 permits: (1) 180K sqft cross-dock warehouse, (2) 140K sqft cold storage, (3) 100K sqft flex industrial. All filed by same LLC — Cascade Logistics Development LLC.",
    ownerIntel: "Cascade Logistics Development LLC — new entity, filed WA SOS Mar 2026. Registered agent: Perkins Coie. Common ownership with Trident Real Estate (known PNW developer, $2B portfolio).",
    dealThesis: "Trident Real Estate spinning up a logistics campus near Port of Tacoma. 3 permits in 90 days = serious intent. Combined $67M development needs construction financing. NEST structures $67M Series A bond (75% LTC), construction draws over 18 months. Cold storage component has pre-lease interest from Amazon Fresh. Data center power proximity adds optionality. Approach Trident directly — they need the debt and NEST can close in 45 days.",
    source: "Pierce County Permits + WA SOS + Port of Tacoma data",
    discoveredAt: "2026-05-14T08:30:00Z",
  },
  {
    id: "cre_003",
    category: "cre",
    subtype: "superfund",
    entity: "Former Chevron Terminal — Oakland Inner Harbor",
    description: "8.5 acres, EPA brownfield (not Superfund — lesser designation). Phase II complete, remediation estimate $2.1M. Land valued 40% below comparable clean parcels. Transit-oriented.",
    propertyType: "Brownfield → Transit-Oriented Development",
    address: "1200 Embarcadero",
    state: "CA",
    county: "Alameda",
    city: "Oakland",
    lat: 37.7952,
    lng: -122.2726,
    naics: "5311",
    amountUsd: 22_000_000,
    acreage: 8.5,
    score: 71,
    status: "warm",
    environmentalStatus: "EPA Brownfield — Phase II ESA complete (Nov 2025). Remediation Action Plan approved. Estimated cleanup: $2.1M (petroleum hydrocarbons, lead). NOT a Superfund/CERCLIS site. No ongoing EPA enforcement. Cleanup qualifies for CA Voluntary Cleanup Program + EPA Brownfield revolving loan fund.",
    ownerIntel: "Chevron USA divesting non-operational real estate. Motivated seller — environmental liability cap negotiable. Currently paying $180K/yr in monitoring costs.",
    dealThesis: "Classic stigma discount. 8.5 acres of Oakland waterfront at 40% below market because of brownfield designation. Remediation is $2.1M — manageable. Post-cleanup, this is a $55M+ transit-oriented development site (BART Lake Merritt 0.5mi). NEST structures a two-phase bond: Phase 1 ($8M) for acquisition + remediation, Phase 2 ($35M) for vertical development. The spread between acquisition at environmental discount and post-cleanup value is massive. EPA Brownfield RLF provides below-market cleanup financing.",
    source: "EPA Envirofacts + Alameda County Recorder + Phase II ESA (uploaded)",
    discoveredAt: "2026-05-11T13:45:00Z",
  },
  {
    id: "cre_004",
    category: "cre",
    subtype: "mep_change_order",
    entity: "Lone Star Senior Living — The Preserve at Brushy Creek",
    description: "180-unit senior living campus. MEP change orders total $4.8M over original GMP. Developer distress signal — construction loan covenant breach likely.",
    propertyType: "Senior Living / Assisted Living",
    address: "2800 Brushy Creek Rd",
    state: "TX",
    county: "Travis",
    city: "Round Rock",
    lat: 30.5083,
    lng: -97.6789,
    naics: "6232",
    amountUsd: 112_000_000,
    units: 180,
    sqft: 195_000,
    score: 68,
    status: "warm",
    mepChanges: "3 MEP change orders filed with Travis County: (1) HVAC redesign +$1.9M (code compliance), (2) Electrical panel upgrade +$1.4M (generator capacity), (3) Plumbing reroute +$1.5M (soil conditions). Total: $4.8M over GMP contract ($78M original). Developer's construction lender (Comerica) likely to call covenant.",
    maturingLoan: {
      lender: "Comerica Bank",
      originalAmount: 78_000_000,
      currentBalance: 71_000_000,
      maturityDate: "2027-03-01",
      currentRate: "SOFR + 325bps",
      loanType: "Construction",
    },
    ownerIntel: "Lone Star Senior Communities LLC — regional developer, 4 projects. This is their largest. $4.8M cost overrun on a $78M GMP strains their balance sheet. CEO Michael Torres. May need mezzanine or rescue capital.",
    dealThesis: "Developer distress creates opportunity. Lone Star needs $4.8M to cover MEP change orders or Comerica calls the construction loan. Two plays: (1) NEST provides $5M mezzanine bond at 12% coupon — rescue capital, fast close, secures NEST a seat at the table for the permanent takeout ($112M). (2) If Lone Star can't perform, NEST positions a PE buyer to acquire the project mid-construction at a discount. Either way, NEST earns fees on the debt.",
    source: "Travis County Permits + ATTOM + Construction monitor",
    discoveredAt: "2026-05-13T09:20:00Z",
  },
  {
    id: "cre_005",
    category: "cre",
    subtype: "maturing_loan",
    entity: "Pacific Heights Office Tower — The Pinnacle",
    description: "18-story class B office, 62% occupied. $48M CMBS loan matures Aug 2026. Owner facing 40% value decline since origination. Conversion candidate.",
    propertyType: "Office → Residential Conversion",
    address: "1850 Gateway Blvd",
    state: "OR",
    county: "Multnomah",
    city: "Portland",
    lat: 45.5231,
    lng: -122.6765,
    naics: "5311",
    amountUsd: 48_000_000,
    sqft: 310_000,
    score: 58,
    status: "review",
    darkZone: {
      currentCapRate: 2.8,
      marketCapRate: 7.0,
      currentNOI: 1_344_000,
      debtService: 3_200_000,
      dscr: 0.42,
      whyEquityFails: "62% occupancy, Class B office in Portland. NOI has declined 55% since 2020. Current 2.8% cap on remaining basis = uninvestable for equity.",
      bondCouponViable: "Office-to-residential conversion. 220 units at $1,800/mo avg = $4.75M residential NOI. At 6.25% bond coupon, 30yr am, DSCR hits 1.35x. Viable but tight — needs tax abatement.",
      bondStructureSummary: "Series A: $38M (acquisition at discount), Series B: $22M (conversion). Portland Multifamily Tax Exemption Program (MFTE) provides 12yr property tax abatement. Makes the math work.",
    },
    maturingLoan: {
      lender: "Wells Fargo CMBS Trust 2021-C60",
      originalAmount: 48_000_000,
      currentBalance: 45_200_000,
      maturityDate: "2026-08-15",
      currentRate: "3.85%",
      loanType: "CMBS",
    },
    ownerIntel: "KBS Real Estate Investment Trust — publicly traded, shedding office exposure. Will accept significant discount to resolve maturity. Special servicer already involved.",
    dealThesis: "CMBS maturity wall play. Wells Fargo trust matures Aug 2026, KBS can't refinance at current occupancy. Special servicer will negotiate. Acquire at $28-32M (40% discount), convert to 220 residential units. Portland MFTE tax abatement makes the bond math work. NEST structures $60M total (acquisition + conversion). This is a 3-year play — stabilized value $85M+. Classic dark zone: nobody touches office right now, but residential conversion with tax abatement = viable.",
    source: "Trepp CMBS data + Multnomah County + Portland Planning",
    discoveredAt: "2026-05-09T15:30:00Z",
  },
];

// ── Bullseye Demo Pitches ────────────────────────────────────────

export const DEMO_BULLSEYE_PITCHES: BullseyePitch[] = [
  {
    id: "pitch_001",
    signalId: "ma_001",
    signalEntity: "NexGen HVAC Holdings",
    targetFirm: "Summit Growth Partners",
    targetContact: "Mike Chen",
    targetTitle: "Managing Partner",
    targetEmail: "mchen@summitgrowth.com",
    whyThem: [
      "$400M Fund III, essential services mandate — HVAC is core thesis",
      "3 HVAC acquisitions in 12 months — actively building platform",
      "40% deployed — $240M dry powder needs to move",
      "Bay Area geography matches their existing portco footprint",
    ],
    whyThisDeal: [
      "NexGen: $62M rev / $8.2M EBITDA — platform anchor size",
      "3rd gen family, founder 71, no succession — motivated seller",
      "ComfortFlow ($45M, Summit's own portco) is natural bolt-on",
      "No competing banker engaged — clean field",
      "AS9100 quality certs + commercial contracts = defensible moat",
    ],
    whyNow: [
      "Founder turning 72 in Q3 — exit timeline accelerating",
      "Key operations manager left in April — institutional knowledge drain",
      "Sector multiples compressing from 9.5x to 8.5x — window closing",
      "Apex Service Capital circling same sector — competitive pressure",
    ],
    nestRole: [
      "Structure $35M Series A bond for acquisition financing",
      "45-day close — fastest path to LOI",
      "Can also structure bolt-on financing for ComfortFlow tuck-in",
      "Full bond desk support through exit (structuring, pricing, placement)",
    ],
    approachStrategy: "Warm intro via Morrison & Foerster (Summit's LP counsel). Alt: Direct to Mike Chen — reference their ComfortFlow acquisition as proof of thesis alignment.",
    warmIntroPath: "Morrison & Foerster LLP — David Kim, Partner (LP counsel for Summit Growth). Sean has existing relationship.",
    emailTemplate: `Mike,

We've identified a platform anchor opportunity in Bay Area HVAC that aligns directly with Summit's Fund III thesis and your ComfortFlow investment.

NexGen HVAC Holdings — $62M revenue, $8.2M EBITDA, 3rd generation family business. Founder is 71, no succession plan, no banker engaged. Clean field.

The play: Acquire NexGen as platform, tuck-in ComfortFlow within 12 months. Combined platform $107M revenue with clear path to 15%+ EBITDA margins post-synergies.

We can structure the acquisition financing ($35M bond) and close in 45 days.

Worth 15 minutes this week?

Sean Gilmore
NEST Advisors`,
    callScript: "Mike — Sean Gilmore, NEST Advisors. Quick call about a deal that fits your Fund III thesis perfectly. You know the Bay Area HVAC market — you bought ComfortFlow last year. We've identified the platform anchor that makes that a $100M+ combined business. NexGen HVAC, $62M revenue, 3rd gen family, founder's 71 with no plan. No banker, no competition. We can structure the debt in 45 days. Can I send you the one-pager?",
    status: "approved",
    createdAt: "2026-05-19T10:00:00Z",
  },
  {
    id: "pitch_002",
    signalId: "ma_002",
    signalEntity: "Cascadia Senior Services",
    targetFirm: "Valor Healthcare Partners",
    targetContact: "James Wright",
    targetTitle: "Partner",
    targetEmail: "jwright@valorhcp.com",
    whyThem: [
      "$600M Fund IV — largest fund, healthcare services mandate",
      "7 acquisitions in healthcare services last 18 months",
      "Pacific Home Health ($72M) is existing PNW portco — tuck-in logic",
      "35% deployed — significant dry powder for healthcare deals",
    ],
    whyThisDeal: [
      "Cascadia: $45M rev / $5.1M EBITDA — perfect tuck-in to Pacific Home Health",
      "Founder 67, exploring options through local CPA — early stage",
      "Medicare/Medicaid reimbursement base is stable revenue floor",
      "Combined with Pacific Home Health = $117M PNW healthcare platform",
      "No PE engagement — Valor gets first look",
    ],
    whyNow: [
      "Patricia Nguyen (founder) hired succession planning attorney in Q1 2026",
      "CPA advisor (Morrison & Associates) actively exploring options",
      "Margins compressing — needs PE operational expertise to right-size",
      "CMS reimbursement rates stabilizing after 2025 cuts — timing window",
    ],
    nestRole: [
      "Structure $25M bond for acquisition + working capital",
      "45-day close",
      "Can structure the broader Pacific Home Health platform recapitalization",
      "Ongoing debt advisory as Valor builds out PNW healthcare",
    ],
    approachStrategy: "Direct to James Wright — reference their Pacific Home Health platform as the strategic rationale. CPA (Morrison & Associates) is a secondary warm intro path.",
    warmIntroPath: "Morrison & Associates (Portland CPA) — advising Patricia Nguyen. Could facilitate introduction to Valor.",
    emailTemplate: `James,

Your Pacific Home Health platform in the PNW is missing a piece. We found it.

Cascadia Senior Services — $45M revenue, home health + hospice in Portland metro. Founder Patricia Nguyen is 67 and working with her CPA on succession planning. No PE engagement yet.

Combined with Pacific Home Health, you're looking at a $117M PNW healthcare services platform with Medicare/Medicaid revenue base and clear margin improvement opportunity.

We structure the acquisition debt and close in 45 days.

15 minutes?

Sean Gilmore
NEST Advisors`,
    callScript: "James — Sean Gilmore, NEST Advisors. I want to talk about a tuck-in that completes your Pacific Home Health platform. Cascadia Senior Services in Portland — $45M revenue, home health and hospice. Founder is 67, working with her CPA on succession. Nobody else is in the picture. Combined with Pacific Home Health, you've got a $117M PNW healthcare platform. We handle the debt structure, 45-day close. Can I send you the brief?",
    status: "draft",
    createdAt: "2026-05-19T11:30:00Z",
  },
  {
    id: "pitch_003",
    signalId: "cre_001",
    signalEntity: "Former Kmart — Fiesta Mall (Dark Zone)",
    targetFirm: "Diversified Real Estate Capital",
    targetContact: "Maria Gonzalez",
    targetTitle: "Managing Director, Opportunistic Fund",
    targetEmail: "mgonzalez@drec.com",
    whyThem: [
      "Opportunistic fund focused on retail repositioning",
      "3 successful big-box conversions in AZ last 24 months",
      "Mesa market expertise — existing relationships with city planning",
      "Fund has $180M in uncommitted capital for value-add deals",
    ],
    whyThisDeal: [
      "230K sqft vacant anchor at $62/sqft — 40% below replacement cost",
      "Rezoning already approved (Mesa City Council, Feb 2026)",
      "CMBS maturity Nov 2026 — Brookfield motivated to dispose",
      "Mesa TIF district provides tax increment subsidy",
      "Post-conversion NOI supports 1.45x DSCR on bond structure",
    ],
    whyNow: [
      "CMBS loan matures Nov 2026 — 6 month window",
      "Brookfield shedding non-core assets aggressively",
      "Mesa approved TIF district with expiration Dec 2026 — use it or lose it",
      "Construction costs stabilizing after 2025 spike — execution window",
    ],
    nestRole: [
      "Structure $14.2M Series A bond for acquisition",
      "Phase 2: $25M bond for mixed-use conversion",
      "45-day close on acquisition to beat CMBS maturity",
      "Dark zone structuring — this deal ONLY works with bond financing",
    ],
    approachStrategy: "Direct to Maria Gonzalez — she's done 3 big-box conversions in AZ. This is exactly her playbook. Reference Mesa TIF deadline as urgency driver.",
    warmIntroPath: null,
    emailTemplate: `Maria,

Dark zone deal in your backyard. Former Kmart anchor at Fiesta Mall, Mesa — 230K sqft on 12.5 acres. Brookfield shedding it. CMBS matures November.

The equity math doesn't work (3.2% cap, 0.51x DSCR). But bond math does — repositioned mixed-use NOI supports 1.45x DSCR at 5.75% coupon. Rezoning already approved. Mesa TIF district adds the kicker.

You've done three of these in AZ. This is #4. We structure the bond and close before the CMBS maturity hits.

Worth a look?

Sean Gilmore
NEST Advisors`,
    callScript: "Maria — Sean Gilmore, NEST Advisors. I've got a dark zone play that's right in your wheelhouse. Former Kmart at Fiesta Mall in Mesa. 230,000 square feet, 12 acres, Brookfield is shedding it. CMBS matures November — they're motivated. Nobody's touching it because the equity math doesn't work. 3.2% cap rate, half-a-turn DSCR. But we can structure a bond where the converted mixed-use NOI hits 1.45x coverage. Rezoning is already done, Mesa TIF district is live, and you've done three of these in Arizona. This is number four. Can I send you the one-pager?",
    status: "approved",
    createdAt: "2026-05-19T14:00:00Z",
  },
];

// ── Boxing Out Demo Prospects ────────────────────────────────────

export const DEMO_BOXINGOUT_PROSPECTS: BoxingOutProspect[] = [
  {
    id: "prospect_001",
    signalId: "ma_001",
    pitchId: "pitch_001",
    firmName: "Summit Growth Partners",
    contactName: "Mike Chen",
    contactEmail: "mchen@summitgrowth.com",
    contactPhone: "(415) 555-0147",
    contactTitle: "Managing Partner",
    source: "Bullseye — NexGen HVAC pitch",
    currentTouch: 6,
    status: "warm",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + Market Intel", content: "Intro email with Bay Area HVAC consolidation data", outcome: "opened", date: "2026-05-01T09:00:00Z", notes: "Opened twice, no reply" },
      { touchNumber: 2, type: "email_intel", label: "Market Intel Drop", content: "PE HVAC rollup trend report — 3 deals in Bay Area Q1 2026", outcome: "clicked", date: "2026-05-04T10:00:00Z", notes: "Clicked link to full report" },
      { touchNumber: 3, type: "call", label: "Cold Call #1", content: "Intro call — referenced email, mentioned NexGen opportunity", outcome: "voicemail", date: "2026-05-06T14:30:00Z", notes: "Left VM, mentioned ComfortFlow synergy angle" },
      { touchNumber: 4, type: "content_drip", label: "Content — HVAC Market Analysis", content: "Bernard-generated HVAC services M&A activity report", outcome: "opened", date: "2026-05-11T09:00:00Z", notes: "Opened, forwarded to team (tracking pixel on forward)" },
      { touchNumber: 5, type: "case_study", label: "Case Study", content: "How NEST structured a $40M services acquisition in 45 days", outcome: "clicked", date: "2026-05-15T10:00:00Z", notes: "Clicked through to case study. Spent 3 min on page." },
      { touchNumber: 6, type: "call", label: "Cold Call #2", content: "Follow up — he answered. 4 min call. Interested but busy through June.", outcome: "connected", date: "2026-05-18T15:00:00Z", notes: "CONNECTED. Said 'send me something specific.' Bullseye package going out." },
    ],
    emailOpens: 4,
    emailClicks: 2,
    nextTouchDate: "2026-05-25T09:00:00Z",
    nextTouchType: "targeted_intel",
    notes: "Connected on Call #2. Sending Bullseye NexGen package as targeted intel. Mike asked for specifics. This is warming up.",
    createdAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "prospect_002",
    signalId: "ma_002",
    pitchId: "pitch_002",
    firmName: "Valor Healthcare Partners",
    contactName: "James Wright",
    contactEmail: "jwright@valorhcp.com",
    contactPhone: "(212) 555-0293",
    contactTitle: "Partner",
    source: "Bullseye — Cascadia Senior Services pitch",
    currentTouch: 3,
    status: "cold",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + Healthcare Intel", content: "Intro + PNW healthcare M&A trends", outcome: "opened", date: "2026-05-10T09:00:00Z", notes: "Opened once" },
      { touchNumber: 2, type: "email_intel", label: "Market Intel Drop", content: "Home health reimbursement rate analysis — CMS 2026 outlook", outcome: "sent", date: "2026-05-13T10:00:00Z", notes: "No open detected yet" },
      { touchNumber: 3, type: "call", label: "Cold Call #1", content: "Intro call referencing Pacific Home Health portfolio", outcome: "no_answer", date: "2026-05-16T14:00:00Z", notes: "No answer, no voicemail option" },
    ],
    emailOpens: 1,
    emailClicks: 0,
    nextTouchDate: "2026-05-23T09:00:00Z",
    nextTouchType: "content_drip",
    notes: "Low engagement so far. Need to find better angle or alternate contact at Valor.",
    createdAt: "2026-05-10T08:00:00Z",
  },
  {
    id: "prospect_003",
    signalId: "cre_001",
    pitchId: "pitch_003",
    firmName: "Diversified Real Estate Capital",
    contactName: "Maria Gonzalez",
    contactEmail: "mgonzalez@drec.com",
    contactPhone: "(480) 555-0381",
    contactTitle: "Managing Director, Opportunistic Fund",
    source: "Bullseye — Fiesta Mall dark zone pitch",
    currentTouch: 8,
    status: "meeting_booked",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + AZ Retail Intel", content: "Intro + Mesa retail repositioning trends", outcome: "opened", date: "2026-04-20T09:00:00Z", notes: "Opened, replied asking for more detail" },
      { touchNumber: 2, type: "email_intel", label: "Mesa TIF District Analysis", content: "Bernard-generated TIF subsidy analysis for Mesa", outcome: "clicked", date: "2026-04-23T10:00:00Z", notes: "Clicked, downloaded PDF" },
      { touchNumber: 3, type: "call", label: "Cold Call #1", content: "Referenced TIF analysis. She knew the property.", outcome: "connected", date: "2026-04-25T11:00:00Z", notes: "CONNECTED. 8 min call. She's looked at this site before but couldn't make equity math work. Interested in bond approach." },
      { touchNumber: 4, type: "content_drip", label: "Dark Zone Concept Paper", content: "Bernard-generated whitepaper: 'When Equity Fails, Bonds Prevail'", outcome: "clicked", date: "2026-04-30T09:00:00Z", notes: "Clicked, forwarded to investment committee (tracked)" },
      { touchNumber: 5, type: "case_study", label: "Bond-Financed Retail Conversion", content: "Case study: Similar dark zone conversion, $18M bond, 14-month execution", outcome: "clicked", date: "2026-05-05T10:00:00Z", notes: "Forwarded to 2 team members" },
      { touchNumber: 6, type: "call", label: "Cold Call #2", content: "Follow up on case study. She wants to meet.", outcome: "connected", date: "2026-05-08T14:00:00Z", notes: "CONNECTED. 12 min call. Wants to bring her IC chair to a meeting. Scheduling for May 28." },
      { touchNumber: 7, type: "targeted_intel", label: "Fiesta Mall Full Package", content: "Bullseye pitch + bond structure + TIF analysis + comparable conversions", outcome: "clicked", date: "2026-05-12T09:00:00Z", notes: "Full package sent. She confirmed receipt and shared with IC chair." },
      { touchNumber: 8, type: "direct_ask", label: "Meeting Confirmation", content: "Confirmed meeting May 28 — Maria + IC Chair + Sean + bond desk", outcome: "replied", date: "2026-05-15T10:00:00Z", notes: "MEETING BOOKED: May 28, 2pm PT. Video call. Maria + Tom Reeves (IC Chair)." },
    ],
    emailOpens: 8,
    emailClicks: 5,
    nextTouchDate: "2026-05-28T14:00:00Z",
    nextTouchType: "close",
    notes: "MEETING MAY 28. Maria is sold on the concept. IC Chair Tom Reeves needs to see the bond structure math. Prep: full Bullseye package + Bond Desk proforma + TIF subsidy numbers.",
    createdAt: "2026-04-20T08:00:00Z",
  },
  {
    id: "prospect_004",
    signalId: "ma_003",
    pitchId: null,
    firmName: "Greenfield Industrial Partners",
    contactName: "David Park",
    contactEmail: "dpark@greenfieldip.com",
    contactPhone: "(214) 555-0512",
    contactTitle: "Senior Partner",
    source: "PE Landscape — Lone Star Waste signal",
    currentTouch: 1,
    status: "cold",
    touches: [
      { touchNumber: 1, type: "email_welcome", label: "Welcome + TX Waste Intel", content: "Intro + Texas waste services M&A landscape report", outcome: "pending", date: "2026-05-20T09:00:00Z", notes: "Queued for send today" },
    ],
    emailOpens: 0,
    emailClicks: 0,
    nextTouchDate: "2026-05-23T10:00:00Z",
    nextTouchType: "email_intel",
    notes: "New prospect. Greenfield is building TX waste platform — EcoHaul + Metro Disposal. Lone Star is the missing piece. Bullseye pitch being generated.",
    createdAt: "2026-05-20T08:00:00Z",
  },
];

// ── Boxing Out Content Queue ─────────────────────────────────────

export const DEMO_CONTENT_QUEUE: ContentItem[] = [
  {
    id: "content_001",
    prospectId: "prospect_001",
    type: "targeted_intel",
    title: "NexGen HVAC — Full Bullseye Package for Summit Growth",
    body: "Complete pitch deck: NexGen HVAC acquisition thesis, ComfortFlow bolt-on synergies, $35M bond structure, 45-day close timeline, exit analysis.",
    status: "approved",
    scheduledFor: "2026-05-25T09:00:00Z",
  },
  {
    id: "content_002",
    prospectId: "prospect_002",
    type: "market_intel",
    title: "PNW Home Health M&A: Q2 2026 Activity Report",
    body: "Bernard-generated analysis of home health M&A activity in Pacific Northwest. 4 transactions closed in Q1, average multiple 9.1x. Medicare reimbursement stabilization creating acquisition window.",
    status: "draft",
    scheduledFor: "2026-05-23T09:00:00Z",
  },
  {
    id: "content_003",
    prospectId: "prospect_004",
    type: "trend_report",
    title: "TX Waste Services Consolidation — PE Landscape 2026",
    body: "Bernard-generated trend report: 3 PE-backed platforms actively rolling up TX waste. Fund sizes, deployment rates, target profiles. Greenfield IP leading with 4 acquisitions.",
    status: "draft",
    scheduledFor: "2026-05-26T09:00:00Z",
  },
  {
    id: "content_004",
    prospectId: "prospect_003",
    type: "case_study",
    title: "Bond-Financed Retail Conversion: The Gateway Project",
    body: "Detailed case study of a similar dark zone retail conversion. $18M bond, 14-month execution, 2.1x return. Includes bond structure, timeline, TIF subsidy mechanics.",
    status: "sent",
    scheduledFor: "2026-05-05T10:00:00Z",
  },
];

// ── US State coordinates for heat map ────────────────────────────

export const STATE_CENTERS: Record<string, { lat: number; lng: number; name: string }> = {
  AL: { lat: 32.806671, lng: -86.791130, name: "Alabama" },
  AK: { lat: 61.370716, lng: -152.404419, name: "Alaska" },
  AZ: { lat: 33.729759, lng: -111.431221, name: "Arizona" },
  AR: { lat: 34.969704, lng: -92.373123, name: "Arkansas" },
  CA: { lat: 36.116203, lng: -119.681564, name: "California" },
  CO: { lat: 39.059811, lng: -105.311104, name: "Colorado" },
  CT: { lat: 41.597782, lng: -72.755371, name: "Connecticut" },
  DE: { lat: 39.318523, lng: -75.507141, name: "Delaware" },
  FL: { lat: 27.766279, lng: -81.686783, name: "Florida" },
  GA: { lat: 33.040619, lng: -83.643074, name: "Georgia" },
  HI: { lat: 21.094318, lng: -157.498337, name: "Hawaii" },
  ID: { lat: 44.240459, lng: -114.478773, name: "Idaho" },
  IL: { lat: 40.349457, lng: -88.986137, name: "Illinois" },
  IN: { lat: 39.849426, lng: -86.258278, name: "Indiana" },
  IA: { lat: 42.011539, lng: -93.210526, name: "Iowa" },
  KS: { lat: 38.526600, lng: -96.726486, name: "Kansas" },
  KY: { lat: 37.668140, lng: -84.670067, name: "Kentucky" },
  LA: { lat: 31.169546, lng: -91.867805, name: "Louisiana" },
  ME: { lat: 44.693947, lng: -69.381927, name: "Maine" },
  MD: { lat: 39.063946, lng: -76.802101, name: "Maryland" },
  MA: { lat: 42.230171, lng: -71.530106, name: "Massachusetts" },
  MI: { lat: 43.326618, lng: -84.536095, name: "Michigan" },
  MN: { lat: 45.694454, lng: -93.900192, name: "Minnesota" },
  MS: { lat: 32.741646, lng: -89.678696, name: "Mississippi" },
  MO: { lat: 38.456085, lng: -92.288368, name: "Missouri" },
  MT: { lat: 46.921925, lng: -110.454353, name: "Montana" },
  NE: { lat: 41.125370, lng: -98.268082, name: "Nebraska" },
  NV: { lat: 38.313515, lng: -117.055374, name: "Nevada" },
  NH: { lat: 43.452492, lng: -71.563896, name: "New Hampshire" },
  NJ: { lat: 40.298904, lng: -74.521011, name: "New Jersey" },
  NM: { lat: 34.840515, lng: -106.248482, name: "New Mexico" },
  NY: { lat: 42.165726, lng: -74.948051, name: "New York" },
  NC: { lat: 35.630066, lng: -79.806419, name: "North Carolina" },
  ND: { lat: 47.528912, lng: -99.784012, name: "North Dakota" },
  OH: { lat: 40.388783, lng: -82.764915, name: "Ohio" },
  OK: { lat: 35.565342, lng: -96.928917, name: "Oklahoma" },
  OR: { lat: 44.572021, lng: -122.070938, name: "Oregon" },
  PA: { lat: 40.590752, lng: -77.209755, name: "Pennsylvania" },
  RI: { lat: 41.680893, lng: -71.511780, name: "Rhode Island" },
  SC: { lat: 33.856892, lng: -80.945007, name: "South Carolina" },
  SD: { lat: 44.299782, lng: -99.438828, name: "South Dakota" },
  TN: { lat: 35.747845, lng: -86.692345, name: "Tennessee" },
  TX: { lat: 31.054487, lng: -97.563461, name: "Texas" },
  UT: { lat: 40.150032, lng: -111.862434, name: "Utah" },
  VT: { lat: 44.045876, lng: -72.710686, name: "Vermont" },
  VA: { lat: 37.769337, lng: -78.169968, name: "Virginia" },
  WA: { lat: 47.400902, lng: -121.490494, name: "Washington" },
  WV: { lat: 38.491226, lng: -80.954453, name: "West Virginia" },
  WI: { lat: 44.268543, lng: -89.616508, name: "Wisconsin" },
  WY: { lat: 42.755966, lng: -107.302490, name: "Wyoming" },
};
