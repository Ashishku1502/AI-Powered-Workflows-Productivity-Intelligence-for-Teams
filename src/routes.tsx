import CommandCenter from './pages/CommandCenter';
import WorkflowBuilder from './pages/WorkflowBuilder';
import AIInsightsFeed from './pages/AIInsightsFeed';
import TeamHealth from './pages/TeamHealth';
import IntegrationHub from './pages/IntegrationHub';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Command Center',
    path: '/',
    element: <CommandCenter />
  },
  {
    name: 'Workflow Builder',
    path: '/workflows',
    element: <WorkflowBuilder />
  },
  {
    name: 'AI Insights',
    path: '/insights',
    element: <AIInsightsFeed />
  },
  {
    name: 'Team Health',
    path: '/team-health',
    element: <TeamHealth />
  },
  {
    name: 'Integrations',
    path: '/integrations',
    element: <IntegrationHub />
  }
];

export default routes;
