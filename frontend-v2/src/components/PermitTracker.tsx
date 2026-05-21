import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_PERMITS, type PermitStatus } from '@shared/rootsDemo';

interface PermitTrackerProps {
  dealId: string;
}

const STATUS_COLORS: Record<PermitStatus, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-cyan-500/20 text-cyan-700',
  approved: 'bg-emerald-500/20 text-emerald-700',
  denied: 'bg-red-500/20 text-red-700',
  expired: 'bg-yellow-500/20 text-yellow-700',
};

const STATUS_ICONS: Record<PermitStatus, React.ReactNode> = {
  not_started: <Clock className="w-4 h-4" />,
  in_progress: <Clock className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  denied: <AlertCircle className="w-4 h-4" />,
  expired: <AlertCircle className="w-4 h-4" />,
};

export function PermitTracker({ dealId }: PermitTrackerProps) {
  const permits = DEMO_PERMITS.filter((permit) => permit.dealId === dealId);

  const blockingPermits = permits.filter((p) => p.isBlocking);
  const completedPermits = permits.filter((p) => p.status === 'approved');
  const inProgressPermits = permits.filter((p) => p.status === 'in_progress');

  const getDeadlineStatus = (deadline?: Date) => {
    if (!deadline) return null;
    const daysUntil = Math.ceil(
      (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (daysUntil < 14) return { text: `${daysUntil} days`, color: 'text-yellow-600' };
    return { text: `${daysUntil} days`, color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Permits</p>
          <p className="text-2xl font-bold text-foreground">{permits.length}</p>
        </Card>
        <Card className="p-4 border-border bg-emerald-500/5">
          <p className="text-xs text-emerald-700 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-600">{completedPermits.length}</p>
        </Card>
        <Card className="p-4 border-border bg-cyan-500/5">
          <p className="text-xs text-cyan-700 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-cyan-600">{inProgressPermits.length}</p>
        </Card>
        <Card className="p-4 border-border bg-red-500/5">
          <p className="text-xs text-red-700 mb-1">Blocking</p>
          <p className="text-2xl font-bold text-red-600">{blockingPermits.length}</p>
        </Card>
      </div>

      {/* Critical Blocking Permits */}
      {blockingPermits.length > 0 && (
        <Card className="p-4 border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700 mb-2">Blocking Permits</h3>
              <p className="text-sm text-red-700/80 mb-3">
                These permits must be approved before proceeding:
              </p>
              <div className="space-y-2">
                {blockingPermits.map((permit) => (
                  <div key={permit.id} className="text-sm text-red-700/80">
                    • <span className="font-medium">{permit.type}</span> from {permit.issuer}
                    {permit.status !== 'approved' && permit.deadline && (
                      <span className={`ml-2 ${getDeadlineStatus(permit.deadline)?.color}`}>
                        ({getDeadlineStatus(permit.deadline)?.text})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Permits List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">All Permits</h3>
        {permits.map((permit) => (
          <Card key={permit.id} className="p-4 border-border hover:bg-accent/50 transition-colors">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground capitalize">
                      {permit.type.replace('_', ' ')} Permit
                    </h4>
                    <Badge className={STATUS_COLORS[permit.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[permit.status]}
                        {permit.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    {permit.isBlocking && (
                      <Badge className="bg-red-500/20 text-red-700">Blocking</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{permit.issuer}</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {permit.issuedDate && (
                  <div>
                    <p className="text-muted-foreground">Issued</p>
                    <p className="font-medium text-foreground">
                      {permit.issuedDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
                {permit.deadline && (
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p
                      className={`font-medium ${
                        getDeadlineStatus(permit.deadline)?.color || 'text-foreground'
                      }`}
                    >
                      {permit.deadline.toLocaleDateString()}
                    </p>
                  </div>
                )}
                {permit.expiryDate && (
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium text-foreground">
                      {permit.expiryDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Required vs Collected Documents */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Required Documents</p>
                  <ul className="space-y-1">
                    {permit.requiredDocuments.map((doc, i) => {
                      const isCollected = permit.collectedDocuments.includes(doc);
                      return (
                        <li
                          key={i}
                          className={`text-xs flex items-center gap-2 ${
                            isCollected ? 'text-emerald-600' : 'text-muted-foreground'
                          }`}
                        >
                          {isCollected ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {doc}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Collected ({permit.collectedDocuments.length}/{permit.requiredDocuments.length})
                  </p>
                  <div className="space-y-1">
                    {permit.collectedDocuments.length > 0 ? (
                      permit.collectedDocuments.map((doc, i) => (
                        <p key={i} className="text-xs text-emerald-600 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          {doc}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No documents collected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {permit.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{permit.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
