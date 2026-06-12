import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';
import { Breadcrumb } from './Breadcrumb';
import { RouteTransition } from './RouteTransition';
import { WorkspaceSwitcher } from '../../features/workspace/components/WorkspaceSwitcher';
import { WorkspaceBadge } from '../../features/workspace/components/WorkspaceBadge';


interface AppShellProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentPath,
  onNavigate,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Background Gradients & Mesh Effect */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* Desktop Sidebar (lg:flex, hidden below lg) */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Mobile Drawer (toggled off-screen, visible below lg) */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />

      {/* Main Layout Area */}
      <div className="relative z-10 flex min-h-screen flex-col lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-900/60 bg-slate-950/80 px-6 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-white lg:hidden transition-all duration-200"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Breadcrumb Info */}
            <Breadcrumb currentPath={currentPath} onNavigate={onNavigate} />
          </div>

          {/* Workspace Selection & Status */}
          <div className="flex items-center space-x-3">
            <WorkspaceBadge />
            <WorkspaceSwitcher />
          </div>
        </header>

        {/* Main Content View with route transitions */}
        <main className="flex-1 p-6 md:p-8">
          <RouteTransition routeKey={currentPath}>
            {children}
          </RouteTransition>
        </main>
      </div>
    </div>
  );
};
export default AppShell;
