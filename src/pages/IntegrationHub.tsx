import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { IntegrationCard } from '@/components/shared/IntegrationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Plug, 
  CheckCircle2, 
  XCircle,
  Zap,
  Shield,
  Lock,
  TrendingUp
} from 'lucide-react';
import { getIntegrations, createIntegration, deleteIntegration } from '@/db/api';
import type { Integration } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const availablePlatforms = [
  { 
    id: 'github', 
    name: 'GitHub', 
    icon: '⚡', 
    description: 'Track PRs, commits, and code reviews',
    color: 'bg-[#181717]',
    features: ['Pull Request Analytics', 'Code Review Metrics', 'Commit Patterns']
  },
  { 
    id: 'jira', 
    name: 'Jira', 
    icon: '📋', 
    description: 'Monitor tasks, sprints, and velocity',
    color: 'bg-[#0052CC]',
    features: ['Sprint Tracking', 'Task Analytics', 'Velocity Metrics']
  },
  { 
    id: 'slack', 
    name: 'Slack', 
    icon: '💬', 
    description: 'Analyze communication patterns',
    color: 'bg-[#4A154B]',
    features: ['Response Time', 'Communication Flow', 'Channel Activity']
  },
  { 
    id: 'notion', 
    name: 'Notion', 
    icon: '📝', 
    description: 'Track documentation and notes',
    color: 'bg-[#000000]',
    features: ['Doc Updates', 'Knowledge Base', 'Collaboration']
  },
  { 
    id: 'google_calendar', 
    name: 'Google Calendar', 
    icon: '📅', 
    description: 'Analyze meeting patterns',
    color: 'bg-[#4285F4]',
    features: ['Meeting Load', 'Focus Time', 'Schedule Optimization']
  },
];

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      await createIntegration({
        platform: platform as Integration['platform'],
        status: 'connected',
        connected_at: new Date().toISOString(),
        metadata: {},
      });
      toast({
        title: 'Success',
        description: `${platform} connected successfully`,
      });
      loadIntegrations();
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect integration',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await deleteIntegration(id);
      toast({
        title: 'Success',
        description: 'Integration disconnected',
      });
      loadIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration',
        variant: 'destructive',
      });
    }
  };

  const connectedPlatforms = new Set(integrations.map((i) => i.platform));
  const availableToConnect = availablePlatforms.filter((p) => !connectedPlatforms.has(p.id as Integration['platform']));
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalPlatforms = availablePlatforms.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Plug className="w-10 h-10" />
              Integration Hub
            </h1>
            <p className="text-muted-foreground">Connect your tools to unlock AI-powered insights</p>
          </div>
          <Card className="glass-card border-primary/30 md:w-auto">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">{connectedCount}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalPlatforms}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        {!loading && integrations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-card shadow-card border-l-4 border-l-success">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Connections</p>
                    <p className="text-3xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-warning">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Errors</p>
                    <p className="text-3xl font-bold">{integrations.filter(i => i.status === 'error').length}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data Synced</p>
                    <p className="text-3xl font-bold">24/7</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connected Integrations */}
        {integrations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-success" />
                Connected Integrations
              </h2>
              <Badge variant="secondary" className="text-sm">
                {integrations.length} Active
              </Badge>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onDisconnect={handleDisconnect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Integrations */}
        {availableToConnect.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" />
                Available Integrations
              </h2>
              <Badge variant="outline" className="text-sm">
                {availableToConnect.length} Available
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableToConnect.map((platform) => (
                <Card 
                  key={platform.id} 
                  className="glass-card shadow-card hover:shadow-hover transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg',
                        platform.color
                      )}>
                        {platform.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {platform.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleConnect(platform.id)}
                      className="w-full group-hover:scale-105 transition-transform"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Connect {platform.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Integrations State */}
        {!loading && integrations.length === 0 && (
          <Card className="glass-card shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Plug className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Integrations Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Connect your first tool below to start receiving AI-powered insights and productivity recommendations!
              </p>
              <Button size="lg" className="gap-2">
                <Zap className="w-5 h-5" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security & Privacy Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">OAuth Authentication</p>
                  <p>All integrations use secure OAuth 2.0 authentication. We never store your passwords.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Metadata Only</p>
                  <p>We collect only metadata (timestamps, counts, patterns) - never your actual content.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Real-time Sync</p>
                  <p>Data syncs automatically in real-time to provide up-to-date insights.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-accent" />
                How Integrations Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">1.</span>
                  <span><strong className="text-foreground">GitHub:</strong> Track PR review times, commit patterns, and code review velocity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">2.</span>
                  <span><strong className="text-foreground">Jira:</strong> Monitor task status, sprint velocity, and blocker patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">3.</span>
                  <span><strong className="text-foreground">Slack:</strong> Analyze response times and communication patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">4.</span>
                  <span><strong className="text-foreground">Notion:</strong> Track documentation updates and knowledge base activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">5.</span>
                  <span><strong className="text-foreground">Calendar:</strong> Analyze meeting load and focus time availability</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
