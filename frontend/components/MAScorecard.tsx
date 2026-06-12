/*
M&A Scorecard Desk: Financial health, scalability, IPO readiness, growth strategy, and benchmark modeling.
This is a working operational desk for PE/family office M&A analysis.
*/
import { TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface MATarget {
  targetId: string;
  companyName: string;
  sector: string;
  lastUpdated: string;
  financialHealth: {
    score: number;
    revenue: number;
    ebitda: number;
    debt: number;
    leverage: number;
    trend: "up" | "down" | "flat";
  };
  scalability: {
    score: number;
    marketSize: number;
    cagr: number;
    unitEconomics: number;
    operatingLeverage: number;
    trend: "up" | "down" | "flat";
  };
  ipoReadiness: {
    score: number;
    profitability: boolean;
    marketCap: number;
    publicComps: number;
    regulatoryStatus: string;
    trend: "up" | "down" | "flat";
  };
  growthStrategy: {
    score: number;
    organicGrowth: number;
    inorganicOpportunities: number;
    marketExpansion: number;
    productExpansion: number;
    trend: "up" | "down" | "flat";
  };
  benchmarks: {
    peerAvgRevenue: number;
    peerAvgEbitda: number;
    peerAvgMultiple: number;
    peerAvgLeverage: number;
    marketLeader: string;
  };
  overallScore: number;
  recommendation: "buy" | "hold" | "pass";
}

interface MAScoreboardProps {
  targets: MATarget[];
}

function ScoreIndicator({ score, maxScore = 100 }: { score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  let color = "bg-red-500";
  if (percentage >= 70) color = "bg-emerald-500";
  else if (percentage >= 50) color = "bg-yellow-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-[#1E4A2E] rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-sm font-mono text-[#EDE8DC]">{score}</span>
    </div>
  );
}

function TrendBadge({ trend }: { trend: "up" | "down" | "flat" }) {
  const colors = {
    up: "text-emerald-400",
    down: "text-red-400",
    flat: "text-[#7A9A82]",
  };
  const symbols = { up: "↑", down: "↓", flat: "→" };

  return <span className={`text-xs font-mono ${colors[trend]}`}>{symbols[trend]}</span>;
}

export function MAScorecard({ targets }: MAScoreboardProps) {
  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono">M&A Scorecard Portfolio</CardTitle>
          <CardDescription>Financial health, scalability, IPO readiness, and growth modeling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-[#1E4A2E] rounded p-3">
              <p className="text-xs text-[#7A9A82] mb-1">Targets Under Review</p>
              <p className="text-2xl font-bold text-[#C4A048]">{targets.length}</p>
            </div>
            <div className="border border-[#1E4A2E] rounded p-3">
              <p className="text-xs text-[#7A9A82] mb-1">Avg Financial Health</p>
              <p className="text-2xl font-bold text-[#EDE8DC]">
                {(targets.reduce((sum, t) => sum + t.financialHealth.score, 0) / targets.length).toFixed(0)}
              </p>
            </div>
            <div className="border border-[#1E4A2E] rounded p-3">
              <p className="text-xs text-[#7A9A82] mb-1">Avg Scalability</p>
              <p className="text-2xl font-bold text-[#EDE8DC]">
                {(targets.reduce((sum, t) => sum + t.scalability.score, 0) / targets.length).toFixed(0)}
              </p>
            </div>
            <div className="border border-[#1E4A2E] rounded p-3">
              <p className="text-xs text-[#7A9A82] mb-1">Avg IPO Readiness</p>
              <p className="text-2xl font-bold text-[#EDE8DC]">
                {(targets.reduce((sum, t) => sum + t.ipoReadiness.score, 0) / targets.length).toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Scorecards */}
      <div className="space-y-4">
        {targets.map((target) => (
          <Card key={target.targetId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-mono">{target.companyName}</CardTitle>
                  <CardDescription>{target.sector}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {target.recommendation === "buy" && <CheckCircle2 size={18} className="text-emerald-400" />}
                  {target.recommendation === "hold" && <AlertCircle size={18} className="text-yellow-400" />}
                  {target.recommendation === "pass" && <XCircle size={18} className="text-red-400" />}
                  <span className="text-xs font-mono text-[#7A9A82]">{target.lastUpdated}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Financial Health */}
              <div className="border-t border-[#1E4A2E] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-[#EDE8DC]">Financial Health</span>
                  <TrendBadge trend={target.financialHealth.trend} />
                </div>
                <ScoreIndicator score={target.financialHealth.score} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <p className="text-[#7A9A82]">Revenue</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.financialHealth.revenue / 1_000_000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">EBITDA</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.financialHealth.ebitda / 1_000_000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Leverage</p>
                    <p className="font-mono text-[#EDE8DC]">{target.financialHealth.leverage.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Debt</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.financialHealth.debt / 1_000_000).toFixed(1)}M</p>
                  </div>
                </div>
              </div>

              {/* Scalability */}
              <div className="border-t border-[#1E4A2E] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-[#EDE8DC]">Scalability</span>
                  <TrendBadge trend={target.scalability.trend} />
                </div>
                <ScoreIndicator score={target.scalability.score} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <p className="text-[#7A9A82]">Market Size</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.scalability.marketSize / 1_000_000_000).toFixed(1)}B</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">CAGR</p>
                    <p className="font-mono text-[#EDE8DC]">{target.scalability.cagr.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Unit Economics</p>
                    <p className="font-mono text-[#EDE8DC]">{target.scalability.unitEconomics.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Op Leverage</p>
                    <p className="font-mono text-[#EDE8DC]">{target.scalability.operatingLeverage.toFixed(1)}x</p>
                  </div>
                </div>
              </div>

              {/* IPO Readiness */}
              <div className="border-t border-[#1E4A2E] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-[#EDE8DC]">IPO Readiness</span>
                  <TrendBadge trend={target.ipoReadiness.trend} />
                </div>
                <ScoreIndicator score={target.ipoReadiness.score} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <p className="text-[#7A9A82]">Profitability</p>
                    <p className="font-mono text-[#EDE8DC]">{target.ipoReadiness.profitability ? "✓" : "✗"}</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Market Cap</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.ipoReadiness.marketCap / 1_000_000_000).toFixed(1)}B</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Public Comps</p>
                    <p className="font-mono text-[#EDE8DC]">{target.ipoReadiness.publicComps}</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Regulatory</p>
                    <p className="font-mono text-[#EDE8DC]">{target.ipoReadiness.regulatoryStatus}</p>
                  </div>
                </div>
              </div>

              {/* Growth Strategy */}
              <div className="border-t border-[#1E4A2E] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-[#EDE8DC]">Growth Strategy</span>
                  <TrendBadge trend={target.growthStrategy.trend} />
                </div>
                <ScoreIndicator score={target.growthStrategy.score} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                  <div>
                    <p className="text-[#7A9A82]">Organic</p>
                    <p className="font-mono text-[#EDE8DC]">{target.growthStrategy.organicGrowth.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Inorganic</p>
                    <p className="font-mono text-[#EDE8DC]">{target.growthStrategy.inorganicOpportunities.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Market Exp</p>
                    <p className="font-mono text-[#EDE8DC]">{target.growthStrategy.marketExpansion.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[#7A9A82]">Product Exp</p>
                    <p className="font-mono text-[#EDE8DC]">{target.growthStrategy.productExpansion.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Benchmarks vs Peers */}
              <div className="border-t border-[#1E4A2E] pt-4">
                <p className="text-sm font-mono text-[#EDE8DC] mb-3">Benchmark vs Peers</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className="border border-[#1E4A2E] rounded p-2">
                    <p className="text-[#7A9A82]">Peer Avg Revenue</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.benchmarks.peerAvgRevenue / 1_000_000).toFixed(1)}M</p>
                  </div>
                  <div className="border border-[#1E4A2E] rounded p-2">
                    <p className="text-[#7A9A82]">Peer Avg EBITDA</p>
                    <p className="font-mono text-[#EDE8DC]">${(target.benchmarks.peerAvgEbitda / 1_000_000).toFixed(1)}M</p>
                  </div>
                  <div className="border border-[#1E4A2E] rounded p-2">
                    <p className="text-[#7A9A82]">Peer Avg Multiple</p>
                    <p className="font-mono text-[#EDE8DC]">{target.benchmarks.peerAvgMultiple.toFixed(1)}x</p>
                  </div>
                  <div className="border border-[#1E4A2E] rounded p-2">
                    <p className="text-[#7A9A82]">Peer Avg Leverage</p>
                    <p className="font-mono text-[#EDE8DC]">{target.benchmarks.peerAvgLeverage.toFixed(2)}x</p>
                  </div>
                  <div className="border border-[#1E4A2E] rounded p-2">
                    <p className="text-[#7A9A82]">Market Leader</p>
                    <p className="font-mono text-[#EDE8DC] truncate">{target.benchmarks.marketLeader}</p>
                  </div>
                </div>
              </div>

              {/* Overall Score & Recommendation */}
              <div className="border-t border-[#1E4A2E] pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7A9A82] mb-1">Overall Score</p>
                  <ScoreIndicator score={target.overallScore} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#7A9A82] mb-1">Recommendation</p>
                  <span
                    className={`text-sm font-mono font-bold ${
                      target.recommendation === "buy"
                        ? "text-emerald-400"
                        : target.recommendation === "hold"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {target.recommendation.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
