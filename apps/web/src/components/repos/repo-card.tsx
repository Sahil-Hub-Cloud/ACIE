'use client';

import { FolderGit2, Trash2, RefreshCw, Calendar, Link2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface RepoCardProps {
  repo: {
    id: number;
    github_id: number;
    name: string;
    owner: string;
    url: string;
    language: string;
    is_monorepo: boolean;
    monorepo_tool: string | null;
    last_indexed_at: string | null;
  };
  onIndex: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}

export default function RepoCard({ repo, onIndex, onRemove }: RepoCardProps) {
  const [indexing, setIndexing] = useState(false);

  const handleIndex = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIndexing(true);
    try {
      await onIndex(repo.id);
    } finally {
      setTimeout(() => setIndexing(false), 2000);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`Are you sure you want to remove ${repo.owner}/${repo.name}?`)) {
      await onRemove(repo.id);
    }
  };

  const formattedDate = repo.last_indexed_at
    ? new Date(repo.last_indexed_at).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never Indexed';

  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 hover:shadow-2xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <Link
          href={`/repos/${repo.id}`}
          className="flex items-center gap-2.5 text-white hover:text-accent font-bold text-base transition-colors"
        >
          <FolderGit2 className="w-5 h-5 text-indigo-400" />
          <span>{repo.owner} / {repo.name}</span>
        </Link>
        <button
          onClick={handleRemove}
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3.5 mb-6 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Primary Language</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-white">
            {repo.language}
          </span>
        </div>

        {repo.is_monorepo && (
          <div className="flex justify-between items-center text-slate-400">
            <span>Monorepo Tool</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 font-bold text-[10px] text-indigo-300 uppercase">
              {repo.monorepo_tool || 'Lerna'}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-400">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Index Status</span>
          <span className="font-mono text-slate-300">{formattedDate}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleIndex}
          disabled={indexing}
          className="flex-1 glass py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/5 transition-all border-white/10 group cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ${indexing ? 'animate-spin' : ''}`} />
          {indexing ? 'Indexing...' : 'Sync Graph'}
        </button>

        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="px-3 glass rounded-xl flex items-center justify-center hover:bg-white/5 transition-all border-white/10"
        >
          <Link2 className="w-4 h-4 text-slate-400 hover:text-white" />
        </a>
      </div>
    </div>
  );
}
