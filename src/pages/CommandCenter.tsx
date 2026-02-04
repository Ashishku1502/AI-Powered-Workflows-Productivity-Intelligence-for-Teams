import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Zap, 
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getInsights, getTeamMetrics, markInsightAsRead } from '@/db/api';
import type { Insight, TeamMetric } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CommandCenter() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
      const [insightsData, metricsData] = await Promise.all([
        getInsights(10),
        getTeamMetrics(days),
      ]);
      setInsights(insightsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markInsightAsRead(id);
      setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  // Calculate summary metrics
  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];
  
  const avgFocusTime = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.focus_time_hours, 0) / metrics.length)
    : 0;
  
  const avgMeetingTime = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.meeting_hours, 0) / metrics.length)
    : 0;
  
  const totalTasksCompleted = metrics.reduce((sum, m) => sum + m.tasks_completed, 0);
  const totalTasksBlocked = metrics.reduce((sum, m) => sum + m.tasks_blocked, 0);
  
  const avgVelocity = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.sprint_velocity, 0) / metrics.length)
    : 0;

  const avgBurnoutScore = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.burnout_score, 0) / metrics.length) * 100
    : 0;

  // Calculate trends
  const focusTrend = previousMetric 
    ? ((latestMetric.focus_time_hours - previousMetric.focus_time_hours) / previousMetric.focus_time_hours) * 100
    : 0;
  
  const velocityTrend = previousMetric 
    ? ((latestMetric.sprint_velocity - previousMetric.sprint_velocity) / previousMetric.sprint_velocity) * 100
    : 0;

  // Prepare chart data
  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    focus: m.focus_time_hours,
    meetings: m.meeting_hours,
    afterHours: m.after_hours_work,
    velocity: m.sprint_velocity,
    completed: m.tasks_completed,
    blocked: m.tasks_blocked,
    burnout: m.burnout_score * 100,
  }));

  // Pie chart data for task distribution
  const taskDistribution = [
    { name: 'Completed', value: totalTasksCompleted, color: 'hsl(var(--primary))' },
    { name: 'Blocked', value: totalTasksBlocked, color: 'hsl(var(--destructive))' },
  ];

  // Insight categories count
  const insightCategories = insights.reduce((acc, insight) => {
    acc[insight.type] = (acc[insight.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalInsights = insights.filter(i => i.severity === 'critical').length;
  const unreadInsights = insights.filter(i => !i.is_read).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10" />
              Command Center
            </h1>
            <p className="text-muted-foreground">Real-time productivity intelligence and team analytics</p>
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

        {/* Key Metrics Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Focus Time Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Focus Time</CardTitle>
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{avgFocusTime.toFixed(1)}h</div>
                  <div className="flex items-center gap-2">
                    {focusTrend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      focusTrend >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {Math.abs(focusTrend).toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs yesterday</span>
                  </div>
                  <Progress value={(avgFocusTime / 8) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Sprint Velocity Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sprint Velocity</CardTitle>
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{avgVelocity}</div>
                  <div className="flex items-center gap-2">
                    {velocityTrend >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      velocityTrend >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {Math.abs(velocityTrend).toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">story points</span>
                  </div>
                  <Progress value={(avgVelocity / 50) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Overview Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
                  <Target className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="text-lg font-bold">{totalTasksCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm">Blocked</span>
                    </div>
                    <span className="text-lg font-bold">{totalTasksBlocked}</span>
                  </div>
                  <Progress 
                    value={(totalTasksCompleted / (totalTasksCompleted + totalTasksBlocked)) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="glass-card shadow-card hover:shadow-hover transition-all duration-300 border-l-4 border-l-warning">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Insights</CardTitle>
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical</span>
                    <Badge variant="destructive">{criticalInsights}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unread</span>
                    <Badge variant="secondary">{unreadInsights}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total</span>
                    <span className="text-lg font-bold">{insights.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="health">Team Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Focus Time vs Meetings */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Focus Time vs Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
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
                          dataKey="focus"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorFocus)"
                          name="Focus Time"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="meetings"
                          stroke="hsl(var(--secondary))"
                          fillOpacity={1}
                          fill="url(#colorMeetings)"
                          name="Meetings"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Sprint Velocity Trend */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Sprint Velocity Trend
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
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                          dataKey="velocity"
                          stroke="hsl(var(--accent))"
                          strokeWidth={3}
                          name="Velocity"
                          dot={{ fill: 'hsl(var(--accent))', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Task Completion */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Task Completion Rate
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
                        <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="blocked" fill="hsl(var(--destructive))" name="Blocked" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* After Hours Work */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-warning" />
                    After Hours Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 bg-muted" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorAfterHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
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
                          dataKey="afterHours"
                          stroke="hsl(var(--warning))"
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
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Burnout Score */}
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

              {/* Team Health Summary */}
              <Card className="glass-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Team Health Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Burnout Risk</span>
                        <span className="text-2xl font-bold">{avgBurnoutScore.toFixed(0)}%</span>
                      </div>
                      <Progress value={avgBurnoutScore} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {avgBurnoutScore < 30 ? 'Healthy' : avgBurnoutScore < 60 ? 'Moderate' : 'High Risk'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Focus/Meeting Ratio</span>
                        <span className="text-2xl font-bold">
                          {(avgFocusTime / (avgMeetingTime || 1)).toFixed(1)}:1
                        </span>
                      </div>
                      <Progress value={(avgFocusTime / (avgFocusTime + avgMeetingTime)) * 100} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {avgFocusTime > avgMeetingTime ? 'Good balance' : 'Too many meetings'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Avg Focus Time</p>
                          <p className="text-lg font-bold">{avgFocusTime.toFixed(1)}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Avg Meetings</p>
                          <p className="text-lg font-bold">{avgMeetingTime.toFixed(1)}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Completion Rate</p>
                          <p className="text-lg font-bold">
                            {((totalTasksCompleted / (totalTasksCompleted + totalTasksBlocked)) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Avg Velocity</p>
                          <p className="text-lg font-bold">{avgVelocity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Latest AI Insights */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Latest AI Insights
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/insights'}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 bg-muted" />
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-lg glass-card border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={insight.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {insight.severity}
                          </Badge>
                          <Badge variant="outline">{insight.type}</Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                      {!insight.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(insight.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No insights available yet. Connect your tools to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
