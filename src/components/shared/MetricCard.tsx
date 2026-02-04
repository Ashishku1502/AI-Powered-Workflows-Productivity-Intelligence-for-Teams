import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  description?: string;
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, description, className }: MetricCardProps) {
  return (
    <Card className={cn('glass-card shadow-card hover:shadow-hover transition-all duration-300', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center mt-2 text-sm">
            <span
              className={cn(
                'font-medium',
                trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value)}%
            </span>
            <span className="ml-2 text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
