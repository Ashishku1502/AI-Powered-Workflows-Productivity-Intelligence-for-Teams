export interface Integration {
  id: string;
  user_id: string;
  platform: 'github' | 'jira' | 'slack' | 'notion' | 'google_calendar';
  status: 'connected' | 'disconnected' | 'error';
  connected_at: string;
  last_sync: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  trigger_type: 'webhook' | 'cron' | 'manual' | 'event';
  trigger_config: Record<string, unknown>;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  is_active: boolean;
  run_count: number;
  last_run: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
}

export interface Insight {
  id: string;
  user_id: string | null;
  type: 'bottleneck' | 'optimization' | 'burnout' | 'productivity' | 'meeting' | 'task';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  action_items: string[];
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface TeamMetric {
  id: string;
  user_id: string;
  date: string;
  focus_time_hours: number;
  meeting_hours: number;
  after_hours_work: number;
  tasks_completed: number;
  tasks_blocked: number;
  sprint_velocity: number;
  burnout_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AutomationRun {
  id: string;
  workflow_id: string;
  status: 'running' | 'success' | 'failed';
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  execution_log: Array<{ timestamp: string; message: string }>;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
