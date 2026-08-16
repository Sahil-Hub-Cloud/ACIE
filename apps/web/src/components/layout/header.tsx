'use client';

import { Menu } from 'lucide-react';
import { ApiClient } from '../../lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Header({ onOpenSidebar, title }: { onOpenSidebar: () => void; title: string }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(ApiClient.getPayload());
  }, []);

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-[#010409]/50 shrink-0">
      {/* Mobile Toggle Button */}
      <button onClick={onOpenSidebar} className="text-white focus:outline-none md:hidden mr-4">
        <Menu className="w-6 h-6" />
      </button>

      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        Command Center / <span className="text-white">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
          <span className="text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            AGENTS ONLINE
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs uppercase">
                {user.username.slice(0, 2)}
              </div>
            )}
            <span className="hidden md:inline text-xs font-bold text-slate-300">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
}
