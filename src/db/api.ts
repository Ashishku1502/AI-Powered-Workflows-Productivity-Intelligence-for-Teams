import { supabase } from './supabase';
import type { Integration, Workflow, Insight, TeamMetric, AutomationRun } from '@/types';

// Integrations
export const getIntegrations = async (): Promise<Integration[]> => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createIntegration = async (integration: Partial<Integration>): Promise<Integration> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('integrations')
    .insert({ ...integration, user_id: user?.id })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Integration;
};

export const updateIntegration = async (id: string, updates: Partial<Integration>): Promise<Integration> => {
  const { data, error } = await supabase
    .from('integrations')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Integration;
};

export const deleteIntegration = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Workflows
export const getWorkflows = async (): Promise<Workflow[]> => {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getWorkflow = async (id: string): Promise<Workflow | null> => {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createWorkflow = async (workflow: Partial<Workflow>): Promise<Workflow> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('workflows')
    .insert({ ...workflow, user_id: user?.id })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Workflow;
};

export const updateWorkflow = async (id: string, updates: Partial<Workflow>): Promise<Workflow> => {
  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Workflow;
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Insights
export const getInsights = async (limit = 50): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const markInsightAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('insights')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
};

// Team Metrics
export const getTeamMetrics = async (days = 30): Promise<TeamMetric[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('team_metrics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getLatestMetrics = async (): Promise<TeamMetric | null> => {
  const { data, error } = await supabase
    .from('team_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Automation Runs
export const getAutomationRuns = async (workflowId: string, limit = 20): Promise<AutomationRun[]> => {
  const { data, error } = await supabase
    .from('automation_runs')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

// AI Chat
export const sendChatMessage = async (messages: Array<{ role: string; content: string }>, context?: string) => {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { messages, context }
  });

  if (error) throw error;
  return data;
};
