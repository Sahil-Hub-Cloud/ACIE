import React from 'react';

export interface EmptyStateProps {
  type: 'no-repo' | 'no-scans' | 'db-offline' | 'no-history';
  onAction?: () => void;
}

const emptyStateConfig = {
  'no-repo': {
    title: 'No Repository Connected',
    description: 'Connect a GitHub repository to enable ACIE dependency mapping, risk calculation, and real-time pull request auditing.',
    buttonText: 'Connect Repository',
    icon: (
      <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
      </svg>
    ),
  },
  'no-scans': {
    title: 'No Scanning Activity Yet',
    description: 'This repository has not been audited. Open a new pull request or trigger a manual commit scan to check architecture changes.',
    buttonText: 'Trigger Scan',
    icon: (
      <svg className="w-12 h-12 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6-6m0 0l6 6m-6-6v12m0 0H9m3 0h3M3 17a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3z" />
      </svg>
    ),
  },
  'db-offline': {
    title: 'Telemetry Database Unreachable',
    description: 'Failed to synchronize workspace logs with the JSONBin database. Please check your network credentials or status API.',
    buttonText: 'Check System Status',
    icon: (
      <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  'no-history': {
    title: 'No Scan History Found',
    description: 'No telemetry log history could be located in your cloud workspace. Run your first pipeline execution to generate reports.',
    buttonText: 'View Setup Guide',
    icon: (
      <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const config = emptyStateConfig[type];

  // Protect against undefined parameters
  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-400">
        <p className="font-semibold text-white">System Error</p>
        <p className="text-sm">Requested view parameter is invalid.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl max-w-lg mx-auto">
      {/* Icon Frame with glowing drop shadow */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900/80 border border-slate-800 shadow-[0_0_20px_rgba(6,182,212,0.1)] mb-6 shrink-0">
        {config.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white tracking-tight leading-6 mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
        {config.description}
      </p>

      {/* CTA Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_4px_24px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all duration-200"
        >
          {config.buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
