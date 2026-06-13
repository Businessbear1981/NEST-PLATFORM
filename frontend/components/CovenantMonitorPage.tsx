"use client";
const _API = process.env.NEXT_PUBLIC_API_URL || "";
/**
 * Covenant Monitor Page — fetches /api/covenants/ + /api/covenants/:id
 * Renders compliance table, reserve status, debt service metrics.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const $ = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1e3).toFixed(0)}K`;

const statusBadge = (s: string) => {
  if (s === "PASSING" || s === "FUNDED" || s === "COMPLIANT")
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  if (s === "WARNING")
    return "border-yellow-400/40 bg-yellow-400/10 text-yellow-200";
  return "border-red-400/40 bg-red-400/10 text-red-200";
};

export default function CovenantMonitorPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${_API}/api/covenants/`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          setPackages(d.data);
          setSelected(d.data[0]);
        } else {
          setErr(d.error || "No covenant packages found");
        }
      })
      .catch(() => setErr("Cannot reach Covenant API"))
      .finally(() => setLoading(false));
  }, []);

  const selectPackage = (pkg: any) => {
    setSelected(pkg);
    // Fetch full detail if needed
    fetch(`${_API}/api/covenants/${pkg.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSelected(d.data); })
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded-[1.8rem] bg-[#0D2218]" />
        <div className="h-64 rounded-xl bg-[#0D2218]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-[#C4A048]/25 bg-[#060E1A] p-5 text-[#EDE8DC] shadow-[0_0_85px_rgba(196,160,72,0.09)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(196,160,72,0.12),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.78),rgba(2,6,23,0.96))]" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#C4A048]">Covenant Monitor · Sentinel Agent</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Covenant Command
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EDE8DC]">
              Real-time covenant compliance tracking across all administered bond issues. DSCR, distribution traps, reserve funding, and rate covenants — every threshold monitored, every breach flagged.
            </p>
          </div>
          {selected && (
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                ["Status", selected.overall_status, selected.risk_level + " risk"],
                ["DSCR", `${selected.covenants?.dscr_current}x`, `min ${selected.covenants?.dscr_threshold}x`],
                ["Next Test", selected.next_test_date?.slice(0, 10), selected.test_frequency],
              ].map(([label, value, sub]) => (
                <div key={label as string} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <p className="font-mono text-[0.58rem] uppercase tracking-wider text-[#7A9A82]">{label}</p>
                  <p className={`mt-1 text-lg font-black ${label === "Status" && value !== "COMPLIANT" ? "text-red-400" : "text-[#C4A048]"}`}>{value}</p>
                  <p className="text-[0.58rem] text-[#7A9A82]">{sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {err && (
        <Card className="border-red-500/20 bg-[#0D2218]">
          <CardContent className="p-4 text-sm text-red-400">{err}</CardContent>
        </Card>
      )}

      {/* Package selector if multiple */}
      {packages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {packages.map(pkg => (
            <button
              key={pkg.id}
              onClick={() => selectPackage(pkg)}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider transition ${
                selected?.id === pkg.id
                  ? "border-[#C4A048]/60 bg-[#C4A048]/15 text-[#C4A048]"
                  : "border-white/10 bg-white/[0.03] text-[#7A9A82] hover:border-white/20"
              }`}
            >
              {pkg.deal_name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          {/* Deal header */}
          <Card className="border-[#1E4A2E] bg-[#0D2218]">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{selected.deal_name}</p>
                  <p className="font-mono text-[0.65rem] text-[#7A9A82]">
                    {selected.cusip} · {selected.series} · {selected.issuer}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[#C4A048]">{$(selected.par_amount)} par</span>
                  <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.58rem] uppercase ${statusBadge(selected.overall_status)}`}>
                    {selected.overall_status}
                  </span>
                  {selected.watchlist && (
                    <span className="rounded-full border border-red-400/40 bg-red-400/10 px-2 py-0.5 font-mono text-[0.58rem] uppercase text-red-200">
                      Watchlist
                    </span>
                  )}
                </div>
              </div>
              {selected.notes && (
                <p className="mt-3 text-xs text-[#7A9A82] border-t border-white/5 pt-3">{selected.notes}</p>
              )}
            </CardContent>
          </Card>

          {/* Compliance table */}
          <Card className="border-[#1E4A2E] bg-[#0D2218]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-[#C4A048]">
                Compliance Items — {selected.last_test_date} (Q last)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Covenant</th>
                      <th className="px-4 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Threshold</th>
                      <th className="px-4 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Current</th>
                      <th className="px-4 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Cushion</th>
                      <th className="px-4 py-2 text-left font-mono text-[0.6rem] uppercase tracking-wider text-[#7A9A82]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.compliance_items || []).map((item: any, i: number) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3 text-[#EDE8DC] font-medium">{item.covenant}</td>
                        <td className="px-4 py-3 font-mono text-[0.72rem] text-[#7A9A82]">{item.threshold}</td>
                        <td className="px-4 py-3 font-mono text-[0.72rem] text-white">{item.current}</td>
                        <td className="px-4 py-3 font-mono text-[0.72rem]">
                          {item.cushion_pct != null ? (
                            <span className={item.cushion_pct > 10 ? "text-emerald-400" : item.cushion_pct > 0 ? "text-yellow-400" : "text-[#7A9A82]"}>
                              +{item.cushion_pct}%
                            </span>
                          ) : <span className="text-[#7A9A82]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.56rem] uppercase ${statusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Reserves + Debt Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[#1E4A2E] bg-[#0D2218]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-[#7A9A82]">Reserve Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {selected.reserves && Object.entries({
                  "DSRF Required":   selected.reserves.dsrf_required,
                  "DSRF Actual":     selected.reserves.dsrf_actual,
                  "Operating Rsv":   selected.reserves.operating_reserve,
                  "Cap-I Reserve":   selected.reserves.cap_i_reserve,
                  "R&R Reserve":     selected.reserves.repair_replacement_reserve,
                }).map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#7A9A82]">{label}</span>
                    <span className="font-mono text-[#C4A048]">{$(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-[#7A9A82]">DSRF Funded</span>
                  <span className={`font-mono ${selected.reserves?.dsrf_funded_pct >= 100 ? "text-emerald-400" : "text-red-400"}`}>
                    {selected.reserves?.dsrf_funded_pct}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#1E4A2E] bg-[#0D2218]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-[#7A9A82]">Debt Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {selected.debt_service && Object.entries({
                  "Annual Principal": selected.debt_service.annual_principal,
                  "Annual Interest":  selected.debt_service.annual_interest,
                  "Total Annual DS":  selected.debt_service.total_annual_ds,
                  "NOI (TTM)":        selected.debt_service.noi_ttm,
                }).map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#7A9A82]">{label}</span>
                    <span className="font-mono text-[#C4A048]">{$(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-[#7A9A82]">DSCR (TTM)</span>
                  <span className={`font-mono font-bold ${(selected.debt_service?.dscr_ttm || 0) >= 1.5 ? "text-emerald-400" : "text-yellow-400"}`}>
                    {selected.debt_service?.dscr_ttm}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A9A82]">Next Payment</span>
                  <span className="font-mono text-[#EDE8DC]">
                    {$(selected.debt_service?.next_payment_amount || 0)} · {selected.debt_service?.next_payment_date}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
