'use client';

import { FolderGit2, History, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function StatsCards({ stats }: { stats: { totalRepos: number; totalAnalyses: number; highRiskPRs: number; incidentsPrevented: number } | null }) {
  const cards = [
    {
      title: 'Total Repositories',
      value: stats?.totalRepos ?? 0,
      icon: FolderGit2,
      color: 'from-blue-500/10 to-transparent',
      textColor: 'text-blue-400',
    },
    {
      title: 'Total PR Analyses',
      value: stats?.totalAnalyses ?? 0,
      icon: History,
      color: 'from-purple-500/10 to-transparent',
      textColor: 'text-purple-400',
    },
    {
      title: 'High-Risk PRs',
      value: stats?.highRiskPRs ?? 0,
      icon: AlertTriangle,
      color: 'from-orange-500/10 to-transparent',
      textColor: 'text-orange-400',
    },
    {
      title: 'Incidents Prevented',
      value: stats?.incidentsPrevented ?? 0,
      icon: ShieldCheck,
      color: 'from-emerald-500/10 to-transparent',
      textColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.01] hover:border-white/10 hover:shadow-2xl transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-tr ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">
              {card.title}
            </div>

            <div className="glass-inner p-3 flex items-center justify-between border border-white/5 bg-slate-950/20 rounded-xl">
              <span className="text-3xl font-black text-white select-none">
                {card.value}
              </span>
              <div className={`${card.textColor} opacity-80 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
