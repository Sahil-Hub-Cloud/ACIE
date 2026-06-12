import React from 'react';

export const IntegrationSettings: React.FC = () => {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/20 p-4">
        <div className="space-y-1 pr-4">
          <span className="block font-sans text-xs font-bold text-white">GitHub Integration</span>
          <span className="block text-[10px] text-slate-500">ACIE Bot repository webhook connection</span>
        </div>
        <span className="rounded-full border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-400 shrink-0">
          CONNECTED
        </span>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/20 p-4">
        <div className="space-y-1 pr-4">
          <span className="block font-sans text-xs font-bold text-white">Slack Workspace Alert Hub</span>
          <span className="block text-[10px] text-slate-500">Target alerting channel hook</span>
        </div>
        <span className="rounded-full border border-slate-900 bg-slate-900/60 px-2.5 py-0.5 text-[9px] font-semibold text-slate-500 shrink-0">
          DISCONNECTED
        </span>
      </div>
    </div>
  );
};

export default IntegrationSettings;
