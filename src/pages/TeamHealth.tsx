import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ChartCard } from '@/components/shared/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Target,
  Heart,
  Activity,
  Moon,
  Sun,
  Coffee,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { getTeamMetrics } from '@/db/api';
import type { TeamMetric } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function TeamHealth() {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
      const data = await getTeamMetrics(days);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];
  
  const avgBurnoutScore = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.burnout_score, 0) / metrics.length
    : 0;

  const avgFocusTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.focus_time_hours, 0) / metrics.length
    : 0;

  const avgMeetingTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.meeting_hours, 0) / metrics.length
    : 0;

  const avgAfterHours = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.after_hours_work, 0) / metrics.length
    : 0;

  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    focusTime: m.focus_time_hours,
    meetingTime: m.meeting_hours,
    afterHours: m.after_hours_work,
    burnout: m.burnout_score * 100,
    tasksCompleted: m.tasks_completed,
    tasksBlocked: m.tasks_blocked,
  }));

  // Radar chart data for team health overview
  const healthRadarData = latestMetric ? [
    {
      metric: 'Focus Time',
      value: (latestMetric.focus_time_hours / 8) * 100,
      fullMark: 100,
    },
    {
      metric: 'Work-Life Balance',
      value: Math.max(0, 100 - (latestMetric.after_hours_work / 4) * 100),
      fullMark: 100,
    },
    {
      metric: 'Task Completion',
      value: (latestMetric.tasks_completed / (latestMetric.tasks_completed + latestMetric.tasks_blocked)) * 100,
      fullMark: 100,
    },
    {
      metric: 'Meeting Load',
      value: Math.max(0, 100 - (latestMetric.meeting_hours / 6) * 100),
      fullMark: 100,
    },
    {
      metric: 'Burnout Risk',
      value: Math.max(0, 100 - latestMetric.burnout_score * 100),
      fullMark: 100,
    },
  ] : [];

  const getBurnoutStatus = (score: number) => {
    if (score < 0.3) return { label: 'Healthy', color: 'text-success', bgColor: 'bg-success/10', variant: 'default' as const };
    if (score < 0.6) return { label: 'Moderate', color: 'text-warning', bgColor: 'bg-warning/10', variant: 'secondary' as const };
    return { label: 'High Risk', color: 'text-destructive', bgColor: 'bg-destructive/10', variant: 'destructive' as const };
  };

  const burnoutStatus = latestMetric ? getBurnoutStatus(latestMetric.burnout_score) : null;

  const burnoutTrend = previousMetric 
    ? ((latestMetric.burnout_score - previousMetric.burnout_score) / previousMetric.burnout_score) * 100
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10" />
              Team Health
            </h1>
            <p className="text-muted-foreground">Monitor workload, burnout risks, and work patterns</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === '14d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('14d')}
            >
              14 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </Button>
          </div>
        </div>

        {/* Key Health Metrics */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Burnout Risk Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Burnout Risk</CardTitle>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {latestMetric ? (latestMetric.burnout_score * 100).toFixed(0) : 0}%
                    </span>
                    {burnoutStatus && (
                      <Badge variant={burnoutStatus.variant}>{burnoutStatus.label}</Badge>
                    )}
                  </div>
                  <Progress 
                    value={latestMetric ? latestMetric.burnout_score * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="flex items-center gap-2 text-sm">
                    {burnoutTrend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-destructive" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-success" />
                    )}
                    <span className={cn(
                      "font-medium",
                      burnoutTrend > 0 ? "text-destructive" : "text-success"
                    )}>
                      {Math.abs(burnoutTrend).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">vs yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Focus Time Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Focus Time</CardTitle>
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold">{avgFocusTime.toFixed(1)}h</div>
                  <Progress value={(avgFocusTime / 8) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {avgFocusTime >= 5 ? 'Excellent deep work time' : 'Could be improved'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Load Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Meeting Load</CardTitle>
                  <Coffee className="w-5 h-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold">{avgMeetingTime.toFixed(1)}h</div>
                  <Progress value={(avgMeetingTime / 6) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {avgMeetingTime <= 3 ? 'Healthy meeting balance' : 'Consider reducing meetings'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* After Hours Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-warning">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">After Hours</CardTitle>
                  <Moon className="w-5 h-5 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold">{avgAfterHours.toFixed(1)}h</div>
                  <Progress value={(avgAfterHours / 4) * 100} className="h-2" />
                  {avgAfterHours > 2 && (
                    <Badge variant="destructive" className="w-full justify-center text-xs">
                      Above recommended threshold
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="glass-card w-full md:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <Sun className="w-4 h-4" />
              Work Patterns
            </TabsTrigger>
            <TabsTrigger value="burnout" className="gap-2">
              <Zap className="w-4 h-4" />
              Burnout Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Team Health Radar */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Team Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={healthRadarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                          dataKey="metric" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                        />
                        <Radar
                          name="Health Score"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Focus vs Meetings */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary" />
                    Focus Time vs Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="focusTime" fill="hsl(var(--primary))" name="Focus Time" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="meetingTime" fill="hsl(var(--secondary))" name="Meetings" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Work Pattern Analysis */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent" />
                    Daily Work Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorFocusTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorMeetingTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorAfterHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="focusTime"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorFocusTime)"
                          name="Focus Time"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="meetingTime"
                          stroke="hsl(var(--secondary))"
                          fillOpacity={1}
                          fill="url(#colorMeetingTime)"
                          name="Meetings"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="afterHours"
                          stroke="hsl(var(--destructive))"
                          fillOpacity={1}
                          fill="url(#colorAfterHours)"
                          name="After Hours"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Task Performance */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Task Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="tasksCompleted" fill="hsl(var(--success))" name="Completed" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="tasksBlocked" fill="hsl(var(--destructive))" name="Blocked" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="burnout" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Burnout Trend */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Burnout Risk Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="burnout"
                          stroke="hsl(var(--destructive))"
                          strokeWidth={3}
                          name="Burnout Score"
                          dot={{ fill: 'hsl(var(--destructive))', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Health Recommendations */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Health Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {avgBurnoutScore > 0.6 && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-destructive mb-1">High Burnout Risk Detected</h4>
                            <p className="text-sm text-muted-foreground">
                              Consider reducing workload and encouraging time off for team members.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {avgAfterHours > 2 && (
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                        <div className="flex items-start gap-3">
                          <Moon className="w-5 h-5 text-warning mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-warning mb-1">Excessive After-Hours Work</h4>
                            <p className="text-sm text-muted-foreground">
                              Set clear boundaries and enable do-not-disturb policies after work hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {avgMeetingTime > avgFocusTime && (
                      <div className="p-4 rounded-lg bg-info/10 border border-info/30">
                        <div className="flex items-start gap-3">
                          <Coffee className="w-5 h-5 text-info mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-info mb-1">Meeting Overload</h4>
                            <p className="text-sm text-muted-foreground">
                              Meetings exceed focus time. Consider async alternatives and no-meeting days.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {avgBurnoutScore <= 0.3 && avgFocusTime >= 5 && (
                      <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                        <div className="flex items-start gap-3">
                          <Heart className="w-5 h-5 text-success mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-success mb-1">Healthy Team Balance</h4>
                            <p className="text-sm text-muted-foreground">
                              Great work! Team health metrics are in the optimal range.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
