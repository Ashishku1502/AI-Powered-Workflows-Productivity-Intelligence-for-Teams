import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Sparkles, LayoutDashboard, Workflow, Lightbulb, Heart, Plug } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Workflow Builder', href: '/workflows', icon: Workflow },
  { name: 'AI Insights', href: '/insights', icon: Lightbulb },
  { name: 'Team Health', href: '/team-health', icon: Heart },
  { name: 'Integrations', href: '/integrations', icon: Plug },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 glass-card">
        <div className="flex flex-col h-full">
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
                  onClick={() => setOpen(false)}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
