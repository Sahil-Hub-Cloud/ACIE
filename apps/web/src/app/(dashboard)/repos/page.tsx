'use client';

import { useEffect, useState } from 'react';
import { useRepos } from '../../../hooks/use-repos';
import RepoCard from '../../../components/repos/repo-card';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';

export default function ReposPage() {
  const { repos, loading, error, fetchRepos, addRepo, removeRepo, indexRepo } = useRepos();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    url: '',
    language: 'TypeScript',
    isMonorepo: false,
    monorepoTool: 'pnpm',
  });

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRepo({
      githubId: Math.floor(Math.random() * 1000000), // mock GitHub ID for local registry
      ...formData,
    });
    setFormData({
      name: '',
      owner: '',
      url: '',
      language: 'TypeScript',
      isMonorepo: false,
      monorepoTool: 'pnpm',
    });
    setShowAddForm(false);
  };

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
          <p className="text-slate-500 text-xs font-semibold">Indexed repositories and dependency models</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white text-black font-black px-5 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" /> Register Repo
        </button>
      </div>

      {showAddForm && (
        <div className="glass p-6 rounded-2xl border border-accent/20 bg-accent/5">
          <h3 className="font-bold text-sm mb-4">Add Repository Definition</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Repo Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent"
                placeholder="acie"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Owner / Org</label>
              <input
                type="text"
                required
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent"
                placeholder="Sahil-Hub-Cloud"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">GitHub HTML URL</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent"
                placeholder="https://github.com/Sahil-Hub-Cloud/ACIE"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Go">Go</option>
              </select>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isMonorepo}
                  onChange={(e) => setFormData({ ...formData, isMonorepo: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 accent-accent"
                />
                <span className="text-xs text-slate-300">Monorepo Project</span>
              </label>
              {formData.isMonorepo && (
                <select
                  value={formData.monorepoTool}
                  onChange={(e) => setFormData({ ...formData, monorepoTool: e.target.value })}
                  className="bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="pnpm">pnpm workspaces</option>
                  <option value="turbo">Turborepo</option>
                  <option value="nx">Nx</option>
                  <option value="yarn">Yarn workspaces</option>
                </select>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-bold hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      )}

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
          No matching repositories registered. Register a repository configuration to build the code graph.
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
