import { Activity, Bot, BrainCircuit, CheckCircle2, Radar, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const agentChartConfig = {
  signal: { label: "Signal", color: "#22d3ee" },
  governed: { label: "Governed", color: "#fbbf24" },
  active: { label: "Active", color: "#34d399" },
} satisfies ChartConfig;

const ringColors = ["#22d3ee", "#fbbf24", "#34d399", "#f472b6"];

export function AgentTelemetryGraphic({
  activeDeals,
  pendingApprovals,
  targetCount,
}: {
  activeDeals: number;
  pendingApprovals: number;
  targetCount: number;
}) {
  const totalSignals = activeDeals + pendingApprovals + targetCount;
  const activityData = [
    { lane: "Vector", signal: Math.max(activeDeals, 1), governed: Math.max(pendingApprovals, 1) },
    { lane: "Merlin", signal: Math.max(targetCount, 1), governed: Math.max(Math.round(targetCount / 2), 1) },
    { lane: "Sterling", signal: Math.max(activeDeals + targetCount, 1), governed: Math.max(pendingApprovals + 1, 1) },
    { lane: "Sentinel", signal: Math.max(pendingApprovals + activeDeals, 1), governed: Math.max(pendingApprovals, 1) },
  ];
  const ringData = [
    { name: "Deals", value: Math.max(activeDeals, 1) },
    { name: "Approvals", value: Math.max(pendingApprovals, 1) },
    { name: "M&A", value: Math.max(targetCount, 1) },
    { name: "Controls", value: Math.max(totalSignals, 1) },
  ];

  const agents = [
    ["Vector", "Call / put radar", activeDeals > 0 ? "tracking" : "ready", Radar],
    ["Merlin", "M&A locator", targetCount > 0 ? "scoring" : "ready", Sparkles],
    ["Sterling", "Placement desk", activeDeals > 0 ? "routing" : "ready", Bot],
    ["Sentinel", "Approval control", pendingApprovals > 0 ? "watch" : "clear", ShieldCheck],
  ] as const;

  return (
    <div className="grid gap-5 text-[#EDE8DC] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-2xl border border-[#C4A048]/20 bg-black/35 p-4 shadow-[0_0_36px_rgba(196,160,72,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#E8C87A]">
              <BrainCircuit size={16} /> AI nervous-system telemetry
            </div>
            <p className="mt-2 text-sm leading-6 text-[#7A9A82]">Live demo signal map from backend deal, approval, and acquisition records. Agent actions remain supervised by the approval rail; no autonomous external execution is enabled.</p>
          </div>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.18)]"><span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />{totalSignals} signals</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <ChartContainer config={agentChartConfig} className="h-56 w-full">
            <AreaChart data={activityData} margin={{ left: 4, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="agentSignal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="agentGoverned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.48} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="lane" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="signal" stroke="#22d3ee" fill="url(#agentSignal)" strokeWidth={2} />
              <Area type="monotone" dataKey="governed" stroke="#fbbf24" fill="url(#agentGoverned)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <ChartContainer config={agentChartConfig} className="h-48 w-full">
              <PieChart>
                <Pie data={ringData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={4}>
                  {ringData.map((entry, index) => <Cell key={entry.name} fill={ringColors[index % ringColors.length]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
            <p className="text-center font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#7A9A82]">Governed agent load</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {agents.map(([name, role, status, Icon]) => (
          <article key={name} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_0_24px_rgba(196,160,72,0.05)]">
            <div className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#C4A048]/25 bg-[#C4A048]/10 p-2 text-[#EDE8DC]"><Icon size={17} /></div>
              <div>
                <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-white">{name}</h3>
                <p className="text-xs text-[#7A9A82]">{role}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-300/15 bg-emerald-400/5 px-3 py-2">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#7A9A82]">status</span>
              <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-emerald-100"><CheckCircle2 size={12} className="animate-pulse" /> {status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
