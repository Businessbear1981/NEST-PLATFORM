/**
 * AI Agent Orchestration Demo Data
 * Live agent tasks, event streams, and operational routing
 */

export type AgentName = 'Vector' | 'Merlin' | 'Morgan' | 'Sterling' | 'Scout' | 'Architect' | 'Maxwell' | 'Sentinel';
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'paused';
export type TaskType = 'analysis' | 'extraction' | 'modeling' | 'drafting' | 'monitoring' | 'routing' | 'approval';
export type EventType = 'task_started' | 'task_completed' | 'task_failed' | 'data_extracted' | 'alert_triggered' | 'approval_needed' | 'report_ready';

export interface AgentTask {
  id: string;
  agentName: AgentName;
  type: TaskType;
  description: string;
  status: AgentStatus;
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface AgentEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  agentName: AgentName;
  taskId: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}

export interface AgentMetrics {
  agentName: AgentName;
  tasksCompleted: number;
  tasksInProgress: number;
  errorRate: number; // percentage
  avgCompletionTime: number; // seconds
  lastActivityAt: Date;
  health: 'healthy' | 'degraded' | 'offline';
}

export interface CentralNervousSystem {
  dealId: string;
  agentTasks: AgentTask[];
  recentEvents: AgentEvent[];
  agentMetrics: Record<AgentName, AgentMetrics>;
  systemHealth: 'operational' | 'warning' | 'critical';
  lastSyncAt: Date;
}

// DEMO DATA

const AGENT_NAMES: AgentName[] = [
  'Vector',
  'Merlin',
  'Morgan',
  'Sterling',
  'Scout',
  'Architect',
  'Maxwell',
  'Sentinel',
];

export const DEMO_AGENT_TASKS: AgentTask[] = [
  {
    id: 'task-001',
    agentName: 'Vector',
    type: 'analysis',
    description: 'Call/Put timing analysis for NEST portfolio bonds',
    status: 'running',
    progress: 65,
    startedAt: new Date(Date.now() - 300000),
    input: { portfolioId: 'port-001', bonds: 12, marketData: 'live' },
    estimatedTimeRemaining: 180,
  },
  {
    id: 'task-002',
    agentName: 'Merlin',
    type: 'modeling',
    description: 'M&A target universe discovery and qualification',
    status: 'running',
    progress: 42,
    startedAt: new Date(Date.now() - 600000),
    input: { sector: 'mixed-use', revenue: '50M-500M', geography: 'US' },
    estimatedTimeRemaining: 420,
  },
  {
    id: 'task-003',
    agentName: 'Morgan',
    type: 'drafting',
    description: 'Executive summary and investor update generation',
    status: 'running',
    progress: 88,
    startedAt: new Date(Date.now() - 240000),
    input: { dealId: 'deal-1', format: 'markdown', audience: 'investors' },
    estimatedTimeRemaining: 30,
  },
  {
    id: 'task-004',
    agentName: 'Sentinel',
    type: 'monitoring',
    description: 'Covenant monitoring and watchlist analysis',
    status: 'completed',
    progress: 100,
    startedAt: new Date(Date.now() - 1800000),
    completedAt: new Date(Date.now() - 1200000),
    input: { portfolioId: 'port-001', covenants: 24 },
    output: { watchlistItems: 3, alerts: 2, status: 'review_needed' },
  },
  {
    id: 'task-005',
    agentName: 'Scout',
    type: 'extraction',
    description: 'Document OCR and evidence extraction',
    status: 'completed',
    progress: 100,
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 2400000),
    input: { documents: 47, types: ['contracts', 'financials', 'insurance'] },
    output: { extracted: 45, confidence: 0.94, gaps: 2 },
  },
  {
    id: 'task-006',
    agentName: 'Architect',
    type: 'routing',
    description: 'Feasibility assessment and desk routing',
    status: 'paused',
    progress: 35,
    startedAt: new Date(Date.now() - 900000),
    input: { dealId: 'deal-1', stage: 'intake' },
    error: 'Awaiting client evidence package',
  },
  {
    id: 'task-007',
    agentName: 'Maxwell',
    type: 'modeling',
    description: 'Stress scenario modeling and sensitivity analysis',
    status: 'error',
    progress: 0,
    startedAt: new Date(Date.now() - 1200000),
    completedAt: new Date(Date.now() - 900000),
    input: { dealId: 'deal-1', scenarios: 5 },
    error: 'Missing interest rate assumptions',
  },
  {
    id: 'task-008',
    agentName: 'Sterling',
    type: 'approval',
    description: 'Investor outreach and allocation tracking',
    status: 'idle',
    progress: 0,
    startedAt: new Date(Date.now() - 600000),
    input: { dealId: 'deal-1', investors: 'pending_approval' },
  },
];

export const DEMO_AGENT_EVENTS: AgentEvent[] = [
  {
    id: 'evt-001',
    timestamp: new Date(Date.now() - 60000),
    type: 'task_started',
    agentName: 'Vector',
    taskId: 'task-001',
    message: 'Vector started call/put timing analysis',
    severity: 'info',
  },
  {
    id: 'evt-002',
    timestamp: new Date(Date.now() - 120000),
    type: 'data_extracted',
    agentName: 'Scout',
    taskId: 'task-005',
    message: 'Scout extracted 45 of 47 documents with 94% confidence',
    severity: 'success',
    data: { extracted: 45, total: 47, confidence: 0.94 },
  },
  {
    id: 'evt-003',
    timestamp: new Date(Date.now() - 180000),
    type: 'alert_triggered',
    agentName: 'Sentinel',
    taskId: 'task-004',
    message: 'Sentinel detected 2 covenant violations in portfolio',
    severity: 'warning',
    data: { violations: 2, bonds: ['NEST-A', 'NEST-C'] },
  },
  {
    id: 'evt-004',
    timestamp: new Date(Date.now() - 240000),
    type: 'task_failed',
    agentName: 'Maxwell',
    taskId: 'task-007',
    message: 'Maxwell modeling failed: missing interest rate assumptions',
    severity: 'error',
    data: { reason: 'missing_input', requiredFields: ['rate_curve', 'spreads'] },
  },
  {
    id: 'evt-005',
    timestamp: new Date(Date.now() - 300000),
    type: 'approval_needed',
    agentName: 'Architect',
    taskId: 'task-006',
    message: 'Architect routing paused: awaiting client evidence package',
    severity: 'warning',
    data: { stage: 'intake', blockedBy: 'evidence_package' },
  },
  {
    id: 'evt-006',
    timestamp: new Date(Date.now() - 360000),
    type: 'task_started',
    agentName: 'Merlin',
    taskId: 'task-002',
    message: 'Merlin started M&A target discovery',
    severity: 'info',
  },
  {
    id: 'evt-007',
    timestamp: new Date(Date.now() - 420000),
    type: 'task_started',
    agentName: 'Morgan',
    taskId: 'task-003',
    message: 'Morgan started executive summary generation',
    severity: 'info',
  },
];

export const DEMO_AGENT_METRICS: Record<AgentName, AgentMetrics> = {
  Vector: {
    agentName: 'Vector',
    tasksCompleted: 156,
    tasksInProgress: 1,
    errorRate: 0.8,
    avgCompletionTime: 420,
    lastActivityAt: new Date(Date.now() - 60000),
    health: 'healthy',
  },
  Merlin: {
    agentName: 'Merlin',
    tasksCompleted: 89,
    tasksInProgress: 1,
    errorRate: 2.2,
    avgCompletionTime: 1800,
    lastActivityAt: new Date(Date.now() - 120000),
    health: 'healthy',
  },
  Morgan: {
    agentName: 'Morgan',
    tasksCompleted: 234,
    tasksInProgress: 1,
    errorRate: 1.1,
    avgCompletionTime: 300,
    lastActivityAt: new Date(Date.now() - 60000),
    health: 'healthy',
  },
  Sterling: {
    agentName: 'Sterling',
    tasksCompleted: 112,
    tasksInProgress: 0,
    errorRate: 1.5,
    avgCompletionTime: 600,
    lastActivityAt: new Date(Date.now() - 3600000),
    health: 'healthy',
  },
  Scout: {
    agentName: 'Scout',
    tasksCompleted: 267,
    tasksInProgress: 0,
    errorRate: 0.4,
    avgCompletionTime: 240,
    lastActivityAt: new Date(Date.now() - 2400000),
    health: 'healthy',
  },
  Architect: {
    agentName: 'Architect',
    tasksCompleted: 78,
    tasksInProgress: 1,
    errorRate: 3.8,
    avgCompletionTime: 900,
    lastActivityAt: new Date(Date.now() - 300000),
    health: 'degraded',
  },
  Maxwell: {
    agentName: 'Maxwell',
    tasksCompleted: 145,
    tasksInProgress: 0,
    errorRate: 5.2,
    avgCompletionTime: 1200,
    lastActivityAt: new Date(Date.now() - 900000),
    health: 'degraded',
  },
  Sentinel: {
    agentName: 'Sentinel',
    tasksCompleted: 198,
    tasksInProgress: 0,
    errorRate: 0.5,
    avgCompletionTime: 180,
    lastActivityAt: new Date(Date.now() - 1200000),
    health: 'healthy',
  },
};

export const DEMO_CNS: CentralNervousSystem = {
  dealId: 'deal-1',
  agentTasks: DEMO_AGENT_TASKS,
  recentEvents: DEMO_AGENT_EVENTS,
  agentMetrics: DEMO_AGENT_METRICS,
  systemHealth: 'operational',
  lastSyncAt: new Date(),
};

export function getCNS(dealId: string): CentralNervousSystem {
  return DEMO_CNS.dealId === dealId ? DEMO_CNS : (null as any);
}

export function getAgentTasks(dealId: string): AgentTask[] {
  return DEMO_AGENT_TASKS;
}

export function getRunningTasks(dealId: string): AgentTask[] {
  return getAgentTasks(dealId).filter((t) => t.status === 'running' || t.status === 'paused');
}

export function getRecentEvents(dealId: string, limit: number = 10): AgentEvent[] {
  return DEMO_AGENT_EVENTS.slice(0, limit);
}

export function getAgentHealth(agentName: AgentName): AgentMetrics {
  return DEMO_AGENT_METRICS[agentName];
}

export function getSystemHealth(dealId: string): string {
  const metrics = Object.values(DEMO_AGENT_METRICS);
  const degraded = metrics.filter((m) => m.health === 'degraded').length;
  const offline = metrics.filter((m) => m.health === 'offline').length;

  if (offline > 0) return 'critical';
  if (degraded > 2) return 'warning';
  return 'operational';
}
