'use client';

import { useEffect, useState } from 'react';
import { useAnalysis } from '../../../hooks/use-analysis';
import Link from 'next/link';
import RiskScoreBadge from '../../../components/analysis/risk-score-badge';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function AnalysisPage() {
  const { analyses, loading, error, fetchAnalyses } = useAnalysis();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const filteredAnalyses = analyses.filter((a) => {
    const matchesSearch =
      a.repo_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.pr_title || '').toLowerCase().includes(search.toLowerCase()) ||
      a.pr_number.toString().includes(search);
      
    const matchesRisk = riskFilter === 'all' || a.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white mb-1">Audit Logs</h2>
        <p className="text-slate-500 text-xs font-semibold">Historical list of change analysis audits</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-3.5 text-slate-500"><Search className="w-4 h-4" /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PR title, number, or repo..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 text-xs focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'low', 'medium', 'high', 'critical'].map((tier) => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border uppercase tracking-wider transition-all select-none cursor-pointer ${
                riskFilter === tier
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">Syncing audit logs...</span>
        </div>
      ) : error ? (
        <div className="glass p-6 rounded-2xl border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Error loading audit logs: {error}</span>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="text-center py-20 text-slate-500 italic text-sm">
          No matching analysis audit records found.
        </div>
      ) : (
        <div className="glass p-6 rounded-[24px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Repository</th>
                  <th className="pb-3">Pull Request</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Impacted Services</th>
                  <th className="pb-3 pr-2 text-right">Analyzed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAnalyses.map((analysis) => {
                  const serviceCount = analysis.impacted_services?.length ?? 0;
                  const date = new Date(analysis.created_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={analysis.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <td className="py-4 pl-2 font-bold text-slate-300">
                        {analysis.repo_name}
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/analysis/${analysis.id}`}
                          className="text-white hover:text-accent font-semibold flex flex-col group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>#{analysis.pr_number} — {analysis.pr_title || 'PR Audit'}</span>
                          <span className="text-[10px] text-slate-500 font-normal">by {analysis.pr_author || 'App Webhook'}</span>
                        </Link>
                      </td>
                      <td className="py-4">
                        <RiskScoreBadge level={analysis.risk_level} score={analysis.risk_score} />
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-slate-300">
                          {serviceCount} Services
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right text-slate-500 font-mono">
                        {date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
