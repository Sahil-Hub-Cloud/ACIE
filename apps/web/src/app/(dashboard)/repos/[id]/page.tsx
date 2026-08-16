'use client';

import { useEffect } from 'react';
import { useRepos } from '../../../../hooks/use-repos';
import DependencyGraph from '../../../../components/graph/dependency-graph';
import { Loader2, AlertCircle, Calendar, ShieldCheck, Cpu } from 'lucide-react';

export default function RepoDetailPage({ params }: { params: { id: string } }) {
  const repoId = parseInt(params.id, 10);
  const { activeRepo, graph, loading, error, fetchRepo, fetchGraph } = useRepos();

  useEffect(() => {
    fetchRepo(repoId);
    fetchGraph(repoId);
  }, [repoId, fetchRepo, fetchGraph]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-xs text-slate-500 font-mono tracking-wider">Loading codebase schema...</span>
      </div>
    );
  }

  if (error || !activeRepo) {
    return (
      <div className="glass p-6 rounded-2xl border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <span>Failed to load codebase details: {error || 'Codebase not found'}</span>
      </div>
    );
  }

  const formattedDate = activeRepo.last_indexed_at
    ? new Date(activeRepo.last_indexed_at).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never Indexed';

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="glass p-6 rounded-2xl border-t-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-1.5 truncate">
            {activeRepo.owner} / {activeRepo.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white font-mono">
              {activeRepo.language}
            </span>
            {activeRepo.is_monorepo && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold text-indigo-300 uppercase">
                {activeRepo.monorepo_tool || 'Turbo'}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-4 h-4" />
              Last sync: {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Indexed Symbols</div>
            <div className="text-2xl font-black text-white flex items-center justify-end gap-1.5">
              <Cpu className="w-5 h-5 text-indigo-400" />
              {graph?.nodes?.length ?? 0}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Import Connections</div>
            <div className="text-2xl font-black text-white flex items-center justify-end gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {graph?.edges?.length ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Dependency Graph Canvas */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm">Interactive Codebase Dependency Graph</h3>
        <p className="text-xs text-slate-500">Nodes represent unique source files, edges display import declarations.</p>
        <div className="h-[600px] w-full">
          <DependencyGraph graphData={graph} />
        </div>
      </div>
    </div>
  );
}
