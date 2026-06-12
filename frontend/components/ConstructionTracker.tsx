/*
Design philosophy: Bloomberg Terminal x Spider-Verse institutional command cockpit.
Construction Tracker monitors project milestones, permits, inspections, and schedule variance.
*/
import { AlertTriangle, CheckCircle2, Clock, TrendingDown, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ConstructionMilestone {
  milestoneId: string;
  milestoneName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  percentComplete: number;
  requiredPermits: string[];
  permitsObtained: string[];
  requiredInspections: string[];
  inspectionsCompleted: string[];
  isCriticalPath: boolean;
  daysAhead: number;
  budgetedCost: number;
  actualCost: number;
  variance: number;
}

export interface ConstructionTrackerProps {
  dealId: string;
  milestones: ConstructionMilestone[];
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<ConstructionMilestone>) => void;
}

function getScheduleStatus(daysAhead: number): { color: string; label: string } {
  if (daysAhead > 0) return { color: "text-emerald-400", label: "Ahead" };
  if (daysAhead === 0) return { color: "text-[#7A9A82]", label: "On track" };
  if (daysAhead > -10) return { color: "text-yellow-400", label: "Slightly behind" };
  return { color: "text-red-400", label: "Behind schedule" };
}

function getVarianceClass(variance: number): string {
  if (variance > 0) return "text-red-400"; // Over budget
  if (variance < 0) return "text-emerald-400"; // Under budget
  return "text-[#7A9A82]"; // On budget
}

export default function ConstructionTracker({
  dealId,
  milestones,
  onMilestoneUpdate,
}: ConstructionTrackerProps) {
  const totalProgress = (milestones.reduce((sum, m) => sum + m.percentComplete, 0) / milestones.length).toFixed(0);
  const criticalPathMilestones = milestones.filter((m) => m.isCriticalPath);
  const behindSchedule = milestones.filter((m) => m.daysAhead < -5).length;
  const totalBudgetVariance = milestones.reduce((sum, m) => sum + m.variance, 0);
  const permitGaps = milestones.filter((m) => m.permitsObtained.length < m.requiredPermits.length);
  const inspectionGaps = milestones.filter((m) => m.inspectionsCompleted.length < m.requiredInspections.length);

  return (
    <div className="construction-tracker-shell space-y-6">
      {/* Project Progress Metrics */}
      <div className="construction-metrics-grid">
        <Card className="construction-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-[#C4A048]">{totalProgress}%</p>
                <p className="text-xs text-[#7A9A82] mt-1">
                  {milestones.filter((m) => m.percentComplete === 100).length} / {milestones.length} complete
                </p>
              </div>
              <Zap size={24} className="text-[#C4A048] opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="construction-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Schedule Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${behindSchedule === 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {behindSchedule === 0 ? "On track" : `${behindSchedule} behind`}
                </p>
                <p className="text-xs text-[#7A9A82] mt-1">Critical path: {criticalPathMilestones.length} milestones</p>
              </div>
              <Clock size={24} className={behindSchedule === 0 ? "text-emerald-400 opacity-50" : "text-red-400 opacity-50"} />
            </div>
          </CardContent>
        </Card>

        <Card className="construction-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Budget Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl font-bold ${totalBudgetVariance > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {totalBudgetVariance > 0 ? "+" : ""}{totalBudgetVariance > 0 ? "$" : "-$"}
                  {Math.abs(totalBudgetVariance / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-[#7A9A82] mt-1">{totalBudgetVariance > 0 ? "Over" : "Under"} budget</p>
              </div>
              <TrendingDown size={24} className={totalBudgetVariance > 0 ? "text-red-400 opacity-50" : "text-emerald-400 opacity-50"} />
            </div>
          </CardContent>
        </Card>

        <Card className="construction-metric-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono text-[#EDE8DC]">Permit / Inspection Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl font-bold ${permitGaps.length === 0 && inspectionGaps.length === 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {permitGaps.length + inspectionGaps.length}
                </p>
                <p className="text-xs text-[#7A9A82] mt-1">
                  {permitGaps.length} permits, {inspectionGaps.length} inspections
                </p>
              </div>
              <AlertTriangle size={24} className={permitGaps.length === 0 && inspectionGaps.length === 0 ? "text-emerald-400 opacity-50" : "text-red-400 opacity-50"} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Gantt-style Progress */}
      <Card className="construction-gantt-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono">Milestone Progress Timeline</CardTitle>
          <CardDescription>Visual progress and schedule status for each milestone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const scheduleStatus = getScheduleStatus(milestone.daysAhead);
              return (
                <div key={milestone.milestoneId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-mono text-[#EDE8DC]">{milestone.milestoneName}</p>
                      <p className="text-xs text-[#7A9A82]">
                        {new Date(milestone.plannedStartDate).toLocaleDateString()} —{" "}
                        {new Date(milestone.plannedEndDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-[#C4A048]">{milestone.percentComplete}%</p>
                      <p className={`text-xs font-mono ${scheduleStatus.color}`}>
                        {milestone.daysAhead > 0 ? "+" : ""}{milestone.daysAhead}d {scheduleStatus.label}
                      </p>
                    </div>
                  </div>
                  <div className="h-6 bg-[#0D2218] rounded border border-[#1E4A2E] overflow-hidden relative">
                    <div className="absolute h-full bg-cyan-500 opacity-60" style={{ width: `${milestone.percentComplete}%` }} />
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className={milestone.isCriticalPath ? "text-red-400 font-mono" : "text-[#7A9A82]"}>
                      {milestone.isCriticalPath ? "🔴 Critical" : "○ Non-critical"}
                    </span>
                    <span className="text-[#7A9A82]">
                      Budget: ${(milestone.budgetedCost / 1_000_000).toFixed(1)}M
                    </span>
                    <span className={getVarianceClass(milestone.variance)}>
                      {milestone.variance > 0 ? "+" : ""}{milestone.variance > 0 ? "$" : "-$"}
                      {Math.abs(milestone.variance / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permit Tracker */}
      <Card className="construction-permit-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono">Permit Status</CardTitle>
          <CardDescription>Required permits and current status by milestone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const permitProgress = (milestone.permitsObtained.length / milestone.requiredPermits.length) * 100;
              return (
                <div key={milestone.milestoneId} className="p-3 border border-[#1E4A2E] rounded bg-[#030A06]/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-[#EDE8DC]">{milestone.milestoneName}</span>
                    <span className={`text-xs font-mono ${permitProgress === 100 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {milestone.permitsObtained.length} / {milestone.requiredPermits.length}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0D2218] rounded overflow-hidden">
                    <div
                      className={`h-full ${permitProgress === 100 ? "bg-emerald-500" : "bg-yellow-500"}`}
                      style={{ width: `${permitProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#7A9A82] mt-2">
                    {milestone.requiredPermits.map((p) => (
                      <span key={p} className={milestone.permitsObtained.includes(p) ? "text-emerald-400" : "text-[#7A9A82]"}>
                        {milestone.permitsObtained.includes(p) ? "✓" : "○"} {p} {" "}
                      </span>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inspection Checklist */}
      <Card className="construction-inspection-card">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Inspection Sign-Offs
          </CardTitle>
          <CardDescription>Required inspections and completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const inspectionProgress = (milestone.inspectionsCompleted.length / milestone.requiredInspections.length) * 100;
              return (
                <div key={milestone.milestoneId} className="p-3 border border-[#1E4A2E] rounded bg-[#030A06]/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-[#EDE8DC]">{milestone.milestoneName}</span>
                    <span className={`text-xs font-mono ${inspectionProgress === 100 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {milestone.inspectionsCompleted.length} / {milestone.requiredInspections.length}
                    </span>
                  </div>
                  <div className="h-2 bg-[#0D2218] rounded overflow-hidden">
                    <div
                      className={`h-full ${inspectionProgress === 100 ? "bg-emerald-500" : "bg-yellow-500"}`}
                      style={{ width: `${inspectionProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#7A9A82] mt-2">
                    {milestone.requiredInspections.map((i) => (
                      <span key={i} className={milestone.inspectionsCompleted.includes(i) ? "text-emerald-400" : "text-[#7A9A82]"}>
                        {milestone.inspectionsCompleted.includes(i) ? "✓" : "○"} {i} {" "}
                      </span>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Path Alert */}
      {criticalPathMilestones.some((m) => m.daysAhead < 0) && (
        <Card className="construction-alert-card border-red-900/50 bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-red-400 flex items-center gap-2">
              <AlertTriangle size={16} />
              Critical Path Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-400">
              {criticalPathMilestones.filter((m) => m.daysAhead < 0).length} critical milestone{criticalPathMilestones.filter((m) => m.daysAhead < 0).length > 1 ? "s" : ""} behind schedule. Delays may impact project completion and debt-service coverage.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
