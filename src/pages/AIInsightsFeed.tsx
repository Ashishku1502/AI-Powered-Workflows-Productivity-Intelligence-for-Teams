import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { InsightCard } from '@/components/shared/InsightCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInsights, markInsightAsRead } from '@/db/api';
import type { Insight } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  Zap, 
  TrendingUp,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIInsightsFeed() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await getInsights(50);
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
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

  const handleMarkAllAsRead = async () => {
    try {
      const unreadInsights = insights.filter(i => !i.is_read);
      await Promise.all(unreadInsights.map(i => markInsightAsRead(i.id)));
      setInsights((prev) => prev.map((i) => ({ ...i, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredInsights = filter === 'unread' 
    ? insights.filter((i) => !i.is_read)
    : insights;

  const insightsByType = {
    all: filteredInsights,
    bottleneck: filteredInsights.filter((i) => i.type === 'bottleneck'),
    optimization: filteredInsights.filter((i) => i.type === 'optimization'),
    burnout: filteredInsights.filter((i) => i.type === 'burnout'),
    productivity: filteredInsights.filter((i) => i.type === 'productivity'),
  };

  const unreadCount = insights.filter((i) => !i.is_read).length;
  const criticalCount = insights.filter((i) => i.severity === 'critical').length;
  const warningCount = insights.filter((i) => i.severity === 'warning').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Lightbulb className="w-10 h-10" />
              AI Insights Feed
            </h1>
            <p className="text-muted-foreground">AI-powered recommendations and productivity insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className="gap-2"
            >
              Unread
              <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="glass-card shadow-card border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Insights</p>
                    <p className="text-3xl font-bold">{insights.length}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Critical</p>
                    <p className="text-3xl font-bold">{criticalCount}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-warning">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                    <p className="text-3xl font-bold">{warningCount}</p>
                  </div>
                  <Zap className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Unread</p>
                    <p className="text-3xl font-bold">{unreadCount}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insights Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="glass-card w-full md:w-auto">
            <TabsTrigger value="all" className="gap-2">
              <Sparkles className="w-4 h-4" />
              All Insights
            </TabsTrigger>
            <TabsTrigger value="bottleneck" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Bottlenecks
            </TabsTrigger>
            <TabsTrigger value="optimization" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimizations
            </TabsTrigger>
            <TabsTrigger value="burnout" className="gap-2">
              <Zap className="w-4 h-4" />
              Burnout
            </TabsTrigger>
            <TabsTrigger value="productivity" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Productivity
            </TabsTrigger>
          </TabsList>

          {Object.entries(insightsByType).map(([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-48 bg-muted" />
                  ))}
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} onMarkAsRead={handleMarkAsRead} />
                  ))}
                </div>
              ) : (
                <Card className="glass-card shadow-card">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Insights Found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      {filter === 'unread' 
                        ? "You're all caught up! No unread insights at the moment."
                        : "No insights in this category yet. Check back later for AI-powered recommendations."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
