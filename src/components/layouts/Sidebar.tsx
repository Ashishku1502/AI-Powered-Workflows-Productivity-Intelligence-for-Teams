import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Workflow,
  Lightbulb,
  Heart,
  Plug,
  Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Workflow Builder', href: '/workflows', icon: Workflow },
  { name: 'AI Insights', href: '/insights', icon: Lightbulb },
  { name: 'Team Health', href: '/team-health', icon: Heart },
  { name: 'Integrations', href: '/integrations', icon: Plug },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 glass-card border-r">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-6 border-b border-border/50">
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="ml-3 text-xl font-bold gradient-text">FlowPilot AI</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <div className="px-4 py-3 rounded-lg bg-gradient-primary text-primary-foreground">
            <p className="text-xs font-semibold">FlowPilot AI</p>
            <p className="text-xs opacity-90 mt-1">Productivity Intelligence</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
