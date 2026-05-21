/*
Design philosophy: Bloomberg Terminal x Spider-Verse institutional command cockpit.
Covenant Dashboard tracks financial and operational compliance with auto-calculated metrics and variance alerts.
*/
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Covenant {
  covenantId: string;
  name: string;
  type: "financial" | "operational" | "reporting";
  threshold: number;
  currentValue: number;
  frequency: "monthly" | "quarterly" | "annual";
  status: "compliant" | "warning" | "breach";
  lastChecked: string;
  nextCheck: string;
  unit: string;
}

export interface CovenantDashboardProps {
  dealId: string;
  covenants: Covenant[];
  dscr: number;
  reserves: number;
  occupancy: number;
  insurance: boolean;
}

function getStatusIcon(status: Covenant["status"]) {
  switch (status) {
    case "compliant":
      return <CheckCircle2 size={16} className="text-emerald-400" />;
    case "warning":
      return <AlertTriangle size={16} className="text-yellow-400" />;
    case "breach":
      return <XCircle size={16} className="text-red-400" />;
  }
}

function getStatusColor(status: Covenant["status"]): string {
  switch (status) {
    case "compliant":
      return "text-emerald-400";
    case "warning":
      return "text-yellow-400";
    case "breach":
      return "text-red-400";
  }
}

function getVarianceArrow(current: number, threshold: number, isInverse: boolean = false) {
  const isMet = isInverse ? current <= threshold : current >= threshold;
  if (isMet) return <TrendingUp size={14} className="text-emerald-400" />;
  return <TrendingDown size={14} className="text-red-400" />;
}

export default function CovenantDashboard({
  dealId,
  covenants,
  dscr,
  reserves,
  occupancy,
  insurance,
}: CovenantDashboardProps) {
  const complianceRate = ((covenants.filter((c) => c.status === "compliant").length / covenants.length) * 100).toFixed(0);
  const breachCount = covenants.filter((c) => c.status === "breach").length;
  const warningCount = covenants.filter((c) => c.status === "warning").length;

  return (
    <div className="covenant-dashboard-shell space-y-6">
      {/* Compliance Score Header */}
      <div className="covenant-score-grid">
        <Card className="covenant-score-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-slate-300">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${complianceRate === "100" ? "text-emerald-400" : complianceRate === "100" ? "text-yellow-400" : "text-red-400"}`}>
                  {complianceRate}%
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {covenants.filter((c) => c.status === "compliant").length} / {covenants.length} covenants
                </p>
              </div>
              <CheckCircle2 size={24} className={complianceRate === "100" ? "text-emerald-400 opacity-50" : "text-yellow-400 opacity-50"} />
            </div>
          </CardContent>
        </Card>

        <Card className="covenant-score-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-slate-300">Debt Service Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${dscr >= 1.2 ? "text-emerald-400" : dscr >= 1.0 ? "text-yellow-400" : "text-red-400"}`}>
                  {dscr.toFixed(2)}x
                </p>
                <p className="text-xs text-slate-500 mt-1">Min threshold: 1.20x</p>
              </div>
              {getVarianceArrow(dscr, 1.2)}
            </div>
          </CardContent>
        </Card>

        <Card className="covenant-score-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-slate-300">Reserve Fund Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${reserves >= 0.5 ? "text-emerald-400" : reserves >= 0.25 ? "text-yellow-400" : "text-red-400"}`}>
                  {(reserves * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">of annual debt service</p>
              </div>
              {getVarianceArrow(reserves, 0.5)}
            </div>
          </CardContent>
        </Card>

        <Card className="covenant-score-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-slate-300">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${occupancy >= 0.85 ? "text-emerald-400" : occupancy >= 0.75 ? "text-yellow-400" : "text-red-400"}`}>
                  {(occupancy * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Target: 85%+</p>
              </div>
              {getVarianceArrow(occupancy, 0.85)}
            </div>
          </CardContent>
        </Card>

        <Card className="covenant-score-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-slate-300">Insurance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${insurance ? "text-emerald-400" : "text-red-400"}`}>{insurance ? "Active" : "Lapsed"}</p>
                <p className="text-xs text-slate-500 mt-1">General liability + property</p>
              </div>
              {insurance ? <CheckCircle2 size={24} className="text-emerald-400 opacity-50" /> : <XCircle size={24} className="text-red-400 opacity-50" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exception Alerts */}
      {(breachCount > 0 || warningCount > 0) && (
        <Card className="covenant-alert-card border-red-900/50 bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-red-400 flex items-center gap-2">
              <AlertTriangle size={16} />
              Active Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {breachCount > 0 && (
                <p className="text-xs text-red-400">
                  <strong>{breachCount} covenant breach{breachCount > 1 ? "es" : ""}</strong> — Immediate action required
                </p>
              )}
              {warningCount > 0 && (
                <p className="text-xs text-yellow-400">
                  <strong>{warningCount} warning{warningCount > 1 ? "s" : ""}</strong> — Monitor closely for next reporting period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Covenant Table */}
      <Card className="covenant-table-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono">Covenant Compliance Matrix</CardTitle>
          <CardDescription>All financial and operational covenants with current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-xs font-mono text-slate-400">Covenant</TableHead>
                  <TableHead className="text-xs font-mono text-slate-400">Type</TableHead>
                  <TableHead className="text-xs font-mono text-slate-400">Threshold</TableHead>
                  <TableHead className="text-xs font-mono text-slate-400">Current</TableHead>
                  <TableHead className="text-xs font-mono text-slate-400">Status</TableHead>
                  <TableHead className="text-xs font-mono text-slate-400">Last Check</TableHead>
                  <TableHead className="text-xs font-mono text-slate-400">Next Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {covenants.map((covenant) => (
                  <TableRow key={covenant.covenantId} className="border-slate-700 hover:bg-slate-900/50">
                    <TableCell className="text-xs font-mono text-slate-300">{covenant.name}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">{covenant.type}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">
                      {covenant.threshold}
                      {covenant.unit}
                    </TableCell>
                    <TableCell className={`text-xs font-mono font-bold ${getStatusColor(covenant.status)}`}>
                      {covenant.currentValue}
                      {covenant.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(covenant.status)}
                        <span className={`text-xs font-mono ${getStatusColor(covenant.status)}`}>{covenant.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(covenant.lastChecked).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(covenant.nextCheck).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reporting Schedule */}
      <Card className="covenant-reporting-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono">Reporting Schedule</CardTitle>
          <CardDescription>Upcoming covenant reports and submission deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-slate-700 rounded bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-slate-300">Monthly Financial Report</span>
                <span className="text-xs text-yellow-400">Due in 5 days</span>
              </div>
              <p className="text-xs text-slate-500">DSCR, occupancy, debt service, reserve levels</p>
            </div>
            <div className="p-3 border border-slate-700 rounded bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-slate-300">Quarterly Investor Update</span>
                <span className="text-xs text-slate-400">Due in 18 days</span>
              </div>
              <p className="text-xs text-slate-500">Construction progress, tenant status, market context</p>
            </div>
            <div className="p-3 border border-slate-700 rounded bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-slate-300">Annual Rating Agency Report</span>
                <span className="text-xs text-slate-400">Due in 42 days</span>
              </div>
              <p className="text-xs text-slate-500">Full covenant compliance, risk factors, credit memo update</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
