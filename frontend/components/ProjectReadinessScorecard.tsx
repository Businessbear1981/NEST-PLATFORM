import { AlertCircle, CheckCircle2, Clock, Lock } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEMO_READINESS_SCORECARD, type ProjectReadinessScorecard } from '@shared/rootsDemo';

interface ProjectReadinessScorecardProps {
  dealId: string;
}

const STATUS_ICONS = {
  complete: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  in_progress: <Clock className="w-4 h-4 text-cyan-500" />,
  not_started: <Clock className="w-4 h-4 text-muted-foreground" />,
  blocked: <Lock className="w-4 h-4 text-red-500" />,
};

const STATUS_COLORS = {
  complete: 'bg-emerald-500/10 text-emerald-700',
  in_progress: 'bg-[#C4A048]/10 text-cyan-700',
  not_started: 'bg-muted text-muted-foreground',
  blocked: 'bg-red-500/10 text-red-700',
};

export function ProjectReadinessScorecard({ dealId }: ProjectReadinessScorecardProps) {
  const scorecard: ProjectReadinessScorecard = DEMO_READINESS_SCORECARD;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-cyan-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 60) return 'bg-[#C4A048]/10';
    if (score >= 40) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 border-border bg-gradient-to-br from-background to-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Project Readiness</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {scorecard.lastUpdated.toLocaleDateString()}
            </p>
          </div>
          <div
            className={`text-center p-6 rounded-lg ${getScoreBg(scorecard.overallScore)}`}
          >
            <div className={`text-4xl font-bold ${getScoreColor(scorecard.overallScore)}`}>
              {scorecard.overallScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
          </div>
        </div>
        <Progress value={scorecard.overallScore} className="h-2" />
      </Card>

      {/* Risks & Blockers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scorecard.risks.length > 0 && (
          <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-700 mb-2">Risks</h3>
                <ul className="space-y-1 text-sm text-yellow-700/80">
                  {scorecard.risks.map((risk, i) => (
                    <li key={i}>• {risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {scorecard.blockers.length > 0 && (
          <Card className="p-4 border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-700 mb-2">Blockers</h3>
                <ul className="space-y-1 text-sm text-red-700/80">
                  {scorecard.blockers.map((blocker, i) => (
                    <li key={i}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Readiness by Category</h3>
        {scorecard.categories.map((category) => (
          <Card key={category.name} className="p-4 border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Weight: {category.weight}% • {category.items.filter((i) => i.status === 'complete').length}/
                    {category.items.length} items complete
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{category.completion}%</div>
                </div>
              </div>
              <Progress value={category.completion} className="h-2" />

              {/* Category Items */}
              <div className="space-y-2 mt-4 pl-4 border-l border-border">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5">{STATUS_ICONS[item.status]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{item.name}</span>
                        <Badge className={`text-xs ${STATUS_COLORS[item.status]}`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {item.owner && <p>Owner: {item.owner}</p>}
                        {item.dueDate && (
                          <p>
                            Due: {item.dueDate.toLocaleDateString()}
                            {item.dueDate < new Date() && (
                              <span className="text-red-500 ml-1">(Overdue)</span>
                            )}
                          </p>
                        )}
                        {item.blockedBy && item.blockedBy.length > 0 && (
                          <p className="text-red-600">
                            Blocked by: {item.blockedBy.join(', ')}
                          </p>
                        )}
                        {item.linkedDocuments.length > 0 && (
                          <p className="text-cyan-600">
                            {item.linkedDocuments.length} document(s) linked
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
