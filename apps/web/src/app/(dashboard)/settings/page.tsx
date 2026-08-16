'use client';

import { Shield, Database, Github, Terminal } from 'lucide-react';
import Image from 'next/image';
import { ApiClient } from '../../../lib/api';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(ApiClient.getPayload());
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white mb-1">Configuration Settings</h2>
        <p className="text-slate-500 text-xs font-semibold">Engine control center and integration parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Identity Panel */}
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Identity Credentials
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-black text-sm uppercase">
                  {user?.username.slice(0, 2) || 'AD'}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-white">{user?.username || 'Administrator'}</div>
                <div className="text-xs text-slate-500">{user?.email || 'admin@acie.dev'}</div>
              </div>
            </div>
            <div className="glass-inner p-3 rounded-xl border border-white/5 bg-slate-950/20 text-xs flex justify-between items-center">
              <span className="text-slate-400">User Scope Privilege</span>
              <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-wider">
                {user?.role || 'admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Database parameters */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan" />
            Local Database Engine
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">SQLite Driver</div>
              <input
                type="text"
                readOnly
                value="better-sqlite3"
                className="w-full bg-white/5 border border-white/10 text-white/50 rounded-xl px-4 py-3 text-xs focus:outline-none cursor-default"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Database Schema Path</div>
              <input
                type="text"
                readOnly
                value="./data/acie.db"
                className="w-full bg-white/5 border border-white/10 text-white/50 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Integration Credentials */}
        <div className="glass p-6 rounded-2xl md:col-span-2">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Github className="w-4 h-4 text-indigo-400" />
            GitHub App Integrations
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 leading-relaxed">
              ACIE connects with GitHub using a **GitHub App definition**. When registered, it automatically hooks
              into pull request payloads (`pull_request.opened` / `pull_request.synchronize`) and triggers analysis.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Client ID</div>
                <input
                  type="text"
                  readOnly
                  value="Ov23ct41n8B8YyA4qOee"
                  className="w-full bg-white/5 border border-white/10 text-white/40 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none cursor-default"
                />
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Client Status</div>
                <div className="w-full bg-white/5 border border-white/10 text-emerald-400 rounded-xl px-4 py-3.5 text-xs font-bold flex items-center gap-1.5 cursor-default">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Connected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CLI parameters */}
        <div className="glass p-6 rounded-2xl md:col-span-2">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            CLI Automation Helpers
          </h3>
          <div className="space-y-3.5 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Automate code reviews directly inside your terminal or CI pipelines using our CLI runner.
            </p>
            <div className="glass-inner p-4 rounded-xl border border-white/5 bg-slate-950/20 font-mono text-slate-300 space-y-2">
              <div><span className="text-slate-500"># Run graph indexing on workspace</span></div>
              <div><span className="text-accent">acie</span> index .</div>
              <div className="pt-2"><span className="text-slate-500"># Run analysis between branch commits</span></div>
              <div><span className="text-accent">acie</span> analyze --base main --head HEAD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
