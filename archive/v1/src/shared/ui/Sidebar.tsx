import React from 'react';
import { navigationConfig, NavItem } from '../../NavigationConfig';
import { ProfileMenu } from '../../features/profile/components/ProfileMenu';


interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

// Icon helper component to render custom premium SVGs based on config keys
export const NavIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case 'LayoutDashboard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      );
    case 'Brain':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0v-3.75m0-5.25A3.75 3.75 0 0 0 8.25 10.5a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75A6.75 6.75 0 0 1 11.25 3.75h1.5A6.75 6.75 0 0 1 19.5 10.5a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75A3.75 3.75 0 0 0 12 6.75Z" />
        </svg>
      );
    case 'ShieldAlert':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      );
    case 'History':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      );
    case 'TrendingUp':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.007 5.25h-.007v-.008h.007V12Zm0 5.25h-.007v-.008h.007v.008Z" />
        </svg>
      );
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-200 lg:flex">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <div>
            <h1 className="font-sans text-base font-bold tracking-tight text-white">
              ACIE <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 rounded-full px-2 py-0.5 ml-1">v1.2</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Impact Engine</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {navigationConfig.map((item: NavItem) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-slate-900 border-l-2 border-cyan-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]'
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border-l-2 border-transparent'
              }`}
            >
              <NavIcon
                name={item.icon}
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1 text-left">{item.name}</span>
              {isActive && (
                <span className="absolute right-4 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/30">
        <ProfileMenu />
      </div>
    </aside>
  );
};
