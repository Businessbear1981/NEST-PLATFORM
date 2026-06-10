import React from 'react';
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getUnderwritingGaps, getCriticalGaps, getGapCompletionRate, type GapSeverity } from '@shared/suretyDemo';

interface UnderwritingGapsPanelProps {
  dealId: string;
}

const SEVERITY_COLORS: Record<GapSeverity, string> = {
  critical: 'bg-red-500/20 text-red-700 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  info: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
};

const SEVERITY_ICONS: Record<GapSeverity, React.ReactNode> = {
  critical: <AlertCircle className="w-4 h-4" />,
  high: <AlertCircle className="w-4 h-4" />,
  medium: <AlertCircle className="w-4 h-4" />,
  low: <FileText className="w-4 h-4" />,
  info: <FileText className="w-4 h-4" />,
};

export function UnderwritingGapsPanel({ dealId }: UnderwritingGapsPanelProps) {
  const gaps = getUnderwritingGaps(dealId);
  const criticalGaps = getCriticalGaps(dealId);
  const completionRate = getGapCompletionRate(dealId);

  const gapsByCategory = gaps.reduce(
    (acc, gap) => {
      if (!acc[gap.category]) acc[gap.category] = [];
      acc[gap.category].push(gap);
      return acc;
    },
    {} as Record<string, typeof gaps>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Underwriting Gaps</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {gaps.length} gaps identified • {criticalGaps.length} critical • {completionRate}% complete
        </p>
      </div>

      {/* Critical Alert */}
      {criticalGaps.length > 0 && (
        <Card className="p-4 border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700 mb-2">Critical Gaps</h3>
              <p className="text-sm text-red-700/80 mb-3">
                These items must be resolved before surety submission:
              </p>
              <ul className="space-y-1">
                {criticalGaps.map((gap) => (
                  <li key={gap.id} className="text-sm text-red-700/80">
                    • <span className="font-medium">{gap.description}</span>
                    {gap.dueDate && (
                      <span className="text-red-600 ml-2">
                        (Due: {gap.dueDate.toLocaleDateString()})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Completion Progress */}
      <Card className="p-4 border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-foreground">Evidence Collection Progress</p>
          <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </Card>

      {/* Gaps by Category */}
      <div className="space-y-4">
        {Object.entries(gapsByCategory).map(([category, categoryGaps]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{category}</h3>
            {categoryGaps.map((gap) => {
              const completionPercent = Math.round(
                (gap.collectedEvidence.length / gap.requiredEvidence.length) * 100
              );
              const isOverdue = gap.dueDate && new Date() > gap.dueDate;

              return (
                <Card
                  key={gap.id}
                  className={`p-4 border-2 ${SEVERITY_COLORS[gap.severity]}`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">{SEVERITY_ICONS[gap.severity]}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">{gap.description}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {gap.severity}
                            </Badge>
                            {gap.owner && (
                              <span className="text-xs text-muted-foreground">Owner: {gap.owner}</span>
                            )}
                            {isOverdue && (
                              <Badge className="bg-red-500/20 text-red-700 text-xs">Overdue</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>

                    {/* Evidence Collection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Evidence Collection</p>
                        <span className="text-xs text-muted-foreground">
                          {gap.collectedEvidence.length}/{gap.requiredEvidence.length}
                        </span>
                      </div>
                      <Progress value={completionPercent} className="h-1.5" />
                    </div>

                    {/* Required vs Collected */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">Required</p>
                        <ul className="space-y-1">
                          {gap.requiredEvidence.map((item, i) => {
                            const isCollected = gap.collectedEvidence.includes(item);
                            return (
                              <li
                                key={i}
                                className={`flex items-center gap-1 ${
                                  isCollected ? 'text-emerald-600' : 'text-muted-foreground'
                                }`}
                              >
                                {isCollected ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <FileText className="w-3 h-3" />
                                )}
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium mb-1">Collected</p>
                        {gap.collectedEvidence.length > 0 ? (
                          <ul className="space-y-1">
                            {gap.collectedEvidence.map((item, i) => (
                              <li key={i} className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground italic text-xs">None collected</p>
                        )}
                      </div>
                    </div>

                    {/* Remediation Steps */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Remediation Steps</p>
                      <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                        {gap.remediationSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Due Date */}
                    {gap.dueDate && (
                      <div className="pt-2 border-t border-current/20">
                        <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                          Due: {gap.dueDate.toLocaleDateString()}
                          {isOverdue && <span className="ml-1">(Overdue)</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
