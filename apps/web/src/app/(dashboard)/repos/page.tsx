'use client';

import { useEffect, useState } from 'react';
import { useRepos } from '../../../hooks/use-repos';
import RepoCard from '../../../components/repos/repo-card';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function ReposPage() {
  const { repos, loading, error, fetchRepos, indexRepo, removeRepo } = useRepos();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">Codebases</h2>
          <p className="text-slate-500 text-xs font-semibold">Repositories from GitHub App installations</p>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="relative max-w-md">
        <span className="absolute left-4 top-3.5 text-slate-500"><Search className="w-4 h-4" /></span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter repositories..."
          className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 text-xs focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">Syncing repositories...</span>
        </div>
      ) : error ? (
        <div className="glass p-6 rounded-2xl border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Error loading repositories: {error}</span>
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-20 text-slate-500 italic text-sm">
          No repositories found. Install the ACIE GitHub App on your organization to automatically register repositories.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onIndex={indexRepo}
              onRemove={removeRepo}
            />
          ))}
        </div>
      )}
    </div>
  );
}