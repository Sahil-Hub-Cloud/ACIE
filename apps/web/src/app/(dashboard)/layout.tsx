'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';
import { ApiClient } from '../../lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = ApiClient.getToken();
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="text-xs text-slate-500 font-mono tracking-wider animate-pulse">
          Syncing secure keys...
        </span>
      </div>
    );
  }

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
