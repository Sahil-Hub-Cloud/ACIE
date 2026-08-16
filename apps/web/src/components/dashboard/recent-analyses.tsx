'use client';

import Link from 'next/link';
import RiskScoreBadge from '../analysis/risk-score-badge';

interface RecentAnalysesProps {
  analyses: any[];
}

export default function RecentAnalyses({ analyses }: RecentAnalysesProps) {
  return (
    <div className="glass p-6 rounded-[24px] overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Recent PR Audits
        </h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
          Last {analyses.length} events
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
              <th className="pb-3 pl-2">Repository</th>
              <th className="pb-3">Pull Request</th>
              <th className="pb-3">Risk Assessment</th>
              <th className="pb-3">Impacted Services</th>
              <th className="pb-3 pr-2 text-right">Analyzed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {analyses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                  No PR analyses completed yet. Integrate GitHub App to begin scanning.
                </td>
              </tr>
            ) : (
              analyses.map((analysis) => {
                const serviceCount = analysis.impacted_services?.length ?? 0;
                const date = new Date(analysis.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={analysis.id}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="py-4 pl-2 font-bold text-slate-300">
                      {analysis.repo_name}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/analysis/${analysis.id}`}
                        className="text-white hover:text-accent font-semibold flex flex-col group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>#{analysis.pr_number} — {analysis.pr_title || 'PR Audit'}</span>
                        <span className="text-[10px] text-slate-500 font-normal">by {analysis.pr_author || 'GitHub App'}</span>
                      </Link>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <RiskScoreBadge level={analysis.risk_level} score={analysis.risk_score} />
                      </div>
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
