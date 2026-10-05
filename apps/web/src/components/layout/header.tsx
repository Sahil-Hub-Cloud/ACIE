'use client';

import { Menu } from 'lucide-react';
import { ApiClient } from '../../lib/api';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Header({ onOpenSidebar, title }: { onOpenSidebar: () => void; title: string }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let stale = false;
    ApiClient.me()
      .then((u) => {
        if (!stale) setUser(u);
      })
      .catch(() => {
        // middleware already guards the route; keep the header anonymous
      });
    return () => {
      stale = true;
    };
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
        {user && (
          <div className="flex items-center gap-2">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.username ?? 'user'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs uppercase">
                {(user.username ?? '').slice(0, 2)}
              </div>
            )}
            <span className="hidden md:inline text-xs font-bold text-slate-300">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
}
