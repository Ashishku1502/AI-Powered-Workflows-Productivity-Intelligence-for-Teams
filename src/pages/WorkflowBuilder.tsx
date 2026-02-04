import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  Zap,
  Workflow as WorkflowIcon,
  Clock,
  Webhook,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from '@/db/api';
import type { Workflow } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const workflowTemplates = [
  {
    name: 'Slack to Jira',
    description: 'Auto-create Jira tickets from Slack threads',
    trigger: 'event',
    icon: '💬→📋',
    color: 'bg-gradient-to-br from-purple-500 to-blue-500',
  },
  {
    name: 'PR Review Alert',
    description: 'Notify manager when PR is blocked for 2+ days',
    trigger: 'cron',
    icon: '⚡→📧',
    color: 'bg-gradient-to-br from-orange-500 to-red-500',
  },
  {
    name: 'Daily Summary',
    description: 'Generate AI summary of team activity',
    trigger: 'cron',
    icon: '📊→💬',
    color: 'bg-gradient-to-br from-green-500 to-teal-500',
  },
  {
    name: 'Meeting Optimizer',
    description: 'Suggest async alternatives for recurring meetings',
    trigger: 'cron',
    icon: '📅→💡',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
  },
];

const triggerIcons = {
  manual: Activity,
  event: Zap,
  cron: Clock,
  webhook: Webhook,
};

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as Workflow['trigger_type'],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflows',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      toast({
        title: 'Error',
        description: 'Workflow name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        trigger_type: newWorkflow.trigger_type,
        trigger_config: {},
        nodes: [],
        connections: [],
        is_active: true,
      });
      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });
      setDialogOpen(false);
      setNewWorkflow({ name: '', description: '', trigger_type: 'manual' });
      loadWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateWorkflow(id, { is_active: !isActive });
      toast({
        title: 'Success',
        description: `Workflow ${!isActive ? 'activated' : 'paused'}`,
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflow(id);
      toast({
        title: 'Success',
        description: 'Workflow deleted',
      });
      loadWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = (template: typeof workflowTemplates[0]) => {
    setNewWorkflow({
      name: template.name,
      description: template.description,
      trigger_type: template.trigger as Workflow['trigger_type'],
    });
    setDialogOpen(true);
  };

  const activeWorkflows = workflows.filter(w => w.is_active);
  const pausedWorkflows = workflows.filter(w => !w.is_active);
  const totalRuns = workflows.reduce((sum, w) => sum + w.run_count, 0);

  const filteredWorkflows = activeTab === 'all' 
    ? workflows 
    : activeTab === 'active' 
    ? activeWorkflows 
    : pausedWorkflows;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <WorkflowIcon className="w-10 h-10" />
              Workflow Builder
            </h1>
            <p className="text-muted-foreground">Create automated workflows to optimize team productivity</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>Set up a new automation workflow</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input
                    id="name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="e.g., Slack to Jira Automation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                    placeholder="What does this workflow do?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger Type</Label>
                  <Select
                    value={newWorkflow.trigger_type}
                    onValueChange={(value) => setNewWorkflow({ ...newWorkflow, trigger_type: value as Workflow['trigger_type'] })}
                  >
                    <SelectTrigger id="trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="event">Event-based</SelectItem>
                      <SelectItem value="cron">Scheduled (Cron)</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateWorkflow} className="w-full">
                  Create Workflow
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        {!loading && workflows.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card shadow-card border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Workflows</p>
                    <p className="text-3xl font-bold">{workflows.length}</p>
                  </div>
                  <WorkflowIcon className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-success">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-3xl font-bold">{activeWorkflows.length}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-warning">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Paused</p>
                    <p className="text-3xl font-bold">{pausedWorkflows.length}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Runs</p>
                    <p className="text-3xl font-bold">{totalRuns}</p>
                  </div>
                  <Activity className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workflow Templates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Workflow Templates
            </h2>
            <Badge variant="secondary">Quick Start</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflowTemplates.map((template, index) => (
              <Card 
                key={index} 
                className="glass-card shadow-card hover:shadow-hover transition-all duration-300 group overflow-hidden"
              >
                <div className={cn('h-2', template.color)} />
                <CardHeader className="pb-3">
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                  <Badge variant="outline" className="w-fit mt-2">
                    {template.trigger}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Workflows List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent" />
            Your Workflows
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card w-full md:w-auto">
              <TabsTrigger value="all" className="gap-2">
                All
                <Badge variant="secondary">{workflows.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="gap-2">
                Active
                <Badge variant="secondary">{activeWorkflows.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="paused" className="gap-2">
                Paused
                <Badge variant="secondary">{pausedWorkflows.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 bg-muted" />
                  ))}
                </div>
              ) : filteredWorkflows.length > 0 ? (
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => {
                    const TriggerIcon = triggerIcons[workflow.trigger_type];
                    return (
                      <Card key={workflow.id} className="glass-card shadow-card hover:shadow-hover transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={cn(
                                'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
                                workflow.is_active ? 'bg-primary/10' : 'bg-muted'
                              )}>
                                <TriggerIcon className={cn(
                                  'w-6 h-6',
                                  workflow.is_active ? 'text-primary' : 'text-muted-foreground'
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                                  <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                                    {workflow.is_active ? 'Active' : 'Paused'}
                                  </Badge>
                                  <Badge variant="outline">{workflow.trigger_type}</Badge>
                                </div>
                                {workflow.description && (
                                  <CardDescription>{workflow.description}</CardDescription>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleActive(workflow.id, workflow.is_active)}
                                title={workflow.is_active ? 'Pause' : 'Activate'}
                              >
                                {workflow.is_active ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" title="Settings">
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteWorkflow(workflow.id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-6 text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                <span>Runs: <strong className="text-foreground">{workflow.run_count}</strong></span>
                              </div>
                              {workflow.last_run && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>Last run: <strong className="text-foreground">{new Date(workflow.last_run).toLocaleString()}</strong></span>
                                </div>
                              )}
                            </div>
                            <span className="text-muted-foreground">
                              Created: {new Date(workflow.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="glass-card shadow-card">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {activeTab === 'all' ? 'No Workflows Yet' : `No ${activeTab} Workflows`}
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      {activeTab === 'all' 
                        ? 'Use a template or create a custom workflow to get started!'
                        : `You don't have any ${activeTab} workflows at the moment.`}
                    </p>
                    {activeTab === 'all' && (
                      <Button size="lg" onClick={() => setDialogOpen(true)} className="gap-2">
                        <Plus className="w-5 h-5" />
                        Create Your First Workflow
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
