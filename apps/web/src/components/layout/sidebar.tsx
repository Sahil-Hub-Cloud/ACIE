'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderGit2, History, Network, Settings, LogOut } from 'lucide-react';
import { ApiClient } from '../../lib/api';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Repositories', href: '/repos', icon: FolderGit2 },
    { name: 'Audit Logs', href: '/analysis', icon: History },
    { name: 'Dependency Graph', href: '/graph', icon: Network },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#010409] border-r border-white/5 flex flex-col h-full transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 shrink-0`}
      >
        <div className="p-8 text-xl font-bold flex items-center gap-2 select-none">
          <span className="text-accent animate-pulse">⚡</span> ACIE
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-accent/15 text-white border-r-2 border-accent'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-accent' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#010409]">
          <button
            onClick={() => ApiClient.logout()}
            className="w-full text-center text-xs text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
