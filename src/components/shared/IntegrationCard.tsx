import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Integration } from '@/types';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure?: (id: string) => void;
  onDisconnect?: (id: string) => void;
}

const platformConfig = {
  github: {
    name: 'GitHub',
    color: 'bg-[#181717] dark:bg-[#181717]',
    icon: '⚡',
  },
  jira: {
    name: 'Jira',
    color: 'bg-[#0052CC] dark:bg-[#0052CC]',
    icon: '📋',
  },
  slack: {
    name: 'Slack',
    color: 'bg-[#4A154B] dark:bg-[#4A154B]',
    icon: '💬',
  },
  notion: {
    name: 'Notion',
    color: 'bg-[#000000] dark:bg-[#000000]',
    icon: '📝',
  },
  google_calendar: {
    name: 'Google Calendar',
    color: 'bg-[#4285F4] dark:bg-[#4285F4]',
    icon: '📅',
  },
};

const statusConfig = {
  connected: {
    icon: CheckCircle,
    color: 'text-success',
    label: 'Connected',
    variant: 'default' as const,
  },
  disconnected: {
    icon: XCircle,
    color: 'text-muted-foreground',
    label: 'Disconnected',
    variant: 'secondary' as const,
  },
  error: {
    icon: AlertCircle,
    color: 'text-destructive',
    label: 'Error',
    variant: 'destructive' as const,
  },
};

export function IntegrationCard({ integration, onConfigure, onDisconnect }: IntegrationCardProps) {
  const platform = platformConfig[integration.platform];
  const status = statusConfig[integration.status];
  const StatusIcon = status.icon;

  return (
    <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-2xl', platform.color)}>
              {platform.icon}
            </div>
            <div>
              <CardTitle className="text-base">{platform.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon className={cn('w-4 h-4', status.color)} />
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
          {onConfigure && (
            <Button variant="ghost" size="icon" onClick={() => onConfigure(integration.id)}>
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Connected:</span>
            <span>{new Date(integration.connected_at).toLocaleDateString()}</span>
          </div>
          {integration.last_sync && (
            <div className="flex justify-between">
              <span>Last Sync:</span>
              <span>{new Date(integration.last_sync).toLocaleString()}</span>
            </div>
          )}
        </div>
        {integration.status === 'connected' && onDisconnect && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onDisconnect(integration.id)}
          >
            Disconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
