"use client";
import { useEffect, useState } from "react";
import {
  Banknote,
  CreditCard,
  DollarSign,
  FileCheck2,
  Landmark,
  LineChart,
  Receipt,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ── Types (mirrors Ramp API schema from treasury_engine.py) ─────────

interface Transaction {
  id: string;
  card_id: string;
  merchant_name: string;
  merchant_category_code: string;
  amount: number;
  currency: string;
  state: string;
  receipts: { id: string; receipt_url: string }[];
  memo: string;
  category: { id: string; name: string };
  created_at: string;
  settled_at: string | null;
}

interface VirtualCard {
  id: string;
  display_name: string;
  last_four: string;
  state: string;
  spending_restrictions: { amount: number; interval: string };
  total_spent: number;
  available_balance: number;
}

interface BudgetLine {
  category_id: string;
  category_name: string;
  budgeted: number;
  drawn: number;
  spent: number;
  remaining: number;
  variance_pct: number;
  status: string;
}

interface PrefundEvent {
  id: string;
  draw_id: string;
  amount: number;
  funded_at: string;
  status: string;
}

interface Reconciliation {
  prefund_id: string;
  draw_id: string;
  draw_amount: number;
  matched_spend: number;
  unreconciled: number;
  transaction_count: number;
  status: string;
}

interface Rebate {
  rate: number;
  total_eligible_spend: number;
  accrued: number;
  realized: number;
  projected_36mo: number;
}

interface NestSoftCosts {
  line_items: { vendor: string; category: string; amount: number; date: string }[];
  total_fronted: number;
  rebate_earned: number;
  reimbursement_status: string;
}

interface Portfolio {
  active_deals: number;
  total_managed_spend: number;
  total_rebate_accrued: number;
  nest_soft_cost_rebate: number;
  combined_rebate: number;
  traditional_savings: {
    manual_reconciliation_hours_eliminated: number;
    estimated_labor_savings: number;
    misallocation_risk_reduction: string;
  };
}

interface Overview {
  total_budget: number;
  total_loaded: number;
  total_spent: number;
  available_balance: number;
  active_cards: number;
  total_transactions: number;
  rebate_accrued: number;
  receipt_match_rate: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

const API = (process.env.NEXT_PUBLIC_API_URL || "https://api.ardanedgecapital.com") + "/api/treasury";

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

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Tab = "pcard" | "budget" | "softcosts" | "economics";

// ── Main Component ───────────────────────────────────────────────────

export function TreasuryDesk({ dealId }: { dealId: string }) {
  const [tab, setTab] = useState<Tab>("pcard");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [prefunds, setPrefunds] = useState<PrefundEvent[]>([]);
  const [recon, setRecon] = useState<Reconciliation[]>([]);
  const [rebate, setRebate] = useState<Rebate | null>(null);
  const [nestCosts, setNestCosts] = useState<NestSoftCosts | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData<Overview>(`/${dealId}/overview`).then(setOverview),
      fetchData<Transaction[]>(`/${dealId}/transactions`).then((d) => setTransactions(d ?? [])),
      fetchData<VirtualCard[]>(`/${dealId}/cards`).then((d) => setCards(d ?? [])),
      fetchData<BudgetLine[]>(`/${dealId}/budget`).then((d) => setBudgetLines(d ?? [])),
      fetchData<PrefundEvent[]>(`/${dealId}/draws`).then((d) => setPrefunds(d ?? [])),
      fetchData<Reconciliation[]>(`/${dealId}/reconciliation`).then((d) => setRecon(d ?? [])),
      fetchData<Rebate>(`/${dealId}/rebate`).then(setRebate),
      fetchData<NestSoftCosts>("/nest/soft-costs").then(setNestCosts),
      fetchData<Portfolio>("/portfolio").then(setPortfolio),
    ]).finally(() => setLoading(false));
  }, [dealId]);

  const tabs: { id: Tab; label: string; icon: typeof CreditCard }[] = [
    { id: "pcard", label: "Ramp Program", icon: CreditCard },
    { id: "budget", label: "Budget & Recon", icon: LineChart },
    { id: "softcosts", label: "NEST Soft Costs", icon: Receipt },
    { id: "economics", label: "Economics", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-amber-200" />
        <span className="font-mono text-sm text-[#7A9A82]">Loading treasury data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Overview Metrics ─────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Escrow Prefunded", value: money(overview?.total_loaded ?? 0), icon: Wallet, tone: "text-[#E8C87A] border-[#C4A048]/30 bg-[#C4A048]/8" },
          { label: "Auto-Pay Disbursed", value: money(overview?.total_spent ?? 0), icon: DollarSign, tone: "text-amber-200 border-amber-300/35 bg-amber-300/9" },
          { label: "Active Cards", value: String(overview?.active_cards ?? 0), icon: CreditCard, tone: "text-emerald-200 border-emerald-300/30 bg-emerald-400/8" },
          { label: "1.5% Rebate", value: money(overview?.rebate_accrued ?? 0), icon: Banknote, tone: "text-fuchsia-200 border-fuchsia-300/30 bg-fuchsia-500/8" },
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
                ? "bg-amber-300/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.12)]"
                : "text-[#7A9A82] hover:bg-white/5 hover:text-[#EDE8DC]"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      {tab === "pcard" && (
        <div className="space-y-5">
          {/* Prefund Timeline */}
          <Card className="border-[#C4A048]/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#E8C87A]">
                <Landmark className="mr-2 inline h-4 w-4" />
                Draw → Prefund Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {prefunds.map((pf) => (
                  <div key={pf.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <span className="font-mono text-xs text-[#7A9A82]">{pf.draw_id}</span>
                      <p className="font-mono text-sm text-white">{money(pf.amount)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100 text-[0.58rem]">
                        {pf.status}
                      </Badge>
                      <p className="mt-1 font-mono text-[0.6rem] text-[#7A9A82]">{shortDate(pf.funded_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Virtual Cards Grid */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <CreditCard className="mr-2 inline h-4 w-4" />
                Virtual Cards ({cards.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                  const utilization = card.total_spent / (card.spending_restrictions.amount || 1);
                  return (
                    <div key={card.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-[0.72rem] font-semibold text-white">{card.display_name}</p>
                          <p className="font-mono text-[0.58rem] text-[#7A9A82]">•••• {card.last_four}</p>
                        </div>
                        <Badge variant="outline" className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100 text-[0.54rem]">
                          {card.state}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between font-mono text-[0.6rem] text-[#7A9A82]">
                          <span>Spent: {money(card.total_spent)}</span>
                          <span>Limit: {money(card.spending_restrictions.amount)}</span>
                        </div>
                        <Progress value={utilization * 100} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Feed */}
          <Card className="border-white/10 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EDE8DC]">
                Recent Transactions ({transactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1E4A2E] hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Date</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Vendor</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Category</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Amount</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Status</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 25).map((txn) => (
                    <TableRow key={txn.id} className="border-[#0D2218] hover:bg-[#030A06]/50">
                      <TableCell className="font-mono text-xs text-[#7A9A82]">{shortDate(txn.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs text-white">{txn.merchant_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-[0.54rem] text-[#EDE8DC]">
                          {txn.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(txn.amount)}</TableCell>
                      <TableCell>
                        <span className={`font-mono text-[0.6rem] ${txn.state === "CLEARED" ? "text-emerald-400" : "text-yellow-400"}`}>
                          {txn.state}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono text-[0.6rem] ${txn.receipts.length ? "text-emerald-400" : "text-red-400"}`}>
                          {txn.receipts.length ? "✓" : "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "budget" && (
        <div className="space-y-5">
          {/* Budget Allocation Table */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <LineChart className="mr-2 inline h-4 w-4" />
                Budget Allocation vs. Actual Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1E4A2E] hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Category</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Budgeted</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Drawn</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Spent</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Remaining</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetLines.map((line) => (
                    <TableRow key={line.category_id} className="border-[#0D2218] hover:bg-[#030A06]/50">
                      <TableCell className="font-mono text-xs text-white">{line.category_name}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#EDE8DC]">{money(line.budgeted)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#C4A048]">{money(line.drawn)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(line.spent)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-[#7A9A82]">{money(line.remaining)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[0.54rem] ${
                            line.status === "red"
                              ? "border-red-400/30 bg-red-500/10 text-red-200"
                              : line.status === "amber"
                                ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                                : "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                          }`}
                        >
                          {line.status === "red" ? `+${line.variance_pct}%` : line.status === "amber" ? `+${line.variance_pct}%` : "On track"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Reconciliation */}
          <Card className="border-[#C4A048]/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#E8C87A]">
                <ShieldCheck className="mr-2 inline h-4 w-4" />
                Draw ↔ Spend Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recon.map((r) => (
                  <div key={r.prefund_id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="font-mono text-xs text-[#7A9A82]">{r.draw_id}</p>
                      <p className="font-mono text-sm text-white">Draw: {money(r.draw_amount)}</p>
                      <p className="font-mono text-[0.6rem] text-[#7A9A82]">{r.transaction_count} transactions matched</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-amber-200">Matched: {money(r.matched_spend)}</p>
                      <p className={`font-mono text-[0.6rem] ${Math.abs(r.unreconciled) < 50_000 ? "text-emerald-400" : "text-red-400"}`}>
                        Unreconciled: {money(Math.abs(r.unreconciled))}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-[0.54rem] ${
                          r.status === "reconciled"
                            ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                            : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "softcosts" && nestCosts && (
        <div className="space-y-5">
          {/* NEST Soft Cost Summary */}
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.25rem] border border-amber-300/35 bg-amber-300/9 p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">Total Fronted</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{money(nestCosts.total_fronted)}</strong>
            </article>
            <article className="rounded-[1.25rem] border border-fuchsia-300/30 bg-fuchsia-500/8 p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">Rebate Earned</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{money(nestCosts.rebate_earned)}</strong>
            </article>
            <article className="rounded-[1.25rem] border border-[#C4A048]/30 bg-[#C4A048]/8 p-4">
              <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">Reimbursement</span>
              <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white capitalize">{nestCosts.reimbursement_status}</strong>
            </article>
          </div>

          {/* Line Items */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <Receipt className="mr-2 inline h-4 w-4" />
                NEST Pre-Close Soft Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1E4A2E] hover:bg-transparent">
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Date</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Vendor</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82]">Category</TableHead>
                    <TableHead className="font-mono text-[0.6rem] text-[#7A9A82] text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nestCosts.line_items.map((item, i) => (
                    <TableRow key={`nest-${i}`} className="border-[#0D2218] hover:bg-[#030A06]/50">
                      <TableCell className="font-mono text-xs text-[#7A9A82]">{shortDate(item.date)}</TableCell>
                      <TableCell className="font-mono text-xs text-white">{item.vendor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-[0.54rem] text-[#EDE8DC]">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-amber-200">{money(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "economics" && portfolio && rebate && (
        <div className="space-y-5">
          {/* Rebate Dashboard */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Rebate Rate", value: pct(rebate.rate), tone: "border-amber-300/35 bg-amber-300/9 text-amber-200" },
              { label: "Accrued (this deal)", value: money(rebate.accrued), tone: "border-fuchsia-300/30 bg-fuchsia-500/8 text-fuchsia-200" },
              { label: "Realized", value: money(rebate.realized), tone: "border-emerald-300/30 bg-emerald-400/8 text-emerald-200" },
              { label: "Projected (36mo)", value: money(rebate.projected_36mo), tone: "border-[#C4A048]/30 bg-[#C4A048]/8 text-[#E8C87A]" },
            ].map((m) => (
              <article key={m.label} className={`rounded-[1.25rem] border p-4 ${m.tone}`}>
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#7A9A82]">{m.label}</span>
                <strong className="mt-2 block font-mono text-2xl font-semibold tracking-[-0.03em] text-white">{m.value}</strong>
              </article>
            ))}
          </div>

          {/* Portfolio Economics */}
          <Card className="border-amber-300/20 bg-[#07101a]/88">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-[0.1em] text-amber-200">
                <TrendingUp className="mr-2 inline h-4 w-4" />
                Portfolio Treasury Economics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="font-mono text-[0.6rem] text-[#7A9A82]">Active Deals</span>
                    <p className="font-mono text-xl text-white">{portfolio.active_deals}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="font-mono text-[0.6rem] text-[#7A9A82]">Total Managed Spend</span>
                    <p className="font-mono text-xl text-amber-200">{money(portfolio.total_managed_spend)}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <span className="font-mono text-[0.6rem] text-[#7A9A82]">Combined Rebate (all deals + NEST)</span>
                    <p className="font-mono text-xl text-fuchsia-200">{money(portfolio.combined_rebate)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/5 p-4">
                    <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                      <FileCheck2 className="mr-1 inline h-3.5 w-3.5" /> Cost Savings vs Traditional
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A9A82]">Manual recon hours eliminated</span>
                        <span className="font-mono text-emerald-300">{portfolio.traditional_savings.manual_reconciliation_hours_eliminated.toLocaleString()} hrs</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A9A82]">Estimated labor savings</span>
                        <span className="font-mono text-emerald-300">{money(portfolio.traditional_savings.estimated_labor_savings)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A9A82]">Auto-categorized</span>
                        <span className="font-mono text-emerald-300">{portfolio.traditional_savings.misallocation_risk_reduction}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-4">
                    <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-amber-200">
                      Compliance Score
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A9A82]">Receipt match rate</span>
                        <span className="font-mono text-amber-300">{pct(overview?.receipt_match_rate ?? 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A9A82]">Budget categories on track</span>
                        <span className="font-mono text-amber-300">{budgetLines.filter((b) => b.status === "green").length}/{budgetLines.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TreasuryDesk;
