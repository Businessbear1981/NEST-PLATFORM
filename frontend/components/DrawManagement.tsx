/*
Design philosophy: Bloomberg Terminal x Spider-Verse institutional command cockpit.
Draw Management module tracks construction draws with photo evidence, permit gates, budget variance, and approval workflow.
*/
import { AlertCircle, CheckCircle2, Clock, DollarSign, FileCheck2, Image, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Draw {
  drawId: string;
  drawNumber: number;
  requestedAmount: number;
  approvedAmount: number;
  disbursedAmount: number;
  requestDate: string;
  description: string;
  status: "submitted" | "under-review" | "approved" | "rejected" | "disbursed";
  budgetedAmount: number;
  variance: number;
  photos: number;
  permitStatus: "pending" | "obtained" | "expired";
  engineerCert: boolean;
  inspectionSignOff: boolean;
}

export interface DrawManagementProps {
  dealId: string;
  draws: Draw[];
  totalBudget: number;
  totalDrawsRequested: number;
  totalDrawsApproved: number;
  remainingCapacity: number;
}

function getStatusColor(status: Draw["status"]): string {
  switch (status) {
    case "disbursed":
      return "text-emerald-400";
    case "approved":
      return "text-[#C4A048]";
    case "under-review":
      return "text-yellow-400";
    case "submitted":
      return "text-[#7A9A82]";
    case "rejected":
      return "text-red-400";
    default:
      return "text-[#7A9A82]";
  }
}

function getVarianceClass(variance: number): string {
  if (variance > 0) return "text-red-400"; // Over budget
  if (variance < 0) return "text-emerald-400"; // Under budget
  return "text-[#7A9A82]"; // On budget
}

export default function DrawManagement({
  dealId,
  draws,
  totalBudget,
  totalDrawsRequested,
  totalDrawsApproved,
  remainingCapacity,
}: DrawManagementProps) {
  const totalVariance = draws.reduce((sum, d) => sum + d.variance, 0);
  const contingencyBurn = ((totalDrawsRequested - totalBudget) / totalBudget) * 100;

  return (
    <div className="draw-management-shell space-y-6">
      {/* Header Metrics */}
      <div className="draw-metrics-grid">
        <Card className="draw-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Total Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#C4A048]">${(totalDrawsRequested / 1_000_000).toFixed(1)}M</p>
                <p className="text-xs text-[#7A9A82] mt-1">{draws.length} draws</p>
              </div>
              <DollarSign size={20} className="text-[#C4A048] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="draw-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Approved / Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-400">${(totalDrawsApproved / 1_000_000).toFixed(1)}M</p>
                <p className="text-xs text-[#7A9A82] mt-1">
                  {draws.filter((d) => d.status === "disbursed").length} disbursed
                </p>
              </div>
              <CheckCircle2 size={20} className="text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="draw-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Remaining Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl font-bold ${remainingCapacity > 0 ? "text-[#EDE8DC]" : "text-red-400"}`}>
                  ${(remainingCapacity / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-[#7A9A82] mt-1">{((remainingCapacity / totalBudget) * 100).toFixed(0)}% left</p>
              </div>
              <TrendingDown size={20} className={remainingCapacity > 0 ? "text-[#7A9A82] opacity-50" : "text-red-400 opacity-50"} />
            </div>
          </CardContent>
        </Card>

        <Card className="draw-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Contingency Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl font-bold ${contingencyBurn > 50 ? "text-red-400" : contingencyBurn > 25 ? "text-yellow-400" : "text-emerald-400"}`}>
                  {contingencyBurn.toFixed(0)}%
                </p>
                <p className="text-xs text-[#7A9A82] mt-1">of budget consumed</p>
              </div>
              <AlertCircle size={20} className={contingencyBurn > 50 ? "text-red-400 opacity-50" : "text-[#7A9A82] opacity-50"} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Chart */}
      <Card className="draw-budget-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono">Budget vs Actual by Draw</CardTitle>
          <CardDescription>Variance tracking across all draws</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {draws.slice(0, 5).map((draw) => (
              <div key={draw.drawId} className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#7A9A82] w-16">Draw {draw.drawNumber}</span>
                <div className="flex-1 h-6 bg-[#0D2218] rounded border border-[#1E4A2E] overflow-hidden relative">
                  {/* Budgeted bar */}
                  <div
                    className="absolute h-full bg-[#2D6B3D] opacity-40"
                    style={{ width: `${(draw.budgetedAmount / Math.max(draw.budgetedAmount, draw.approvedAmount)) * 100}%` }}
                  />
                  {/* Actual bar */}
                  <div
                    className={`absolute h-full ${draw.variance > 0 ? "bg-red-500" : "bg-emerald-500"} opacity-60`}
                    style={{ width: `${(draw.approvedAmount / Math.max(draw.budgetedAmount, draw.approvedAmount)) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-mono ${getVarianceClass(draw.variance)}`}>
                  {draw.variance > 0 ? "+" : ""}{draw.variance > 0 ? "$" : "-$"}
                  {Math.abs(draw.variance / 1000).toFixed(0)}K
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Draw Request Table */}
      <Card className="draw-table-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono">Draw Requests & Approvals</CardTitle>
          <CardDescription>All draws with status, evidence, and approval gates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1E4A2E] hover:bg-transparent">
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Draw</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Requested</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Status</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Photos</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Permit</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Engineer</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Inspection</TableHead>
                  <TableHead className="text-xs font-mono text-[#7A9A82]">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => (
                  <TableRow key={draw.drawId} className="border-[#1E4A2E] hover:bg-[#030A06]/50">
                    <TableCell className="text-xs font-mono text-[#EDE8DC]">#{draw.drawNumber}</TableCell>
                    <TableCell className="text-xs font-mono text-[#C4A048]">${(draw.requestedAmount / 1000).toFixed(0)}K</TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono ${getStatusColor(draw.status)}`}>{draw.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Image size={14} className="text-[#7A9A82]" />
                        <span className="text-xs text-[#7A9A82]">{draw.photos}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono ${draw.permitStatus === "obtained" ? "text-emerald-400" : "text-yellow-400"}`}>
                        {draw.permitStatus === "obtained" ? "✓" : "⏳"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs ${draw.engineerCert ? "text-emerald-400" : "text-[#7A9A82]"}`}>
                        {draw.engineerCert ? "✓" : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs ${draw.inspectionSignOff ? "text-emerald-400" : "text-[#7A9A82]"}`}>
                        {draw.inspectionSignOff ? "✓" : "—"}
                      </span>
                    </TableCell>
                    <TableCell className={`text-xs font-mono ${getVarianceClass(draw.variance)}`}>
                      {draw.variance > 0 ? "+" : ""}{draw.variance > 0 ? "$" : "-$"}
                      {Math.abs(draw.variance / 1000).toFixed(0)}K
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approval Gate Panel */}
      <Card className="draw-approval-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Draws awaiting underwriter sign-off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {draws
              .filter((d) => d.status === "under-review" || d.status === "submitted")
              .map((draw) => (
                <div key={draw.drawId} className="p-3 border border-[#1E4A2E] rounded bg-[#030A06]/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-mono text-[#EDE8DC]">Draw #{draw.drawNumber}</p>
                      <p className="text-xs text-[#7A9A82]">{draw.description}</p>
                    </div>
                    <span className="text-sm font-mono text-[#C4A048]">${(draw.requestedAmount / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className={draw.photos > 0 ? "text-emerald-400" : "text-red-400"}>
                      {draw.photos > 0 ? "✓ Photos" : "✗ No photos"}
                    </span>
                    <span className={draw.permitStatus === "obtained" ? "text-emerald-400" : "text-yellow-400"}>
                      {draw.permitStatus === "obtained" ? "✓ Permit" : "⏳ Permit pending"}
                    </span>
                    <span className={draw.engineerCert ? "text-emerald-400" : "text-red-400"}>
                      {draw.engineerCert ? "✓ Engineer cert" : "✗ Cert missing"}
                    </span>
                  </div>
                </div>
              ))}
            {draws.filter((d) => d.status === "under-review" || d.status === "submitted").length === 0 && (
              <p className="text-xs text-[#7A9A82] italic">No pending approvals</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
