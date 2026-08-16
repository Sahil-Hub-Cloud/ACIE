'use client';

import { useEffect, useState } from 'react';
import { useRepos } from '../../../hooks/use-repos';
import DependencyGraph from '../../../components/graph/dependency-graph';
import { Loader2, AlertCircle } from 'lucide-react';

export default function GraphPage() {
  const { repos, graph, loading, error, fetchRepos, fetchGraph } = useRepos();
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  useEffect(() => {
    if (repos.length > 0 && selectedRepoId === null) {
      setSelectedRepoId(repos[0].id);
      fetchGraph(repos[0].id);
    }
  }, [repos, selectedRepoId, fetchGraph]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedRepoId(id);
    fetchGraph(id);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">Architecture Graph</h2>
          <p className="text-slate-500 text-xs font-semibold">Visual mapping of imported files across repositories</p>
        </div>

        {repos.length > 0 && (
          <select
            value={selectedRepoId || ''}
            onChange={handleSelect}
            className="bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-accent cursor-pointer"
          >
            {repos.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.owner}/{repo.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && !graph ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">Syncing dependency connections...</span>
        </div>
      ) : error ? (
        <div className="glass p-6 rounded-2xl border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3 shrink-0">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Failed to load graph: {error}</span>
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-20 text-slate-500 italic text-sm shrink-0">
          No repositories registered yet. Register repositories to inspect dependency architecture mappings.
        </div>
      ) : (
        <div className="flex-1 min-h-[500px]">
          <DependencyGraph graphData={graph} />
        </div>
      )}
    </div>
  );
}
