'use client';

import { useEffect } from 'react';
import { useAnalysis } from '../../../../hooks/use-analysis';
import RiskScoreBadge from '../../../../components/analysis/risk-score-badge';
import BlastRadiusView from '../../../../components/analysis/blast-radius-view';
import { Loader2, AlertCircle, Calendar, ExternalLink, FileCode, CheckSquare, GitPullRequest } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisDetailPage({ params }: { params: { id: string } }) {
  const analysisId = parseInt(params.id, 10);
  const { activeAnalysis, loading, error, fetchAnalysis } = useAnalysis();

  useEffect(() => {
    fetchAnalysis(analysisId);
  }, [analysisId, fetchAnalysis]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-xs text-slate-500 font-mono tracking-wider">Syncing audit logs...</span>
      </div>
    );
  }

  if (error || !activeAnalysis) {
    return (
      <div className="glass p-6 rounded-2xl border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <span>Failed to load audit logs: {error || 'Analysis record not found'}</span>
      </div>
    );
  }

  const date = new Date(activeAnalysis.created_at).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Overview Header Card */}
      <div className="glass p-6 rounded-2xl border-t-white/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
            <GitPullRequest className="w-4 h-4 text-accent" />
            Pull Request Audit
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            #{activeAnalysis.pr_number} — {activeAnalysis.pr_title || 'PR Analysis'}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span>by {activeAnalysis.pr_author || 'GitHub App'}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <RiskScoreBadge level={activeAnalysis.risk_level} score={activeAnalysis.risk_score} />
          <a
            href={activeAnalysis.pr_url}
            target="_blank"
            rel="noreferrer"
            className="bg-white text-black font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all uppercase tracking-widest cursor-pointer select-none"
          >
            <span>GitHub PR</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recommendations & Changed Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendations Card */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              AI Impact Recommendations
            </h3>
            <ul className="space-y-3">
              {(activeAnalysis.recommendations || []).map((rec: string, idx: number) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                  <span className="text-emerald-500 font-extrabold select-none">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Changed Files Card */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Changed Files ({(activeAnalysis.changed_files || []).length})
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {(activeAnalysis.changed_files || []).map((file: any, idx: number) => (
                <div key={idx} className="glass-inner p-3 rounded-xl border border-white/5 bg-slate-950/20 flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <div className="font-mono text-white truncate max-w-[320px] font-bold" title={file.filename}>
                      {file.filename.split('/').pop()}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[320px]" title={file.filename}>
                      {file.filename}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      file.status === 'added' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                      file.status === 'removed' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                      'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                    }`}>
                      {file.status}
                    </span>
                    {(file.additions > 0 || file.deletions > 0) && (
                      <span className="font-mono text-[10px]">
                        <span className="text-emerald-500">+{file.additions}</span>
                        <span className="text-rose-500"> -{file.deletions}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Blast Radius tree */}
        <div className="lg:col-span-1">
          {activeAnalysis.blast_radius ? (
            <BlastRadiusView blastRadius={activeAnalysis.blast_radius} />
          ) : (
            <div className="glass p-6 rounded-2xl text-center text-slate-500 italic text-xs">
              No blast radius data computed for this audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
