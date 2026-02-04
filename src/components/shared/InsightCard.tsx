import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Insight } from '@/types';

interface InsightCardProps {
  insight: Insight;
  onMarkAsRead?: (id: string) => void;
}

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
  },
};

const typeLabels = {
  bottleneck: 'Bottleneck',
  optimization: 'Optimization',
  burnout: 'Burnout Alert',
  productivity: 'Productivity',
  meeting: 'Meeting',
  task: 'Task',
};

export function InsightCard({ insight, onMarkAsRead }: InsightCardProps) {
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <Card className={cn('glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4', config.borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {typeLabels[insight.type]}
                </Badge>
                <Badge variant={insight.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                  {insight.severity}
                </Badge>
              </div>
              <h3 className="font-semibold text-base">{insight.title}</h3>
            </div>
          </div>
          {!insight.is_read && onMarkAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(insight.id)}
              className="shrink-0"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        {insight.action_items && insight.action_items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommended Actions:</p>
            <ul className="space-y-1">
              {insight.action_items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
