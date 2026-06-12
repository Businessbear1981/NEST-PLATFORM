"use client";
/**
 * ModulePages.tsx — 39 module page components for the NEST Advisors platform.
 * Each exports a standalone page with header, metric cards, and data tables
 * using the NEST dark terminal design language.
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/* ─── Shared helpers ─────────────────────────────────────────────── */

function money(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

/* ─── Reusable layout blocks ──────────────────────────────────────── */

function PageShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#03060b] px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-[1.5rem] border border-[#C4A048]/20 bg-[#07101a]/80 p-6">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#C4A048]">{eyebrow}</p>
          <h1 className="mt-2 font-mono text-xl font-bold uppercase tracking-[0.06em] text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function MetricGrid({ metrics }: { metrics: { label: string; value: string; tone: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <article key={m.label} className={`relative overflow-hidden rounded-[1.25rem] border p-4 ${m.tone}`}>
          <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{m.label}</span>
          <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
        </article>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-white/10 bg-[#07101a]/88">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-900/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 font-mono text-xs text-slate-300">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status, variant = "default" }: { status: string; variant?: "green" | "amber" | "red" | "cyan" | "default" }) {
  const colors = {
    green: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-300/30 bg-amber-400/10 text-amber-200",
    red: "border-red-400/30 bg-red-500/10 text-red-200",
    cyan: "border-[#C4A048]/30 bg-[#C4A048]/10 text-[#E8C87A]",
    default: "border-white/20 bg-white/5 text-slate-300",
  };
  return <Badge variant="outline" className={`text-[0.56rem] ${colors[variant]}`}>{status}</Badge>;
}

const C = {
  cyan: "text-[#E8C87A] border-[#C4A048]/30 bg-[#C4A048]/8",
  gold: "text-amber-200 border-amber-300/35 bg-amber-300/9",
  green: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8",
  red: "text-red-200 border-red-400/30 bg-red-500/8",
  violet: "text-fuchsia-200 border-fuchsia-300/30 bg-fuchsia-500/8",
};

/* ══════════════════════════════════════════════════════════════════════
   1. DASHBOARDS
   ══════════════════════════════════════════════════════════════════════ */

export function BondDashboard() {
  return (
    <PageShell eyebrow="NEST BOND" title="Bond Dashboard" subtitle="Active bond pipeline, structuring status, and placement metrics across all series.">
      <MetricGrid metrics={[
        { label: "Pipeline Value", value: "$1.42B", tone: C.gold },
        { label: "Active Bonds", value: "14", tone: C.cyan },
        { label: "Avg Coupon", value: "6.87%", tone: C.green },
        { label: "Placement Rate", value: "94.2%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Series", "Issuer", "Amount", "Coupon", "Rating", "Status"]}
        rows={[
          ["2025-A", <span className="text-white">Jacaranda Trace PLOM</span>, <span className="text-amber-200">$231.0M</span>, "6.75%", <StatusBadge status="A-" variant="green" />, <StatusBadge status="Placed" variant="green" />],
          ["2025-B", <span className="text-white">Cypress Gardens CDD</span>, <span className="text-amber-200">$185.0M</span>, "7.10%", <StatusBadge status="BBB+" variant="amber" />, <StatusBadge status="Structuring" variant="cyan" />],
          ["2025-C", <span className="text-white">Meridian Crossing LGFC</span>, <span className="text-amber-200">$142.5M</span>, "6.50%", <StatusBadge status="A" variant="green" />, <StatusBadge status="Marketing" variant="amber" />],
          ["2025-D", <span className="text-white">Osprey Landing MUD</span>, <span className="text-amber-200">$98.0M</span>, "7.25%", <StatusBadge status="BBB" variant="amber" />, <StatusBadge status="Due Diligence" variant="cyan" />],
          ["2025-E", <span className="text-white">Palmetto Reserve PID</span>, <span className="text-amber-200">$312.0M</span>, "6.90%", <StatusBadge status="A-" variant="green" />, <StatusBadge status="Placed" variant="green" />],
          ["2026-A", <span className="text-white">Sawgrass Pointe CFD</span>, <span className="text-amber-200">$275.0M</span>, "7.00%", <StatusBadge status="BBB+" variant="amber" />, <StatusBadge status="Intake" variant="default" />],
          ["2026-B", <span className="text-white">Cascade Summit TID</span>, <span className="text-amber-200">$178.5M</span>, "6.65%", <StatusBadge status="A" variant="green" />, <StatusBadge status="Structuring" variant="cyan" />],
        ]}
      />
    </PageShell>
  );
}

export function MADashboard() {
  return (
    <PageShell eyebrow="NEST IB" title="M&A Dashboard" subtitle="Target universe, deal flow velocity, scoring models, and active evaluations.">
      <MetricGrid metrics={[
        { label: "Target Universe", value: "342", tone: C.violet },
        { label: "Active Evaluations", value: "18", tone: C.cyan },
        { label: "Avg Revenue (targets)", value: "$84.5M", tone: C.gold },
        { label: "LOI Pipeline", value: "$412M", tone: C.green },
      ]} />
      <DataTable
        headers={["Target", "Sector", "Revenue", "EBITDA", "Score", "Stage"]}
        rows={[
          [<span className="text-white">Pacific Northwest Timber Holdings</span>, "Natural Resources", <span className="text-amber-200">$142.0M</span>, "$28.4M", <span className="text-emerald-300">92</span>, <StatusBadge status="LOI Sent" variant="amber" />],
          [<span className="text-white">Cascade Environmental Services</span>, "Environmental", <span className="text-amber-200">$87.0M</span>, "$14.8M", <span className="text-emerald-300">88</span>, <StatusBadge status="Due Diligence" variant="cyan" />],
          [<span className="text-white">Summit Manufacturing Corp</span>, "Industrial", <span className="text-amber-200">$63.0M</span>, "$11.2M", <span className="text-amber-300">76</span>, <StatusBadge status="Initial Screen" variant="default" />],
          [<span className="text-white">Emerald City Healthcare</span>, "Healthcare", <span className="text-amber-200">$118.0M</span>, "$22.1M", <span className="text-emerald-300">85</span>, <StatusBadge status="Scoring" variant="cyan" />],
          [<span className="text-white">Olympic Steel Fabrication</span>, "Industrial", <span className="text-amber-200">$45.0M</span>, "$8.6M", <span className="text-amber-300">71</span>, <StatusBadge status="Outreach" variant="default" />],
          [<span className="text-white">Puget Sound Marine Logistics</span>, "Transportation", <span className="text-amber-200">$96.0M</span>, "$16.3M", <span className="text-emerald-300">83</span>, <StatusBadge status="Management Meeting" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

export function ICREDashboard() {
  return (
    <PageShell eyebrow="NEST CRE" title="ICRE Dashboard" subtitle="Investment-grade CRE portfolio: NOI waterfall, occupancy, and cap rate analysis across all properties.">
      <MetricGrid metrics={[
        { label: "Portfolio Value", value: "$2.14B", tone: C.gold },
        { label: "Weighted NOI", value: "$148.2M", tone: C.green },
        { label: "Avg Occupancy", value: "93.7%", tone: C.cyan },
        { label: "Avg Cap Rate", value: "6.42%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Property", "Type", "Value", "NOI", "Occupancy", "Cap Rate", "DSCR"]}
        rows={[
          [<span className="text-white">One Pacific Tower</span>, "Office", <span className="text-amber-200">$187.0M</span>, "$12.9M", "96.2%", "6.90%", <span className="text-emerald-300">2.14</span>],
          [<span className="text-white">Waterfront Plaza</span>, "Mixed-Use", <span className="text-amber-200">$245.0M</span>, "$16.8M", "94.1%", "6.86%", <span className="text-emerald-300">1.92</span>],
          [<span className="text-white">Cascade Industrial Park</span>, "Industrial", <span className="text-amber-200">$132.0M</span>, "$9.6M", "98.4%", "7.27%", <span className="text-emerald-300">2.31</span>],
          [<span className="text-white">Summit Retail Center</span>, "Retail", <span className="text-amber-200">$89.0M</span>, "$6.2M", "91.8%", "6.97%", <span className="text-amber-300">1.68</span>],
          [<span className="text-white">Harbor View Apartments</span>, "Multifamily", <span className="text-amber-200">$168.0M</span>, "$10.4M", "95.6%", "6.19%", <span className="text-emerald-300">1.87</span>],
          [<span className="text-white">Eastgate Medical Campus</span>, "Medical Office", <span className="text-amber-200">$204.0M</span>, "$14.1M", "92.3%", "6.91%", <span className="text-emerald-300">2.05</span>],
        ]}
      />
    </PageShell>
  );
}

export function OUDashboard() {
  return (
    <PageShell eyebrow="NEST OWNER/USER" title="Owner/User Dashboard" subtitle="Owner-occupied deal performance: DSCR monitoring, leverage ratios, and portfolio health.">
      <MetricGrid metrics={[
        { label: "Active OU Deals", value: "23", tone: C.cyan },
        { label: "Weighted DSCR", value: "1.82x", tone: C.green },
        { label: "Avg LTV", value: "62.4%", tone: C.gold },
        { label: "Portfolio Exposure", value: "$847M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Borrower", "Property Type", "Loan Amount", "DSCR", "LTV", "D/EBITDA", "Status"]}
        rows={[
          [<span className="text-white">Turner Construction NW</span>, "Industrial", <span className="text-amber-200">$42.5M</span>, <span className="text-emerald-300">2.12</span>, "58.3%", "3.8x", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">Pacific Coast Brewing</span>, "Manufacturing", <span className="text-amber-200">$18.0M</span>, <span className="text-emerald-300">1.94</span>, "64.1%", "4.2x", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">Evergreen Medical Group</span>, "Medical Office", <span className="text-amber-200">$35.0M</span>, <span className="text-amber-300">1.62</span>, "68.7%", "5.1x", <StatusBadge status="Watch" variant="amber" />],
          [<span className="text-white">Cascade Auto Group</span>, "Retail", <span className="text-amber-200">$27.8M</span>, <span className="text-emerald-300">2.34</span>, "55.2%", "3.4x", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">Olympic Steel NW</span>, "Industrial", <span className="text-amber-200">$52.0M</span>, <span className="text-amber-300">1.58</span>, "71.4%", "5.8x", <StatusBadge status="Watch" variant="amber" />],
          [<span className="text-white">Sound Transit Logistics</span>, "Warehouse", <span className="text-amber-200">$38.5M</span>, <span className="text-emerald-300">1.89</span>, "61.9%", "4.5x", <StatusBadge status="Performing" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function TreasuryCompanyDashboard() {
  return (
    <PageShell eyebrow="NEST TREASURY" title="Company Treasury Dashboard" subtitle="Corporate card program, escrow positions, rebate accrual, and cash management.">
      <MetricGrid metrics={[
        { label: "Card Spend (MTD)", value: "$2.84M", tone: C.gold },
        { label: "Rebate Accrued", value: "$42.6K", tone: C.green },
        { label: "Escrow Balance", value: "$18.7M", tone: C.cyan },
        { label: "Active Cards", value: "47", tone: C.violet },
      ]} />
      <DataTable
        headers={["Category", "Budget", "Spent", "Remaining", "Utilization", "Status"]}
        rows={[
          [<span className="text-white">Deal Due Diligence</span>, <span className="text-slate-300">$850K</span>, <span className="text-amber-200">$612K</span>, "$238K", "72.0%", <StatusBadge status="On Track" variant="green" />],
          [<span className="text-white">Appraisals & Inspections</span>, <span className="text-slate-300">$420K</span>, <span className="text-amber-200">$387K</span>, "$33K", "92.1%", <StatusBadge status="Near Limit" variant="amber" />],
          [<span className="text-white">Legal & Compliance</span>, <span className="text-slate-300">$680K</span>, <span className="text-amber-200">$445K</span>, "$235K", "65.4%", <StatusBadge status="On Track" variant="green" />],
          [<span className="text-white">Technology & SaaS</span>, <span className="text-slate-300">$185K</span>, <span className="text-amber-200">$142K</span>, "$43K", "76.8%", <StatusBadge status="On Track" variant="green" />],
          [<span className="text-white">Travel & Entertainment</span>, <span className="text-slate-300">$250K</span>, <span className="text-amber-200">$268K</span>, "-$18K", "107.2%", <StatusBadge status="Over Budget" variant="red" />],
          [<span className="text-white">Marketing & BD</span>, <span className="text-slate-300">$320K</span>, <span className="text-amber-200">$198K</span>, "$122K", "61.9%", <StatusBadge status="On Track" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function TreasuryEmployeeDashboard() {
  return (
    <PageShell eyebrow="NEST TREASURY" title="Employee Expense Dashboard" subtitle="Individual card usage, approval workflows, and receipt compliance tracking.">
      <MetricGrid metrics={[
        { label: "Pending Approvals", value: "12", tone: C.red },
        { label: "Avg Expense/Employee", value: "$4,218", tone: C.gold },
        { label: "Receipt Match Rate", value: "96.8%", tone: C.green },
        { label: "Active Cardholders", value: "34", tone: C.cyan },
      ]} />
      <DataTable
        headers={["Employee", "Department", "Card Spend (MTD)", "Pending", "Receipts", "Status"]}
        rows={[
          [<span className="text-white">Sarah Chen</span>, "Deal Team", <span className="text-amber-200">$14,820</span>, "2", "98%", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Marcus Williams</span>, "BD", <span className="text-amber-200">$8,340</span>, "0", "100%", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Jennifer Park</span>, "Legal", <span className="text-amber-200">$6,150</span>, "1", "94%", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">David Okafor</span>, "Underwriting", <span className="text-amber-200">$3,890</span>, "3", "87%", <StatusBadge status="Review" variant="amber" />],
          [<span className="text-white">Emily Rodriguez</span>, "Operations", <span className="text-amber-200">$2,420</span>, "0", "100%", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">James Liu</span>, "Technology", <span className="text-amber-200">$5,680</span>, "1", "92%", <StatusBadge status="Active" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function CompDashboard() {
  return (
    <PageShell eyebrow="NEST FINANCE" title="Compensation Dashboard" subtitle="Success fee tracking, compensation earned, fee pipeline, and payout schedules.">
      <MetricGrid metrics={[
        { label: "Fees Earned (YTD)", value: "$8.42M", tone: C.gold },
        { label: "Fee Pipeline", value: "$14.6M", tone: C.cyan },
        { label: "Avg Fee Rate", value: "1.85%", tone: C.green },
        { label: "Closings (YTD)", value: "11", tone: C.violet },
      ]} />
      <DataTable
        headers={["Deal", "Fee Type", "Transaction Value", "Fee Rate", "Fee Amount", "Status"]}
        rows={[
          [<span className="text-white">Jacaranda Trace PLOM</span>, "Placement", <span className="text-amber-200">$231.0M</span>, "2.00%", <span className="text-emerald-300">$4.62M</span>, <StatusBadge status="Paid" variant="green" />],
          [<span className="text-white">Cypress Gardens CDD</span>, "Structuring", <span className="text-amber-200">$185.0M</span>, "1.75%", <span className="text-amber-200">$3.24M</span>, <StatusBadge status="Pipeline" variant="amber" />],
          [<span className="text-white">Meridian Crossing LGFC</span>, "Advisory", <span className="text-amber-200">$142.5M</span>, "1.50%", <span className="text-amber-200">$2.14M</span>, <StatusBadge status="Pipeline" variant="amber" />],
          [<span className="text-white">PNW Timber Acquisition</span>, "M&A Advisory", <span className="text-amber-200">$142.0M</span>, "2.25%", <span className="text-emerald-300">$3.20M</span>, <StatusBadge status="Invoiced" variant="cyan" />],
          [<span className="text-white">Summit Manufacturing</span>, "M&A Advisory", <span className="text-amber-200">$63.0M</span>, "2.50%", <span className="text-amber-200">$1.58M</span>, <StatusBadge status="Pipeline" variant="amber" />],
          [<span className="text-white">Harbor View Apartments</span>, "Placement", <span className="text-amber-200">$168.0M</span>, "1.50%", <span className="text-emerald-300">$2.52M</span>, <StatusBadge status="Paid" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function PVDashboard() {
  return (
    <PageShell eyebrow="NEST ANALYTICS" title="P x V Analysis" subtitle="Price times Volume deal economics -- revenue velocity, margin analysis, and throughput metrics.">
      <MetricGrid metrics={[
        { label: "Total Volume (YTD)", value: "$3.84B", tone: C.gold },
        { label: "Revenue/Volume", value: "22 bps", tone: C.cyan },
        { label: "Deal Velocity", value: "4.2/mo", tone: C.green },
        { label: "Gross Margin", value: "68.4%", tone: C.violet },
      ]} />
      <DataTable
        headers={["LOB", "Volume", "Revenue", "bps", "# Deals", "Margin"]}
        rows={[
          [<span className="text-white">NEST Bond</span>, <span className="text-amber-200">$1.42B</span>, <span className="text-emerald-300">$12.8M</span>, "9.0", "14", "72.1%"],
          [<span className="text-white">NEST IB (M&A)</span>, <span className="text-amber-200">$684M</span>, <span className="text-emerald-300">$8.4M</span>, "12.3", "6", "81.4%"],
          [<span className="text-white">NEST CRE</span>, <span className="text-amber-200">$847M</span>, <span className="text-emerald-300">$5.2M</span>, "6.1", "23", "64.8%"],
          [<span className="text-white">Sparrow</span>, <span className="text-amber-200">$412M</span>, <span className="text-emerald-300">$3.8M</span>, "9.2", "31", "58.3%"],
          [<span className="text-white">Phoenix (Distressed)</span>, <span className="text-amber-200">$298M</span>, <span className="text-emerald-300">$4.1M</span>, "13.8", "8", "76.9%"],
          [<span className="text-white">Term Lending</span>, <span className="text-amber-200">$178M</span>, <span className="text-emerald-300">$1.4M</span>, "7.9", "15", "52.7%"],
        ]}
      />
    </PageShell>
  );
}

export function InvestorDashboard() {
  return (
    <PageShell eyebrow="NEST INVESTOR PORTAL" title="Investor Dashboard" subtitle="Portfolio performance, capital allocation, returns, and distribution schedule.">
      <MetricGrid metrics={[
        { label: "Portfolio AUM", value: "$847.2M", tone: C.gold },
        { label: "Weighted IRR", value: "14.8%", tone: C.green },
        { label: "Distributions (YTD)", value: "$32.4M", tone: C.cyan },
        { label: "Active Positions", value: "18", tone: C.violet },
      ]} />
      <DataTable
        headers={["Investment", "Commitment", "Called", "Distributed", "MOIC", "IRR"]}
        rows={[
          [<span className="text-white">NEST Bond Fund I</span>, <span className="text-amber-200">$250.0M</span>, "$225.0M", <span className="text-emerald-300">$48.2M</span>, "1.42x", <span className="text-emerald-300">16.2%</span>],
          [<span className="text-white">Phoenix Opportunity Fund</span>, <span className="text-amber-200">$125.0M</span>, "$112.0M", <span className="text-emerald-300">$28.4M</span>, "1.38x", <span className="text-emerald-300">18.4%</span>],
          [<span className="text-white">Jacaranda Trace Series A</span>, <span className="text-amber-200">$173.3M</span>, "$173.3M", <span className="text-emerald-300">$12.1M</span>, "1.07x", <span className="text-emerald-300">6.75%</span>],
          [<span className="text-white">Quantum HFT Fund</span>, <span className="text-amber-200">$32.4M</span>, "$32.4M", <span className="text-emerald-300">$6.9M</span>, "1.21x", <span className="text-emerald-300">21.3%</span>],
          [<span className="text-white">NEST CRE Income Fund</span>, <span className="text-amber-200">$180.0M</span>, "$156.0M", <span className="text-emerald-300">$18.6M</span>, "1.12x", <span className="text-emerald-300">11.8%</span>],
          [<span className="text-white">Sparrow Conventional Pool</span>, <span className="text-amber-200">$86.5M</span>, "$78.2M", <span className="text-emerald-300">$9.4M</span>, "1.12x", <span className="text-emerald-300">9.6%</span>],
        ]}
      />
    </PageShell>
  );
}

export function PartnerDashboard() {
  return (
    <PageShell eyebrow="NEST PARTNER PORTAL" title="Partner Dashboard" subtitle="Deal flow attribution, revenue share calculations, pipeline visibility, and co-investment opportunities.">
      <MetricGrid metrics={[
        { label: "Partner Pipeline", value: "$1.28B", tone: C.gold },
        { label: "Revenue Share (YTD)", value: "$2.84M", tone: C.green },
        { label: "Referred Deals", value: "34", tone: C.cyan },
        { label: "Conversion Rate", value: "41.2%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Partner", "Deals Referred", "Pipeline Value", "Revenue Share", "Conversion", "Status"]}
        rows={[
          [<span className="text-white">Hylant Insurance</span>, "8", <span className="text-amber-200">$342.0M</span>, <span className="text-emerald-300">$684K</span>, "62.5%", <StatusBadge status="Platinum" variant="green" />],
          [<span className="text-white">CalPERS</span>, "3", <span className="text-amber-200">$425.0M</span>, <span className="text-emerald-300">$850K</span>, "66.7%", <StatusBadge status="Platinum" variant="green" />],
          [<span className="text-white">Soparrow Capital</span>, "12", <span className="text-amber-200">$218.0M</span>, <span className="text-emerald-300">$436K</span>, "41.7%", <StatusBadge status="Gold" variant="amber" />],
          [<span className="text-white">Northwestern Mutual</span>, "4", <span className="text-amber-200">$156.0M</span>, <span className="text-emerald-300">$312K</span>, "50.0%", <StatusBadge status="Gold" variant="amber" />],
          [<span className="text-white">PIMCO</span>, "2", <span className="text-amber-200">$280.0M</span>, <span className="text-emerald-300">$560K</span>, "50.0%", <StatusBadge status="Gold" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

export function ClientDashboard() {
  return (
    <PageShell eyebrow="NEST CLIENT PORTAL" title="Client Dashboard" subtitle="Active deal status, document repository, milestone tracking, and payment schedule.">
      <MetricGrid metrics={[
        { label: "Active Engagements", value: "6", tone: C.cyan },
        { label: "Documents Pending", value: "14", tone: C.red },
        { label: "Next Milestone", value: "Jun 12", tone: C.gold },
        { label: "Payments Current", value: "100%", tone: C.green },
      ]} />
      <DataTable
        headers={["Deal", "Type", "Stage", "Next Action", "Due Date", "Status"]}
        rows={[
          [<span className="text-white">Cypress Gardens CDD</span>, "Bond", "Structuring", "Sign Indenture", "Jun 15", <StatusBadge status="On Track" variant="green" />],
          [<span className="text-white">Summit Manufacturing</span>, "M&A", "Due Diligence", "Upload Financials", "Jun 8", <StatusBadge status="Action Required" variant="red" />],
          [<span className="text-white">Harbor View Phase II</span>, "CRE", "Underwriting", "Appraisal Review", "Jun 22", <StatusBadge status="On Track" variant="green" />],
          [<span className="text-white">Cascade Steel Facility</span>, "Owner/User", "Closing", "Wire Instructions", "Jun 3", <StatusBadge status="Closing" variant="amber" />],
          [<span className="text-white">Olympic Logistics Center</span>, "Term Loan", "Funding", "Insurance Cert", "Jun 10", <StatusBadge status="On Track" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. BUSINESS DEVELOPMENT
   ══════════════════════════════════════════════════════════════════════ */

export function ContactStrategy() {
  return (
    <PageShell eyebrow="NEST BD" title="Contact Strategy" subtitle="Relationship CRM: contact warmth scoring, last touch tracking, and next-action queue.">
      <MetricGrid metrics={[
        { label: "Total Contacts", value: "1,847", tone: C.cyan },
        { label: "Hot Leads", value: "42", tone: C.red },
        { label: "Meetings This Week", value: "18", tone: C.gold },
        { label: "Avg Warmth Score", value: "6.4/10", tone: C.green },
      ]} />
      <DataTable
        headers={["Contact", "Company", "Last Touch", "Warmth", "Next Action", "Priority"]}
        rows={[
          [<span className="text-white">Michael Torres</span>, "CalPERS", "2 days ago", <span className="text-emerald-300">9.2</span>, "Follow-up call", <StatusBadge status="Hot" variant="red" />],
          [<span className="text-white">Christine Wang</span>, "PIMCO", "5 days ago", <span className="text-emerald-300">8.7</span>, "Send teaser", <StatusBadge status="Hot" variant="red" />],
          [<span className="text-white">Robert Steinberg</span>, "Hylant Insurance", "1 day ago", <span className="text-emerald-300">8.4</span>, "Schedule site visit", <StatusBadge status="Hot" variant="red" />],
          [<span className="text-white">Amanda Zhao</span>, "Northwestern Mutual", "1 week ago", <span className="text-amber-300">7.1</span>, "Email update", <StatusBadge status="Warm" variant="amber" />],
          [<span className="text-white">David Kim</span>, "Nuveen", "2 weeks ago", <span className="text-amber-300">5.8</span>, "Re-engage", <StatusBadge status="Warm" variant="amber" />],
          [<span className="text-white">Sarah Patterson</span>, "Turner Construction", "3 weeks ago", <span className="text-slate-400">4.2</span>, "Outreach sequence", <StatusBadge status="Cool" variant="default" />],
        ]}
      />
    </PageShell>
  );
}

export function Outreach() {
  return (
    <PageShell eyebrow="NEST BD" title="Outreach Campaigns" subtitle="Email sequences, open rates, meeting conversion, and pipeline attribution.">
      <MetricGrid metrics={[
        { label: "Active Sequences", value: "8", tone: C.cyan },
        { label: "Emails Sent (30d)", value: "2,412", tone: C.gold },
        { label: "Open Rate", value: "34.2%", tone: C.green },
        { label: "Meetings Booked", value: "28", tone: C.violet },
      ]} />
      <DataTable
        headers={["Campaign", "Audience", "Sent", "Opened", "Replied", "Meetings", "Status"]}
        rows={[
          [<span className="text-white">Bond Investor Outreach</span>, "Institutional", "482", "38.4%", "12.1%", "14", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">CRE Broker Network</span>, "Brokers", "318", "42.1%", "8.8%", "6", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">M&A Target Approach</span>, "C-Suite", "156", "28.6%", "14.2%", "5", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">OU Banking Prospects</span>, "Business Owners", "624", "31.7%", "6.4%", "8", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Phoenix Distressed CRE</span>, "Special Servicers", "212", "45.3%", "18.9%", "8", <StatusBadge status="Paused" variant="amber" />],
          [<span className="text-white">Sparrow Refi Offers</span>, "Existing Clients", "420", "52.8%", "22.4%", "12", <StatusBadge status="Active" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function HeatMaps() {
  return (
    <PageShell eyebrow="NEST EAGLEEYE" title="Geographic Heat Maps" subtitle="Deal density by state, MSA-level opportunity scoring, and market penetration analysis.">
      <MetricGrid metrics={[
        { label: "Active Markets", value: "24", tone: C.cyan },
        { label: "Top MSA", value: "Seattle-Tacoma", tone: C.gold },
        { label: "Deal Density (top)", value: "14.2/MSA", tone: C.green },
        { label: "Whitespace Markets", value: "38", tone: C.violet },
      ]} />
      <DataTable
        headers={["State", "MSA", "Active Deals", "Pipeline Value", "Opportunity Score", "Penetration"]}
        rows={[
          [<span className="text-white">Washington</span>, "Seattle-Tacoma-Bellevue", "18", <span className="text-amber-200">$842M</span>, <span className="text-emerald-300">94</span>, <><Progress value={78} className="h-1.5 w-16 inline-block" /> <span className="text-xs">78%</span></>],
          [<span className="text-white">Florida</span>, "Tampa-St Petersburg", "12", <span className="text-amber-200">$624M</span>, <span className="text-emerald-300">91</span>, <><Progress value={65} className="h-1.5 w-16 inline-block" /> <span className="text-xs">65%</span></>],
          [<span className="text-white">Oregon</span>, "Portland-Vancouver", "8", <span className="text-amber-200">$312M</span>, <span className="text-amber-300">82</span>, <><Progress value={54} className="h-1.5 w-16 inline-block" /> <span className="text-xs">54%</span></>],
          [<span className="text-white">Texas</span>, "Dallas-Fort Worth", "6", <span className="text-amber-200">$478M</span>, <span className="text-amber-300">79</span>, <><Progress value={32} className="h-1.5 w-16 inline-block" /> <span className="text-xs">32%</span></>],
          [<span className="text-white">California</span>, "Los Angeles-Long Beach", "4", <span className="text-amber-200">$562M</span>, <span className="text-amber-300">76</span>, <><Progress value={22} className="h-1.5 w-16 inline-block" /> <span className="text-xs">22%</span></>],
          [<span className="text-white">Colorado</span>, "Denver-Aurora", "3", <span className="text-amber-200">$218M</span>, <span className="text-amber-300">71</span>, <><Progress value={18} className="h-1.5 w-16 inline-block" /> <span className="text-xs">18%</span></>],
        ]}
      />
    </PageShell>
  );
}

export function EagleEyeBond() {
  return (
    <PageShell eyebrow="NEST EAGLEEYE" title="EagleEye Bond" subtitle="Bond-specific business development: issuer pipeline, outreach status, and conversion tracking.">
      <MetricGrid metrics={[
        { label: "Issuer Pipeline", value: "86", tone: C.cyan },
        { label: "Outreach Active", value: "34", tone: C.gold },
        { label: "Conversion Rate", value: "18.6%", tone: C.green },
        { label: "Avg Deal Size", value: "$164M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Issuer", "Type", "Est. Amount", "Contact", "Stage", "Score"]}
        rows={[
          [<span className="text-white">Manatee County CDD</span>, "LGFC", <span className="text-amber-200">$195.0M</span>, "Dir. of Finance", <StatusBadge status="Proposal Sent" variant="amber" />, <span className="text-emerald-300">88</span>],
          [<span className="text-white">Volusia County PID</span>, "PID", <span className="text-amber-200">$124.0M</span>, "County Manager", <StatusBadge status="Meeting Set" variant="cyan" />, <span className="text-emerald-300">84</span>],
          [<span className="text-white">Collier County MUD</span>, "MUD", <span className="text-amber-200">$210.0M</span>, "Bond Counsel", <StatusBadge status="Initial Contact" variant="default" />, <span className="text-amber-300">72</span>],
          [<span className="text-white">Hillsborough CFD</span>, "CFD", <span className="text-amber-200">$165.0M</span>, "Finance Dir.", <StatusBadge status="Due Diligence" variant="green" />, <span className="text-emerald-300">91</span>],
          [<span className="text-white">Pasco County CDD</span>, "CDD", <span className="text-amber-200">$88.0M</span>, "Board Chair", <StatusBadge status="Proposal Sent" variant="amber" />, <span className="text-amber-300">76</span>],
        ]}
      />
    </PageShell>
  );
}

export function EagleEyeICRE() {
  return (
    <PageShell eyebrow="NEST EAGLEEYE" title="EagleEye ICRE" subtitle="CRE-specific sourcing: property pipeline, broker relationships, and deal flow analytics.">
      <MetricGrid metrics={[
        { label: "Properties Tracked", value: "412", tone: C.cyan },
        { label: "Broker Relationships", value: "128", tone: C.gold },
        { label: "Off-Market Leads", value: "24", tone: C.green },
        { label: "Avg Property Value", value: "$48.2M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Property", "Type", "Value", "Broker", "Source", "Status"]}
        rows={[
          [<span className="text-white">Pioneer Square Office</span>, "Class A Office", <span className="text-amber-200">$142.0M</span>, "CBRE", "Listed", <StatusBadge status="Touring" variant="cyan" />],
          [<span className="text-white">SoDo Industrial Complex</span>, "Industrial", <span className="text-amber-200">$87.0M</span>, "Colliers", "Off-Market", <StatusBadge status="LOI Drafted" variant="amber" />],
          [<span className="text-white">Bellevue Mixed-Use</span>, "Mixed-Use", <span className="text-amber-200">$214.0M</span>, "JLL", "Listed", <StatusBadge status="Underwriting" variant="green" />],
          [<span className="text-white">Tacoma Waterfront</span>, "Multifamily", <span className="text-amber-200">$68.0M</span>, "Marcus & Millichap", "Auction", <StatusBadge status="Bid Submitted" variant="amber" />],
          [<span className="text-white">Redmond Tech Campus</span>, "Office/Lab", <span className="text-amber-200">$186.0M</span>, "Cushman", "Off-Market", <StatusBadge status="Initial Review" variant="default" />],
          [<span className="text-white">Kent Distribution Hub</span>, "Logistics", <span className="text-amber-200">$52.0M</span>, "Lee & Associates", "Listed", <StatusBadge status="Touring" variant="cyan" />],
        ]}
      />
    </PageShell>
  );
}

export function EagleEyeOU() {
  return (
    <PageShell eyebrow="NEST EAGLEEYE" title="EagleEye Owner/User" subtitle="Business banking prospects, referral source tracking, and owner-occupied deal pipeline.">
      <MetricGrid metrics={[
        { label: "Prospect Pipeline", value: "234", tone: C.cyan },
        { label: "Referral Sources", value: "48", tone: C.gold },
        { label: "Qualified Leads", value: "56", tone: C.green },
        { label: "Avg Loan Request", value: "$12.4M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Prospect", "Industry", "Loan Need", "Referral Source", "Revenue", "Status"]}
        rows={[
          [<span className="text-white">Northwest Precision Machining</span>, "Manufacturing", <span className="text-amber-200">$18.5M</span>, "Bank of America", "$42M", <StatusBadge status="Qualified" variant="green" />],
          [<span className="text-white">Cascade Veterinary Group</span>, "Healthcare", <span className="text-amber-200">$8.2M</span>, "Hylant Insurance", "$14M", <StatusBadge status="Application" variant="cyan" />],
          [<span className="text-white">Pacific Coast Dental</span>, "Healthcare", <span className="text-amber-200">$5.6M</span>, "CPA Referral", "$8M", <StatusBadge status="Screening" variant="default" />],
          [<span className="text-white">Emerald City Brewing</span>, "Food & Bev", <span className="text-amber-200">$12.0M</span>, "Direct", "$22M", <StatusBadge status="Qualified" variant="green" />],
          [<span className="text-white">Sound Transit Auto</span>, "Automotive", <span className="text-amber-200">$24.0M</span>, "Attorney Referral", "$68M", <StatusBadge status="LOI Stage" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

export function EagleEyeMA() {
  return (
    <PageShell eyebrow="NEST EAGLEEYE" title="EagleEye M&A" subtitle="Target universe scanning, approach status tracking, and LOI pipeline management.">
      <MetricGrid metrics={[
        { label: "Target Universe", value: "1,842", tone: C.cyan },
        { label: "Active Approaches", value: "42", tone: C.gold },
        { label: "LOI Pipeline", value: "$684M", tone: C.green },
        { label: "Avg Target EBITDA", value: "$14.2M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Target", "NAICS", "Revenue", "EBITDA", "EV/EBITDA", "Approach Status"]}
        rows={[
          [<span className="text-white">Pacific Environmental Corp</span>, "562910", <span className="text-amber-200">$86.0M</span>, "$14.2M", "8.4x", <StatusBadge status="NDA Signed" variant="green" />],
          [<span className="text-white">Cascade Metals & Alloys</span>, "331110", <span className="text-amber-200">$124.0M</span>, "$18.6M", "7.2x", <StatusBadge status="Management Meeting" variant="amber" />],
          [<span className="text-white">Olympic Data Systems</span>, "518210", <span className="text-amber-200">$45.0M</span>, "$11.8M", "12.4x", <StatusBadge status="Initial Outreach" variant="default" />],
          [<span className="text-white">Puget Sound Logistics</span>, "484110", <span className="text-amber-200">$92.0M</span>, "$12.4M", "6.8x", <StatusBadge status="LOI Drafted" variant="cyan" />],
          [<span className="text-white">Rainier Healthcare Partners</span>, "621111", <span className="text-amber-200">$148.0M</span>, "$22.8M", "9.6x", <StatusBadge status="Due Diligence" variant="green" />],
          [<span className="text-white">Evergreen Waste Solutions</span>, "562111", <span className="text-amber-200">$67.0M</span>, "$10.4M", "8.8x", <StatusBadge status="Teaser Sent" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. TOOLS
   ══════════════════════════════════════════════════════════════════════ */

export function NapkinPage() {
  const [calcType, setCalcType] = useState<"ou" | "investor">("ou");
  const [purchasePrice, setPurchasePrice] = useState("2500000");
  const [downPayment, setDownPayment] = useState("20");
  const [interestRate, setInterestRate] = useState("6.5");
  const [noi, setNoi] = useState("225000");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runCalc = async () => {
    setLoading(true);
    try {
      const endpoint = calcType === "ou" ? "/api/napkin/demo/owner-user" : "/api/napkin/demo/investor-re";
      const body = calcType === "ou"
        ? { purchase_price: Number(purchasePrice), down_payment_pct: Number(downPayment), interest_rate: Number(interestRate), annual_revenue: Number(noi) * 4 }
        : { purchase_price: Number(purchasePrice), down_payment_pct: Number(downPayment), interest_rate: Number(interestRate), noi: Number(noi) };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      setResult(data.success ? data.data : data);
    } catch {
      setResult({ error: "API unavailable -- showing demo layout" });
    }
    setLoading(false);
  };

  return (
    <PageShell eyebrow="NEST TOOLS" title="Back of the Napkin" subtitle="Quick-fire deal economics calculator for owner/user and investor real estate scenarios.">
      <MetricGrid metrics={[
        { label: "Calculator Mode", value: calcType === "ou" ? "Owner/User" : "Investor RE", tone: C.cyan },
        { label: "Purchase Price", value: money(Number(purchasePrice)), tone: C.gold },
        { label: "Down Payment", value: `${downPayment}%`, tone: C.green },
        { label: "Rate", value: `${interestRate}%`, tone: C.violet },
      ]} />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.25rem] border border-[#C4A048]/20 bg-[#07101a]/88 p-5 space-y-4">
          <div className="flex gap-2">
            {(["ou", "investor"] as const).map((t) => (
              <button key={t} onClick={() => setCalcType(t)} className={`rounded-lg px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition ${calcType === t ? "bg-[#C4A048]/15 text-[#EDE8DC]" : "text-slate-500 hover:bg-white/5"}`}>
                {t === "ou" ? "Owner/User" : "Investor RE"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <label className="block"><span className="font-mono text-[0.6rem] uppercase text-slate-500">Purchase Price</span>
              <input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="mt-1 w-full rounded-xl border border-[#C4A048]/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#C4A048]/55" type="number" /></label>
            <label className="block"><span className="font-mono text-[0.6rem] uppercase text-slate-500">Down Payment %</span>
              <input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="mt-1 w-full rounded-xl border border-[#C4A048]/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#C4A048]/55" type="number" /></label>
            <label className="block"><span className="font-mono text-[0.6rem] uppercase text-slate-500">Interest Rate %</span>
              <input value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="mt-1 w-full rounded-xl border border-[#C4A048]/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#C4A048]/55" type="number" step="0.1" /></label>
            <label className="block"><span className="font-mono text-[0.6rem] uppercase text-slate-500">{calcType === "ou" ? "Annual NOI" : "NOI"}</span>
              <input value={noi} onChange={(e) => setNoi(e.target.value)} className="mt-1 w-full rounded-xl border border-[#C4A048]/20 bg-black/45 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#C4A048]/55" type="number" /></label>
            <button onClick={runCalc} disabled={loading} className="w-full rounded-xl border border-amber-300/35 bg-amber-300/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-amber-100 hover:bg-amber-300/20 disabled:opacity-60">
              {loading ? "Calculating..." : "Run Napkin"}
            </button>
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-amber-300/20 bg-[#07101a]/88 p-5">
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-amber-300 mb-4">Results</p>
          {result ? (
            <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className="space-y-3 text-slate-400 text-sm">
              <p>Configure inputs and click "Run Napkin" to see results.</p>
              <div className="grid gap-2 sm:grid-cols-2 mt-4">
                {[
                  { label: "Loan Amount", value: money(Number(purchasePrice) * (1 - Number(downPayment) / 100)) },
                  { label: "Equity Required", value: money(Number(purchasePrice) * Number(downPayment) / 100) },
                  { label: "Est. DSCR", value: (Number(noi) / (Number(purchasePrice) * (1 - Number(downPayment) / 100) * Number(interestRate) / 100)).toFixed(2) + "x" },
                  { label: "Cap Rate", value: pct(Number(noi) / Number(purchasePrice) * 100) },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <span className="font-mono text-[0.56rem] uppercase text-slate-500">{m.label}</span>
                    <p className="font-mono text-lg text-white mt-1">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export function ContentLibrary() {
  return (
    <PageShell eyebrow="NEST TOOLS" title="Content Library" subtitle="Document repository: offering memos, investor teasers, pitch decks, and compliance documents.">
      <MetricGrid metrics={[
        { label: "Total Documents", value: "284", tone: C.cyan },
        { label: "Active Memos", value: "12", tone: C.gold },
        { label: "Templates", value: "34", tone: C.green },
        { label: "Recent Updates", value: "8", tone: C.violet },
      ]} />
      <DataTable
        headers={["Document", "Type", "Deal", "Author", "Updated", "Status"]}
        rows={[
          [<span className="text-white">Jacaranda Trace OM</span>, <StatusBadge status="Offering Memo" variant="amber" />, "2025-A", "Morgan AI", "May 18", <StatusBadge status="Final" variant="green" />],
          [<span className="text-white">Cypress Gardens Teaser</span>, <StatusBadge status="Teaser" variant="cyan" />, "2025-B", "Morgan AI", "May 20", <StatusBadge status="Draft" variant="amber" />],
          [<span className="text-white">NEST Platform Deck</span>, <StatusBadge status="Pitch Deck" variant="default" />, "Corporate", "BD Team", "May 15", <StatusBadge status="Final" variant="green" />],
          [<span className="text-white">Bond Structuring Guide</span>, <StatusBadge status="Template" variant="cyan" />, "All", "Legal", "Apr 28", <StatusBadge status="Published" variant="green" />],
          [<span className="text-white">Meridian Crossing CIM</span>, <StatusBadge status="CIM" variant="amber" />, "2025-C", "Morgan AI", "May 21", <StatusBadge status="Review" variant="amber" />],
          [<span className="text-white">Q2 Investor Report</span>, <StatusBadge status="Report" variant="default" />, "Fund I", "Finance", "May 19", <StatusBadge status="Final" variant="green" />],
          [<span className="text-white">Compliance Manual v4.2</span>, <StatusBadge status="Compliance" variant="red" />, "Corporate", "NightVision", "May 10", <StatusBadge status="Published" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function VideoGenerator() {
  return (
    <PageShell eyebrow="NEST TOOLS" title="Video Generator" subtitle="AI video production queue: deal showcase reels, investor updates, and marketing content.">
      <MetricGrid metrics={[
        { label: "Videos Produced", value: "42", tone: C.cyan },
        { label: "In Queue", value: "6", tone: C.gold },
        { label: "Rendering", value: "2", tone: C.red },
        { label: "Templates", value: "14", tone: C.green },
      ]} />
      <DataTable
        headers={["Title", "Template", "Duration", "Resolution", "Created", "Status"]}
        rows={[
          [<span className="text-white">Jacaranda Trace Showcase</span>, "Deal Reel", "2:30", "4K", "May 18", <StatusBadge status="Published" variant="green" />],
          [<span className="text-white">Q2 Investor Update</span>, "Quarterly Report", "5:45", "1080p", "May 20", <StatusBadge status="Rendering" variant="amber" />],
          [<span className="text-white">NEST Platform Overview</span>, "Brand Promo", "1:45", "4K", "May 15", <StatusBadge status="Published" variant="green" />],
          [<span className="text-white">Cypress Gardens Fly-Through</span>, "Property Tour", "3:15", "4K", "May 21", <StatusBadge status="In Queue" variant="cyan" />],
          [<span className="text-white">Bond Market Commentary</span>, "Thought Leadership", "4:00", "1080p", "May 19", <StatusBadge status="Rendering" variant="amber" />],
          [<span className="text-white">Team Introduction Reel</span>, "Team Profile", "2:00", "4K", "May 12", <StatusBadge status="Published" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function TeaserGenerator() {
  return (
    <PageShell eyebrow="NEST TOOLS" title="Teaser Generator" subtitle="Automated investor teaser builder: template selection, data merge, and distribution tracking.">
      <MetricGrid metrics={[
        { label: "Teasers Generated", value: "68", tone: C.cyan },
        { label: "Active Templates", value: "8", tone: C.gold },
        { label: "Avg Open Rate", value: "42.8%", tone: C.green },
        { label: "Investor Responses", value: "34", tone: C.violet },
      ]} />
      <DataTable
        headers={["Teaser", "Template", "Target Audience", "Distributed", "Opens", "Status"]}
        rows={[
          [<span className="text-white">Jacaranda Trace Series A</span>, "Bond Teaser", "Institutional", "148", "44.6%", <StatusBadge status="Distributed" variant="green" />],
          [<span className="text-white">Cypress Gardens CDD</span>, "Bond Teaser", "Insurance Co", "86", "38.2%", <StatusBadge status="Draft" variant="amber" />],
          [<span className="text-white">PNW Timber Acquisition</span>, "M&A Teaser", "PE Firms", "42", "52.4%", <StatusBadge status="Distributed" variant="green" />],
          [<span className="text-white">Phoenix Fund II</span>, "Fund Teaser", "Family Offices", "64", "46.8%", <StatusBadge status="Distributed" variant="green" />],
          [<span className="text-white">Meridian Crossing LGFC</span>, "Bond Teaser", "Pension Funds", "92", "41.3%", <StatusBadge status="Generating" variant="cyan" />],
        ]}
      />
    </PageShell>
  );
}

export function CreditMemo() {
  return (
    <PageShell eyebrow="NEST TOOLS" title="Credit Memo Generator" subtitle="AI-powered credit memo drafting, review workflow, and committee submission tracking.">
      <MetricGrid metrics={[
        { label: "Active Memos", value: "8", tone: C.cyan },
        { label: "Committee Ready", value: "3", tone: C.green },
        { label: "In Review", value: "4", tone: C.gold },
        { label: "Avg Completion", value: "3.2 days", tone: C.violet },
      ]} />
      <DataTable
        headers={["Memo", "Deal", "Analyst", "Rating Rec", "Committee Date", "Status"]}
        rows={[
          [<span className="text-white">Cypress Gardens CDD</span>, "2025-B", "Maxwell AI", <StatusBadge status="BBB+" variant="amber" />, "Jun 5", <StatusBadge status="Committee Ready" variant="green" />],
          [<span className="text-white">Meridian Crossing LGFC</span>, "2025-C", "Maxwell AI", <StatusBadge status="A" variant="green" />, "Jun 12", <StatusBadge status="In Review" variant="amber" />],
          [<span className="text-white">Osprey Landing MUD</span>, "2025-D", "David Okafor", <StatusBadge status="BBB" variant="amber" />, "Jun 18", <StatusBadge status="Drafting" variant="cyan" />],
          [<span className="text-white">Sawgrass Pointe CFD</span>, "2026-A", "Maxwell AI", <StatusBadge status="BBB+" variant="amber" />, "Jun 25", <StatusBadge status="Data Collection" variant="default" />],
          [<span className="text-white">Summit Manufacturing</span>, "M&A-003", "Sarah Chen", <StatusBadge status="B+" variant="red" />, "Jun 8", <StatusBadge status="Committee Ready" variant="green" />],
          [<span className="text-white">PNW Timber Holdings</span>, "M&A-001", "Sarah Chen", <StatusBadge status="BB+" variant="amber" />, "Jun 10", <StatusBadge status="Committee Ready" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. NEST BOND (LOB-specific)
   ══════════════════════════════════════════════════════════════════════ */

export function DealIntakeBond() {
  return (
    <PageShell eyebrow="NEST BOND" title="Deal Intake -- Bond" subtitle="Bond deal submission queue: new applications, pod assignment, and structuring kickoff.">
      <MetricGrid metrics={[
        { label: "Pending Intake", value: "6", tone: C.red },
        { label: "In Structuring", value: "4", tone: C.cyan },
        { label: "Avg Processing", value: "4.8 days", tone: C.gold },
        { label: "This Month", value: "12", tone: C.green },
      ]} />
      <DataTable
        headers={["Submission", "Issuer", "Est. Amount", "Type", "Submitted", "Pod", "Status"]}
        rows={[
          [<span className="text-white">BOND-2026-014</span>, "Sawgrass Pointe CFD", <span className="text-amber-200">$275.0M</span>, "Revenue Bond", "May 18", "Alpha", <StatusBadge status="Under Review" variant="amber" />],
          [<span className="text-white">BOND-2026-015</span>, "Cascade Summit TID", <span className="text-amber-200">$178.5M</span>, "Tax Increment", "May 19", "Beta", <StatusBadge status="Pod Assigned" variant="cyan" />],
          [<span className="text-white">BOND-2026-016</span>, "Palm Coast MUD", <span className="text-amber-200">$92.0M</span>, "Utility Revenue", "May 20", "--", <StatusBadge status="Pending" variant="default" />],
          [<span className="text-white">BOND-2026-017</span>, "Seminole CDD #4", <span className="text-amber-200">$156.0M</span>, "Special Assessment", "May 21", "--", <StatusBadge status="Pending" variant="default" />],
          [<span className="text-white">BOND-2026-018</span>, "Lake Nona PID", <span className="text-amber-200">$312.0M</span>, "LGFC Bond", "May 21", "Alpha", <StatusBadge status="Under Review" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

export function RootsBond() {
  return (
    <PageShell eyebrow="NEST BOND" title="Roots -- Bond Documents" subtitle="Bond document repository: offering statements, indentures, feasibility studies, and trust agreements.">
      <MetricGrid metrics={[
        { label: "Total Documents", value: "342", tone: C.cyan },
        { label: "Pending Review", value: "18", tone: C.red },
        { label: "Auto-Parsed", value: "284", tone: C.green },
        { label: "Data Extracted", value: "96.2%", tone: C.gold },
      ]} />
      <DataTable
        headers={["Document", "Deal", "Type", "Pages", "Parsed", "Status"]}
        rows={[
          [<span className="text-white">Official Statement</span>, "Jacaranda Trace", <StatusBadge status="OS" variant="cyan" />, "186", "100%", <StatusBadge status="Complete" variant="green" />],
          [<span className="text-white">Trust Indenture</span>, "Cypress Gardens", <StatusBadge status="Legal" variant="amber" />, "94", "100%", <StatusBadge status="Complete" variant="green" />],
          [<span className="text-white">Feasibility Study</span>, "Meridian Crossing", <StatusBadge status="Analysis" variant="default" />, "142", "88%", <StatusBadge status="Parsing" variant="amber" />],
          [<span className="text-white">Engineer Report</span>, "Osprey Landing", <StatusBadge status="Technical" variant="cyan" />, "78", "100%", <StatusBadge status="Complete" variant="green" />],
          [<span className="text-white">Tax Certificate</span>, "Palmetto Reserve", <StatusBadge status="Tax" variant="amber" />, "24", "100%", <StatusBadge status="Complete" variant="green" />],
          [<span className="text-white">Disclosure Agreement</span>, "Sawgrass Pointe", <StatusBadge status="Legal" variant="amber" />, "36", "0%", <StatusBadge status="Queued" variant="default" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. SPARROW
   ══════════════════════════════════════════════════════════════════════ */

export function DealIntakeSparrow() {
  return (
    <PageShell eyebrow="SPARROW CAPITAL" title="Deal Intake -- Sparrow" subtitle="Conventional lending submissions: applications, credit screening, and underwriting queue.">
      <MetricGrid metrics={[
        { label: "New Applications", value: "14", tone: C.cyan },
        { label: "In Underwriting", value: "8", tone: C.gold },
        { label: "Pre-Approved", value: "5", tone: C.green },
        { label: "Avg Loan Size", value: "$8.4M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Application", "Borrower", "Loan Amount", "Property Type", "LTV", "Submitted", "Status"]}
        rows={[
          [<span className="text-white">SPR-2026-042</span>, "Pacific NW Dental", <span className="text-amber-200">$4.8M</span>, "Medical Office", "72%", "May 18", <StatusBadge status="Underwriting" variant="cyan" />],
          [<span className="text-white">SPR-2026-043</span>, "Cascade Brewing Co", <span className="text-amber-200">$6.2M</span>, "Industrial", "68%", "May 19", <StatusBadge status="Credit Review" variant="amber" />],
          [<span className="text-white">SPR-2026-044</span>, "Sound Logistics LLC", <span className="text-amber-200">$12.5M</span>, "Warehouse", "65%", "May 20", <StatusBadge status="Pre-Approved" variant="green" />],
          [<span className="text-white">SPR-2026-045</span>, "Olympic Auto Group", <span className="text-amber-200">$9.8M</span>, "Retail", "74%", "May 20", <StatusBadge status="Documents Needed" variant="red" />],
          [<span className="text-white">SPR-2026-046</span>, "Emerald Healthcare", <span className="text-amber-200">$15.2M</span>, "Medical Campus", "62%", "May 21", <StatusBadge status="New" variant="default" />],
        ]}
      />
    </PageShell>
  );
}

export function RootsSparrow() {
  return (
    <PageShell eyebrow="SPARROW CAPITAL" title="Roots -- Sparrow Documents" subtitle="Conventional loan document repository: financials, appraisals, title, and environmental reports.">
      <MetricGrid metrics={[
        { label: "Documents", value: "486", tone: C.cyan },
        { label: "Pending Upload", value: "22", tone: C.red },
        { label: "Auto-Spread", value: "312", tone: C.green },
        { label: "Extraction Rate", value: "94.8%", tone: C.gold },
      ]} />
      <DataTable
        headers={["Document", "Borrower", "Type", "Uploaded", "Spread", "Status"]}
        rows={[
          [<span className="text-white">Tax Returns (3yr)</span>, "Pacific NW Dental", <StatusBadge status="Financial" variant="amber" />, "May 18", "Complete", <StatusBadge status="Verified" variant="green" />],
          [<span className="text-white">Appraisal Report</span>, "Cascade Brewing", <StatusBadge status="Valuation" variant="cyan" />, "May 19", "Complete", <StatusBadge status="Verified" variant="green" />],
          [<span className="text-white">Phase I ESA</span>, "Sound Logistics", <StatusBadge status="Environmental" variant="default" />, "May 20", "N/A", <StatusBadge status="Under Review" variant="amber" />],
          [<span className="text-white">Title Commitment</span>, "Olympic Auto", <StatusBadge status="Legal" variant="amber" />, "May 20", "N/A", <StatusBadge status="Pending" variant="default" />],
          [<span className="text-white">Rent Roll</span>, "Emerald Healthcare", <StatusBadge status="Operations" variant="cyan" />, "May 21", "Parsing", <StatusBadge status="Processing" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

export function SparrowDeals() {
  return (
    <PageShell eyebrow="SPARROW CAPITAL" title="Sparrow Deals" subtitle="Conventional lending pipeline: active loans, portfolio performance, and servicing status.">
      <MetricGrid metrics={[
        { label: "Active Loans", value: "31", tone: C.cyan },
        { label: "Portfolio Value", value: "$412M", tone: C.gold },
        { label: "Avg DSCR", value: "1.64x", tone: C.green },
        { label: "Delinquency Rate", value: "0.8%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Loan", "Borrower", "Amount", "Rate", "DSCR", "Maturity", "Status"]}
        rows={[
          [<span className="text-white">SPR-2024-018</span>, "Pacific Coast Auto", <span className="text-amber-200">$8.4M</span>, "6.25%", <span className="text-emerald-300">1.82</span>, "Dec 2029", <StatusBadge status="Current" variant="green" />],
          [<span className="text-white">SPR-2024-022</span>, "Cascade Medical Group", <span className="text-amber-200">$14.2M</span>, "5.95%", <span className="text-emerald-300">1.74</span>, "Mar 2030", <StatusBadge status="Current" variant="green" />],
          [<span className="text-white">SPR-2025-003</span>, "Olympic Steel Works", <span className="text-amber-200">$22.5M</span>, "6.50%", <span className="text-amber-300">1.42</span>, "Jun 2030", <StatusBadge status="Watch" variant="amber" />],
          [<span className="text-white">SPR-2025-008</span>, "Sound Transit Storage", <span className="text-amber-200">$6.8M</span>, "6.10%", <span className="text-emerald-300">1.91</span>, "Sep 2030", <StatusBadge status="Current" variant="green" />],
          [<span className="text-white">SPR-2025-012</span>, "Rainier Hospitality", <span className="text-amber-200">$18.6M</span>, "6.75%", <span className="text-amber-300">1.38</span>, "Dec 2030", <StatusBadge status="30-Day Late" variant="red" />],
          [<span className="text-white">SPR-2025-015</span>, "Emerald City Fitness", <span className="text-amber-200">$4.2M</span>, "6.35%", <span className="text-emerald-300">1.68</span>, "Mar 2031", <StatusBadge status="Current" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6. NEST IB
   ══════════════════════════════════════════════════════════════════════ */

export function DealIntakeIB() {
  return (
    <PageShell eyebrow="NEST IB" title="Deal Intake -- Investment Banking" subtitle="IB engagement submissions: M&A mandates, equity raises, and advisory assignments.">
      <MetricGrid metrics={[
        { label: "Active Mandates", value: "8", tone: C.cyan },
        { label: "Pending Review", value: "3", tone: C.red },
        { label: "Avg Engagement Size", value: "$94M", tone: C.gold },
        { label: "Win Rate", value: "62.5%", tone: C.green },
      ]} />
      <DataTable
        headers={["Mandate", "Client", "Type", "Est. Value", "Fee Structure", "Submitted", "Status"]}
        rows={[
          [<span className="text-white">IB-2026-008</span>, "PNW Timber Holdings", "Sell-Side M&A", <span className="text-amber-200">$142.0M</span>, "2.25% success", "May 12", <StatusBadge status="Engaged" variant="green" />],
          [<span className="text-white">IB-2026-009</span>, "Cascade Metals", "Buy-Side M&A", <span className="text-amber-200">$124.0M</span>, "Retainer + 1.75%", "May 15", <StatusBadge status="Engaged" variant="green" />],
          [<span className="text-white">IB-2026-010</span>, "Olympic Data Systems", "Equity Raise", <span className="text-amber-200">$45.0M</span>, "5% placement", "May 18", <StatusBadge status="Diligence" variant="cyan" />],
          [<span className="text-white">IB-2026-011</span>, "Sound Marine Holdings", "Recapitalization", <span className="text-amber-200">$86.0M</span>, "1.5% advisory", "May 20", <StatusBadge status="Proposal" variant="amber" />],
          [<span className="text-white">IB-2026-012</span>, "Rainier Healthcare", "Sell-Side M&A", <span className="text-amber-200">$148.0M</span>, "2.0% success", "May 21", <StatusBadge status="Pending" variant="default" />],
        ]}
      />
    </PageShell>
  );
}

export function RootsIB() {
  return (
    <PageShell eyebrow="NEST IB" title="Roots -- IB Documents" subtitle="Investment banking document repository: CIMs, management presentations, data rooms, and LOIs.">
      <MetricGrid metrics={[
        { label: "Data Rooms", value: "6", tone: C.cyan },
        { label: "Documents", value: "1,842", tone: C.gold },
        { label: "Active CIMs", value: "4", tone: C.green },
        { label: "NDA Tracked", value: "48", tone: C.violet },
      ]} />
      <DataTable
        headers={["Document", "Engagement", "Type", "Version", "Access", "Status"]}
        rows={[
          [<span className="text-white">Confidential Info Memo</span>, "PNW Timber", <StatusBadge status="CIM" variant="amber" />, "v3.2", "42 parties", <StatusBadge status="Distributed" variant="green" />],
          [<span className="text-white">Management Presentation</span>, "Cascade Metals", <StatusBadge status="Deck" variant="cyan" />, "v2.1", "18 parties", <StatusBadge status="Final" variant="green" />],
          [<span className="text-white">Financial Model</span>, "Olympic Data", <StatusBadge status="Model" variant="amber" />, "v4.0", "Internal", <StatusBadge status="In Progress" variant="amber" />],
          [<span className="text-white">LOI Template</span>, "Rainier Healthcare", <StatusBadge status="Legal" variant="default" />, "v1.0", "Internal", <StatusBadge status="Draft" variant="default" />],
          [<span className="text-white">Due Diligence Checklist</span>, "PNW Timber", <StatusBadge status="DD" variant="cyan" />, "v2.0", "Buyer Only", <StatusBadge status="Active" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function MADesk() {
  return (
    <PageShell eyebrow="NEST IB" title="M&A Intelligence Desk" subtitle="Target scoring engine: 12-dimension analysis, comp set building, and strategic fit assessment.">
      <MetricGrid metrics={[
        { label: "Targets Scored", value: "186", tone: C.violet },
        { label: "Avg Score", value: "72.4/100", tone: C.cyan },
        { label: "A-Grade Targets", value: "28", tone: C.green },
        { label: "Active Approaches", value: "12", tone: C.gold },
      ]} />
      <DataTable
        headers={["Target", "Revenue", "EBITDA Margin", "Growth", "Moat Score", "Strategic Fit", "Overall"]}
        rows={[
          [<span className="text-white">Pacific Environmental</span>, <span className="text-amber-200">$86M</span>, "16.5%", "+12.4%", <span className="text-emerald-300">88</span>, <span className="text-emerald-300">92</span>, <span className="text-emerald-300">91</span>],
          [<span className="text-white">Cascade Metals</span>, <span className="text-amber-200">$124M</span>, "15.0%", "+8.2%", <span className="text-emerald-300">82</span>, <span className="text-emerald-300">86</span>, <span className="text-emerald-300">84</span>],
          [<span className="text-white">Rainier Healthcare</span>, <span className="text-amber-200">$148M</span>, "15.4%", "+14.8%", <span className="text-emerald-300">90</span>, <span className="text-amber-300">78</span>, <span className="text-emerald-300">82</span>],
          [<span className="text-white">Olympic Data Systems</span>, <span className="text-amber-200">$45M</span>, "26.2%", "+22.1%", <span className="text-amber-300">76</span>, <span className="text-amber-300">74</span>, <span className="text-amber-300">78</span>],
          [<span className="text-white">Puget Sound Logistics</span>, <span className="text-amber-200">$92M</span>, "13.5%", "+6.8%", <span className="text-amber-300">72</span>, <span className="text-emerald-300">84</span>, <span className="text-amber-300">76</span>],
          [<span className="text-white">Evergreen Waste</span>, <span className="text-amber-200">$67M</span>, "15.5%", "+9.4%", <span className="text-emerald-300">84</span>, <span className="text-amber-300">72</span>, <span className="text-amber-300">74</span>],
        ]}
      />
    </PageShell>
  );
}

export function EquityRaise() {
  return (
    <PageShell eyebrow="NEST IB" title="Equity Capital Formation" subtitle="Equity raise management: investor matching, term sheet tracking, and capital call scheduling.">
      <MetricGrid metrics={[
        { label: "Active Raises", value: "4", tone: C.cyan },
        { label: "Capital Sought", value: "$285M", tone: C.gold },
        { label: "Committed", value: "$142M", tone: C.green },
        { label: "Investor Pipeline", value: "86", tone: C.violet },
      ]} />
      <DataTable
        headers={["Raise", "Issuer", "Target", "Committed", "Investors", "Close Date", "Status"]}
        rows={[
          [<span className="text-white">NEST Bond Fund II</span>, "NEST Advisors", <span className="text-amber-200">$150.0M</span>, <span className="text-emerald-300">$82.0M</span>, "12", "Jul 31", <StatusBadge status="Marketing" variant="amber" />],
          [<span className="text-white">Olympic Data Series B</span>, "Olympic Data", <span className="text-amber-200">$45.0M</span>, <span className="text-emerald-300">$28.0M</span>, "6", "Jun 30", <StatusBadge status="Final Close" variant="green" />],
          [<span className="text-white">Phoenix Opp Fund II</span>, "NEST/Soparrow", <span className="text-amber-200">$75.0M</span>, <span className="text-emerald-300">$24.0M</span>, "8", "Sep 30", <StatusBadge status="First Close" variant="cyan" />],
          [<span className="text-white">Cascade Growth Equity</span>, "Cascade Metals", <span className="text-amber-200">$15.0M</span>, <span className="text-emerald-300">$8.0M</span>, "3", "Jun 15", <StatusBadge status="Term Sheet" variant="amber" />],
        ]}
      />
    </PageShell>
  );
}

export function Investments() {
  return (
    <PageShell eyebrow="NEST IB" title="Principal Investments" subtitle="Direct investment positions, mark-to-market valuations, and portfolio return analysis.">
      <MetricGrid metrics={[
        { label: "Portfolio NAV", value: "$184.2M", tone: C.gold },
        { label: "Total Invested", value: "$142.0M", tone: C.cyan },
        { label: "Unrealized Gain", value: "$42.2M", tone: C.green },
        { label: "Weighted IRR", value: "18.4%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Investment", "Vintage", "Cost Basis", "Current Value", "MOIC", "IRR", "Status"]}
        rows={[
          [<span className="text-white">PNW Timber Holdings (15%)</span>, "2024", <span className="text-amber-200">$21.3M</span>, <span className="text-emerald-300">$28.4M</span>, "1.33x", "22.1%", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">Quantum HFT Fund (GP)</span>, "2023", <span className="text-amber-200">$8.4M</span>, <span className="text-emerald-300">$12.8M</span>, "1.52x", "21.3%", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">Cascade Metals (8%)</span>, "2025", <span className="text-amber-200">$9.9M</span>, <span className="text-amber-200">$10.2M</span>, "1.03x", "8.4%", <StatusBadge status="Recent" variant="cyan" />],
          [<span className="text-white">Phoenix Fund I (GP/LP)</span>, "2023", <span className="text-amber-200">$32.0M</span>, <span className="text-emerald-300">$48.6M</span>, "1.52x", "18.4%", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">NEST Bond Fund I (GP)</span>, "2024", <span className="text-amber-200">$62.5M</span>, <span className="text-emerald-300">$74.2M</span>, "1.19x", "14.8%", <StatusBadge status="Performing" variant="green" />],
          [<span className="text-white">Sound Marine (12%)</span>, "2025", <span className="text-amber-200">$7.9M</span>, <span className="text-amber-200">$10.0M</span>, "1.27x", "16.2%", <StatusBadge status="Performing" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   7. TERM LENDING
   ══════════════════════════════════════════════════════════════════════ */

export function DealIntakeLending() {
  return (
    <PageShell eyebrow="NEST LENDING" title="Deal Intake -- Term Lending" subtitle="Term loan submissions: construction, bridge, and permanent financing applications.">
      <MetricGrid metrics={[
        { label: "New Submissions", value: "9", tone: C.cyan },
        { label: "In Processing", value: "6", tone: C.gold },
        { label: "Avg Loan Size", value: "$24.8M", tone: C.green },
        { label: "Pipeline", value: "$186M", tone: C.violet },
      ]} />
      <DataTable
        headers={["Application", "Borrower", "Amount", "Type", "Term", "Rate", "Status"]}
        rows={[
          [<span className="text-white">TL-2026-022</span>, "Turner Construction NW", <span className="text-amber-200">$42.0M</span>, "Construction", "24mo", "7.25%", <StatusBadge status="Approved" variant="green" />],
          [<span className="text-white">TL-2026-023</span>, "Pacific Coast Dev", <span className="text-amber-200">$28.5M</span>, "Bridge", "18mo", "8.50%", <StatusBadge status="Underwriting" variant="cyan" />],
          [<span className="text-white">TL-2026-024</span>, "Cascade Apartments LLC", <span className="text-amber-200">$18.0M</span>, "Permanent", "10yr", "6.15%", <StatusBadge status="Term Sheet" variant="amber" />],
          [<span className="text-white">TL-2026-025</span>, "Olympic Mixed-Use Dev", <span className="text-amber-200">$56.0M</span>, "Construction", "30mo", "7.50%", <StatusBadge status="Sizing" variant="default" />],
          [<span className="text-white">TL-2026-026</span>, "Emerald City Lofts", <span className="text-amber-200">$14.5M</span>, "Bridge", "12mo", "9.00%", <StatusBadge status="Credit Review" variant="amber" />],
          [<span className="text-white">TL-2026-027</span>, "Rainier Industrial Park", <span className="text-amber-200">$32.0M</span>, "Permanent", "7yr", "6.45%", <StatusBadge status="Approved" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

export function RootsLending() {
  return (
    <PageShell eyebrow="NEST LENDING" title="Roots -- Lending Documents" subtitle="Term lending document repository: loan applications, financials, collateral docs, and closing packages.">
      <MetricGrid metrics={[
        { label: "Documents", value: "624", tone: C.cyan },
        { label: "Pending Upload", value: "14", tone: C.red },
        { label: "Auto-Spread", value: "418", tone: C.green },
        { label: "Closing Packages", value: "8", tone: C.gold },
      ]} />
      <DataTable
        headers={["Document", "Loan", "Type", "Uploaded", "Spread", "Status"]}
        rows={[
          [<span className="text-white">Construction Budget</span>, "TL-2026-022", <StatusBadge status="Financial" variant="amber" />, "May 12", "Complete", <StatusBadge status="Verified" variant="green" />],
          [<span className="text-white">Appraisal (As-Is)</span>, "TL-2026-023", <StatusBadge status="Valuation" variant="cyan" />, "May 15", "Complete", <StatusBadge status="Verified" variant="green" />],
          [<span className="text-white">Appraisal (As-Stabilized)</span>, "TL-2026-023", <StatusBadge status="Valuation" variant="cyan" />, "May 15", "Complete", <StatusBadge status="Verified" variant="green" />],
          [<span className="text-white">Guarantor PFS</span>, "TL-2026-024", <StatusBadge status="Financial" variant="amber" />, "May 18", "Parsing", <StatusBadge status="Processing" variant="amber" />],
          [<span className="text-white">Title Report</span>, "TL-2026-025", <StatusBadge status="Legal" variant="default" />, "May 20", "N/A", <StatusBadge status="Under Review" variant="amber" />],
          [<span className="text-white">Environmental Phase II</span>, "TL-2026-025", <StatusBadge status="Environmental" variant="default" />, "May 21", "N/A", <StatusBadge status="Pending" variant="default" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   8. COMPLIANCE & LEGAL
   ══════════════════════════════════════════════════════════════════════ */

export function AtticusPage() {
  return (
    <PageShell eyebrow="NEST LEGAL" title="Atticus -- In-House Counsel" subtitle="Legal matter tracking, regulatory calendar, opinion pipeline, and compliance advisory.">
      <MetricGrid metrics={[
        { label: "Active Matters", value: "24", tone: C.red },
        { label: "Opinions Pending", value: "6", tone: C.gold },
        { label: "Regulatory Deadlines", value: "3", tone: C.cyan },
        { label: "Risk Items", value: "2", tone: C.violet },
      ]} />
      <DataTable
        headers={["Matter", "Type", "Deal/Entity", "Assigned", "Deadline", "Priority", "Status"]}
        rows={[
          [<span className="text-white">Bond Counsel Opinion</span>, "Opinion", "Cypress Gardens", "External", "Jun 5", <StatusBadge status="High" variant="red" />, <StatusBadge status="Drafting" variant="amber" />],
          [<span className="text-white">MSRB Rule G-17 Filing</span>, "Regulatory", "All Bond Deals", "Internal", "Jun 15", <StatusBadge status="High" variant="red" />, <StatusBadge status="In Progress" variant="cyan" />],
          [<span className="text-white">NDA -- Rainier Healthcare</span>, "Contract", "IB-2026-012", "Internal", "May 28", <StatusBadge status="Medium" variant="amber" />, <StatusBadge status="Review" variant="amber" />],
          [<span className="text-white">SEC Reg D Filing</span>, "Regulatory", "Bond Fund II", "External", "Jul 15", <StatusBadge status="Medium" variant="amber" />, <StatusBadge status="Preparing" variant="default" />],
          [<span className="text-white">Engagement Letter Review</span>, "Contract", "Olympic Data", "Internal", "Jun 1", <StatusBadge status="Medium" variant="amber" />, <StatusBadge status="Final" variant="green" />],
          [<span className="text-white">FINRA Annual Compliance</span>, "Regulatory", "Corporate", "Internal", "Dec 31", <StatusBadge status="Low" variant="default" />, <StatusBadge status="On Track" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   9. NEST SUITE
   ══════════════════════════════════════════════════════════════════════ */

export function CSuitePage() {
  return (
    <PageShell eyebrow="NEST SUITE" title="ORCA C-Suite Management" subtitle="AI agent roster, pod status, dispatch log, and matriarch orchestration view.">
      <MetricGrid metrics={[
        { label: "Active Agents", value: "15", tone: C.cyan },
        { label: "Pods Running", value: "6", tone: C.green },
        { label: "Tasks (24h)", value: "342", tone: C.gold },
        { label: "Success Rate", value: "98.4%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Agent", "Role", "Pod", "Tasks (24h)", "Latency", "Status"]}
        rows={[
          [<span className="text-white">Vector</span>, "Call/Put Timing", "Trading", "48", "142ms", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Morgan</span>, "Memo & Content", "Content", "24", "2.4s", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Maxwell</span>, "Credit Analysis", "Underwriting", "36", "1.8s", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Sterling</span>, "Investor Placement", "Capital Markets", "18", "890ms", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Merlin</span>, "M&A Intelligence", "IB", "42", "2.1s", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Aria</span>, "Client BD", "Business Dev", "56", "780ms", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Quantum</span>, "HFT Optimizer", "Trading", "186", "12ms", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Sentinel</span>, "Risk Assessment", "Compliance", "28", "1.2s", <StatusBadge status="Active" variant="green" />],
        ]}
      />
    </PageShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   10. NEST LABS
   ══════════════════════════════════════════════════════════════════════ */

export function TechStackPage() {
  return (
    <PageShell eyebrow="NEST LABS" title="Tech Stack & API Subscriptions" subtitle="Service inventory, subscription status, monthly costs, and API health monitoring.">
      <MetricGrid metrics={[
        { label: "Active Services", value: "18", tone: C.green },
        { label: "Monthly Cost", value: "$4,842", tone: C.gold },
        { label: "Trial Services", value: "3", tone: C.cyan },
        { label: "API Uptime", value: "99.7%", tone: C.violet },
      ]} />
      <DataTable
        headers={["Service", "Category", "Plan", "Monthly Cost", "Status", "Usage"]}
        rows={[
          [<span className="text-white">Anthropic Claude API</span>, "AI/ML", "Enterprise", <span className="text-amber-200">$1,200</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={72} className="h-1.5 w-16 inline-block" /> <span className="text-xs">72%</span></>],
          [<span className="text-white">Apollo.io</span>, "Sales Intel", "Professional", <span className="text-amber-200">$399</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={84} className="h-1.5 w-16 inline-block" /> <span className="text-xs">84%</span></>],
          [<span className="text-white">ATTOM Data</span>, "Property Data", "Enterprise", <span className="text-amber-200">$850</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={56} className="h-1.5 w-16 inline-block" /> <span className="text-xs">56%</span></>],
          [<span className="text-white">Trepp</span>, "CMBS Analytics", "Professional", <span className="text-amber-200">$1,200</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={42} className="h-1.5 w-16 inline-block" /> <span className="text-xs">42%</span></>],
          [<span className="text-white">NewsAPI</span>, "Market Intel", "Business", <span className="text-amber-200">$149</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={91} className="h-1.5 w-16 inline-block" /> <span className="text-xs">91%</span></>],
          [<span className="text-white">Instantly.ai</span>, "Email Outreach", "Growth", <span className="text-amber-200">$97</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={68} className="h-1.5 w-16 inline-block" /> <span className="text-xs">68%</span></>],
          [<span className="text-white">Mapbox</span>, "Mapping/Geo", "Commercial", <span className="text-amber-200">$250</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={34} className="h-1.5 w-16 inline-block" /> <span className="text-xs">34%</span></>],
          [<span className="text-white">Supabase</span>, "Database", "Pro", <span className="text-amber-200">$25</span>, <StatusBadge status="Active" variant="green" />, <><Progress value={48} className="h-1.5 w-16 inline-block" /> <span className="text-xs">48%</span></>],
        ]}
      />
    </PageShell>
  );
}

export function DataConnectorsPage() {
  return (
    <PageShell eyebrow="NEST LABS" title="Data Connectors" subtitle="External data source connections: FRED, EMMA, EDGAR, EPA, and Chrome -- sync status and record counts.">
      <MetricGrid metrics={[
        { label: "Connected Sources", value: "12", tone: C.green },
        { label: "Last Full Sync", value: "2h ago", tone: C.cyan },
        { label: "Total Records", value: "4.2M", tone: C.gold },
        { label: "Sync Errors (24h)", value: "0", tone: C.violet },
      ]} />
      <DataTable
        headers={["Connector", "Source", "Protocol", "Last Sync", "Records", "Frequency", "Status"]}
        rows={[
          [<span className="text-white">FRED</span>, "Federal Reserve", "REST API", "32 min ago", "842K", "15min", <StatusBadge status="Connected" variant="green" />],
          [<span className="text-white">EMMA</span>, "MSRB", "REST API", "1h ago", "1.2M", "1hr", <StatusBadge status="Connected" variant="green" />],
          [<span className="text-white">EDGAR</span>, "SEC", "REST/XBRL", "2h ago", "684K", "4hr", <StatusBadge status="Connected" variant="green" />],
          [<span className="text-white">EPA Brownfields</span>, "EPA", "REST API", "6h ago", "124K", "Daily", <StatusBadge status="Connected" variant="green" />],
          [<span className="text-white">Chrome Extension</span>, "Browser", "WebSocket", "Active", "18K", "Real-time", <StatusBadge status="Active" variant="green" />],
          [<span className="text-white">Dropbox</span>, "Cloud Storage", "OAuth2", "45 min ago", "2.4K docs", "On Change", <StatusBadge status="Connected" variant="green" />],
          [<span className="text-white">ATTOM Property</span>, "ATTOM Data", "REST API", "4h ago", "1.1M", "Daily", <StatusBadge status="Connected" variant="green" />],
          [<span className="text-white">Ramp Treasury</span>, "Ramp Financial", "REST API", "15 min ago", "8.4K txns", "15min", <StatusBadge status="Connected" variant="green" />],
        ]}
      />
    </PageShell>
  );
}
