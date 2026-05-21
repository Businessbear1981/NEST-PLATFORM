import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentEvents } from '@shared/agentDemo';

interface AgentEventStreamProps {
  dealId: string;
  limit?: number;
}

const SEVERITY_COLORS = {
  info: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  warning: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-700 border-red-500/30',
  success: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
};

const SEVERITY_ICONS = {
  info: <Info className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  success: <CheckCircle2 className="w-4 h-4" />,
};

export function AgentEventStream({ dealId, limit = 15 }: AgentEventStreamProps) {
  const events = getRecentEvents(dealId, limit);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Event Stream</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time agent activity and system events
        </p>
      </div>

      {/* Events Timeline */}
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  SEVERITY_COLORS[event.severity].split(' ')[0]
                }`}
              >
                {SEVERITY_ICONS[event.severity]}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 bg-border my-1" />
              )}
            </div>

            {/* Event Card */}
            <Card
              className={`flex-1 p-4 border-2 ${SEVERITY_COLORS[event.severity]}`}
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{event.message}</h4>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                      >
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.agentName} • {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Data */}
                {event.data && (
                  <div className="pt-2 border-t border-current/20">
                    <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto text-foreground max-h-32">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="font-mono">{event.id}</span>
                  <span>{event.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Load More */}
      {events.length >= limit && (
        <button className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30">
          Load More Events
        </button>
      )}
    </div>
  );
}
