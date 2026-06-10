import { Activity, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEMO_AGENT_METRICS, getSystemHealth } from '@shared/agentDemo';

interface AgentHealthDashboardProps {
  dealId: string;
}

const HEALTH_COLORS = {
  healthy: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  degraded: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  offline: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const HEALTH_ICONS = {
  healthy: <CheckCircle2 className="w-4 h-4" />,
  degraded: <AlertCircle className="w-4 h-4" />,
  offline: <AlertCircle className="w-4 h-4" />,
};

export function AgentHealthDashboard({ dealId }: AgentHealthDashboardProps) {
  const metrics = Object.values(DEMO_AGENT_METRICS);
  const systemHealth = getSystemHealth(dealId);
  const healthyAgents = metrics.filter((m) => m.health === 'healthy').length;
  const degradedAgents = metrics.filter((m) => m.health === 'degraded').length;
  const totalTasks = metrics.reduce((sum, m) => sum + m.tasksCompleted, 0);
  const avgErrorRate = (
    metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agent Health Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          System status and agent performance metrics
        </p>
      </div>

      {/* System Health Alert */}
      <Card
        className={`p-4 border-2 ${
          systemHealth === 'operational'
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : systemHealth === 'warning'
              ? 'border-yellow-500/30 bg-yellow-500/5'
              : 'border-red-500/30 bg-red-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              systemHealth === 'operational'
                ? 'bg-emerald-600'
                : systemHealth === 'warning'
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
            }`}
          />
          <div>
            <p className="font-semibold text-foreground capitalize">
              System Status: {systemHealth}
            </p>
            <p className="text-sm text-muted-foreground">
              {healthyAgents} healthy • {degradedAgents} degraded
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground mb-1">Active Agents</p>
          <p className="text-2xl font-bold text-foreground">{metrics.length}</p>
        </Card>
        <Card className="p-4 border-border bg-emerald-500/5">
          <p className="text-xs text-emerald-700 mb-1">Healthy</p>
          <p className="text-2xl font-bold text-emerald-600">{healthyAgents}</p>
        </Card>
        <Card className="p-4 border-border bg-yellow-500/5">
          <p className="text-xs text-yellow-700 mb-1">Degraded</p>
          <p className="text-2xl font-bold text-yellow-600">{degradedAgents}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground mb-1">Avg Error Rate</p>
          <p className="text-2xl font-bold text-foreground">{avgErrorRate}%</p>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Agent Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <Card
              key={metric.agentName}
              className={`p-4 border-2 ${HEALTH_COLORS[metric.health]}`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{metric.agentName}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {metric.health}
                    </Badge>
                  </div>
                  {HEALTH_ICONS[metric.health]}
                </div>

                {/* Metrics */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks Completed</span>
                    <span className="font-semibold text-foreground">
                      {metric.tasksCompleted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold text-foreground">
                      {metric.tasksInProgress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Rate</span>
                    <span className={`font-semibold ${
                      metric.errorRate > 3
                        ? 'text-red-600'
                        : metric.errorRate > 1
                          ? 'text-yellow-600'
                          : 'text-emerald-600'
                    }`}>
                      {metric.errorRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Time</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(metric.avgCompletionTime / 60)}m
                    </span>
                  </div>
                </div>

                {/* Error Rate Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Error Rate</span>
                    <span className="text-xs font-semibold text-foreground">
                      {metric.errorRate}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(metric.errorRate * 10, 100)}
                    className="h-1.5"
                  />
                </div>

                {/* Last Activity */}
                <div className="pt-2 border-t border-current/20">
                  <p className="text-xs text-muted-foreground">
                    Last active:{' '}
                    {metric.lastActivityAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Ranking */}
      <Card className="p-4 border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Ranking</h3>
        <div className="space-y-2">
          {[...metrics]
            .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
            .map((metric, index) => (
              <div
                key={metric.agentName}
                className="flex items-center justify-between p-2 rounded hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {metric.agentName}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{metric.tasksCompleted} tasks</span>
                  <span>{metric.errorRate}% errors</span>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
