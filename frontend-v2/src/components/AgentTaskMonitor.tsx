import { Play, Pause, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getAgentTasks, getRunningTasks } from '@shared/agentDemo';

interface AgentTaskMonitorProps {
  dealId: string;
}

const STATUS_COLORS = {
  idle: 'bg-slate-500/20 text-slate-700',
  running: 'bg-blue-500/20 text-blue-700',
  completed: 'bg-emerald-500/20 text-emerald-700',
  error: 'bg-red-500/20 text-red-700',
  paused: 'bg-yellow-500/20 text-yellow-700',
};

const STATUS_ICONS = {
  idle: <Clock className="w-4 h-4" />,
  running: <Zap className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  paused: <Pause className="w-4 h-4" />,
};

export function AgentTaskMonitor({ dealId }: AgentTaskMonitorProps) {
  const allTasks = getAgentTasks(dealId);
  const runningTasks = getRunningTasks(dealId);
  const completedTasks = allTasks.filter((t) => t.status === 'completed');
  const errorTasks = allTasks.filter((t) => t.status === 'error');

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agent Task Monitor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {runningTasks.length} running • {completedTasks.length} completed • {errorTasks.length} errors
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-foreground">{allTasks.length}</p>
        </Card>
        <Card className="p-4 border-border bg-blue-500/5">
          <p className="text-xs text-blue-700 mb-1">Running</p>
          <p className="text-2xl font-bold text-blue-600">{runningTasks.length}</p>
        </Card>
        <Card className="p-4 border-border bg-emerald-500/5">
          <p className="text-xs text-emerald-700 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
        </Card>
        <Card className="p-4 border-border bg-red-500/5">
          <p className="text-xs text-red-700 mb-1">Errors</p>
          <p className="text-2xl font-bold text-red-600">{errorTasks.length}</p>
        </Card>
      </div>

      {/* Running Tasks */}
      {runningTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Active Tasks</h3>
          {runningTasks.map((task) => (
            <Card key={task.id} className="p-4 border-border bg-blue-500/5">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{task.description}</h4>
                      <Badge className={STATUS_COLORS[task.status]}>
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[task.status]}
                          {task.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.agentName} • {task.type}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    {task.status === 'running' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Progress</p>
                    <span className="text-sm font-semibold text-foreground">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium text-foreground">
                      {task.startedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Remaining</p>
                    <p className="font-medium text-foreground">
                      {formatTimeRemaining(task.estimatedTimeRemaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Task ID</p>
                    <p className="font-mono text-foreground text-xs">{task.id}</p>
                  </div>
                </div>

                {/* Input/Output Preview */}
                {task.input && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
                    <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto text-foreground">
                      {JSON.stringify(task.input, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Completed</h3>
          {completedTasks.slice(0, 3).map((task) => (
            <Card key={task.id} className="p-4 border-border bg-emerald-500/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{task.description}</h4>
                    <Badge className={STATUS_COLORS[task.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[task.status]}
                        {task.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.agentName} • Completed{' '}
                    {task.completedAt?.toLocaleTimeString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Results
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error Tasks */}
      {errorTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Errors</h3>
          {errorTasks.map((task) => (
            <Card key={task.id} className="p-4 border-red-500/30 bg-red-500/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{task.description}</h4>
                    <Badge className={STATUS_COLORS[task.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[task.status]}
                        {task.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 font-medium">{task.error}</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600">
                  Retry
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
