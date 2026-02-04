import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Sparkles } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b glass-card border-border/50 lg:px-8">
          <MobileNav />
          <div className="flex items-center lg:hidden ml-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="ml-2 text-lg font-bold gradient-text">FlowPilot AI</span>
          </div>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
