import React, { useState, useMemo } from 'react';
import { AuditRecord } from '../../../shared/types';

export interface ForensicTimelineProps {
  records: AuditRecord[];
  onSelectRecord?: (record: AuditRecord) => void;
}

const severityConfig = {
  low: { text: 'Low', badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30' },
  medium: { text: 'Medium', badge: 'bg-amber-950/40 text-amber-400 border-amber-800/30' },
  high: { text: 'High', badge: 'bg-rose-950/40 text-rose-400 border-rose-800/30' },
  critical: { text: 'Critical', badge: 'bg-violet-950/40 text-violet-400 border-violet-800/30 shadow-[0_0_10px_rgba(167,139,250,0.15)] animate-pulse' },
};

export const ForensicTimeline: React.FC<ForensicTimelineProps> = ({
  records = [],
  onSelectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Filter records dynamically based on PR, repo, author, or rootCause
  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return records;

    return records.filter((r) => {
      const prStr = String(r.prNumber ?? '');
      const repoStr = String(r.repository ?? '').toLowerCase();
      const authorStr = String(r.author ?? '').toLowerCase();
      const causeStr = String(r.rootCause ?? '').toLowerCase();
      const titleStr = String(r.prTitle ?? '').toLowerCase();

      return (
        prStr.includes(query) ||
        repoStr.includes(query) ||
        authorStr.includes(query) ||
        causeStr.includes(query) ||
        titleStr.includes(query)
      );
    });
  }, [records, searchQuery]);

  // Group records by Date (e.g. "June 9, 2026")
  const groupedRecords = useMemo(() => {
    const groups: Record<string, AuditRecord[]> = {};
    
    filteredRecords.forEach((record) => {
      const date = new Date(record.timestamp);
      const groupKey = isNaN(date.getTime()) 
        ? 'Standby / Offline Records'
        : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(record);
    });

    return groups;
  }, [filteredRecords]);

  const toggleExpand = (record: AuditRecord) => {
    setExpandedRecordId(expandedRecordId === record.id ? null : record.id);
    if (onSelectRecord) {
      onSelectRecord(record);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Dynamic Search Interface */}
      <div className="relative flex items-center">
        <span className="absolute left-4 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter logs by PR#, repository, author, or root cause..."
          className="w-full rounded-xl border border-slate-900 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 backdrop-blur-md focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dynamic Results Grid */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-900/60 bg-slate-950/20 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-slate-600 mb-3 animate-pulse">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h4 className="text-sm font-semibold text-slate-300">No matching search query found</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">Refine your search input or clear filters to view historical scan metrics.</p>
        </div>
      ) : (
        <div className="space-y-8 relative pl-4 md:pl-6 before:absolute before:inset-y-1 before:left-1.5 md:before:left-2.5 before:w-0.5 before:bg-slate-900">
          {Object.entries(groupedRecords).map(([dateLabel, groupItems]) => (
            <div key={dateLabel} className="space-y-4 relative">
              {/* Group Date Header with timeline dot indicator */}
              <div className="flex items-center -ml-7 md:-ml-9">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border-2 border-cyan-500 shadow-[0_0_8px_#06b6d4] z-10 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <h3 className="ml-4 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/20 border border-cyan-900/50 rounded-full px-3 py-1">
                  {dateLabel}
                </h3>
              </div>

              {/* Group Timeline Cards */}
              <div className="space-y-3.5">
                {groupItems.map((record) => {
                  const isExpanded = expandedRecordId === record.id;
                  const severity = record.severity || 'low';
                  const sev = severityConfig[severity];

                  return (
                    <div
                      key={record.id}
                      className={`group rounded-xl border border-slate-900 bg-slate-950/20 p-5 hover:border-slate-800 hover:bg-slate-900/10 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                        isExpanded ? 'border-slate-800 bg-slate-900/10 shadow-[0_8px_24px_rgba(0,0,0,0.3)]' : ''
                      }`}
                      onClick={() => toggleExpand(record)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Summary Info Header */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-400">
                              #{record.prNumber}
                            </span>
                            <span className="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm truncate max-w-[280px] sm:max-w-md">
                              {record.prTitle || 'Repository Audit Triggered'}
                            </span>
                            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${sev.badge}`}>
                              {sev.text}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <span className="font-medium text-slate-400">@{record.author}</span>
                            <span className="text-slate-700 font-bold select-none">•</span>
                            <span className="truncate">{record.repository}</span>
                          </div>
                        </div>

                        {/* Expand Trigger Details Action */}
                        <div className="flex items-center space-x-4 shrink-0 justify-end">
                          {record.healthScore !== undefined && (
                            <div className="text-right">
                              <span className="block font-mono text-xs font-extrabold text-white">
                                {record.healthScore}%
                              </span>
                              <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-500">
                                System Health
                              </span>
                            </div>
                          )}
                          
                          <button
                            className={`rounded-lg p-1 text-slate-500 hover:bg-slate-800/50 hover:text-white transition-all ${
                              isExpanded ? 'rotate-180 text-cyan-400' : ''
                            }`}
                            aria-label="Expand audit details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Expandable details segment */}
                      {isExpanded && (
                        <div className="mt-5 border-t border-slate-900 pt-5 space-y-4 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Heuristics metrics details */}
                            <div className="space-y-1 rounded-lg border border-slate-900/60 bg-slate-950/40 p-3.5">
                              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-500">Root Cause Heuristics</span>
                              <span className="block text-xs font-bold text-slate-200">
                                {record.rootCause || 'No architectural anomaly identified'}
                              </span>
                            </div>

                            <div className="space-y-1 rounded-lg border border-slate-900/60 bg-slate-950/40 p-3.5">
                              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-500">Impact Analysis</span>
                              <span className="block text-xs font-bold text-slate-200">
                                {record.dependencyCount ?? 0} affected file nodes ({record.dependencyRisk || 'Low'} Risk)
                              </span>
                            </div>

                            <div className="space-y-1 rounded-lg border border-slate-900/60 bg-slate-950/40 p-3.5 md:col-span-2 lg:col-span-1">
                              <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-500">Security & Quality</span>
                              <div className="flex items-center space-x-4 pt-0.5">
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Security</span>
                                  <span className="text-xs font-bold text-emerald-400 font-mono">{record.securityScore ?? 100}%</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Quality</span>
                                  <span className="text-xs font-bold text-cyan-400 font-mono">{record.qualityScore ?? 100}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Recommendation */}
                          {record.suggestedFix && (
                            <div className="rounded-lg border border-cyan-950/30 bg-cyan-950/5 p-4">
                              <span className="block text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold mb-1">Recommended Remediations</span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {record.suggestedFix}
                              </p>
                            </div>
                          )}

                          {/* Action PR Link */}
                          {record.prUrl && (
                            <div className="flex justify-end pt-2">
                              <a
                                href={record.prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>Inspect Pull Request</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForensicTimeline;
