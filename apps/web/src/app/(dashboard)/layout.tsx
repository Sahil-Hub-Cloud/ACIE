'use client';

import { useState } from 'react';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Route protection lives in middleware (httpOnly session cookie); this
  // layout only owns the chrome.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} title="ACIE OS" />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
