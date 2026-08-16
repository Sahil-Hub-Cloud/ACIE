import React from 'react';
import { EmptyState } from '../../../shared/ui/EmptyState';

export const AuditCenterPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
          Compliance & Config Audit Center
        </h3>
        <span className="text-[9px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40 font-mono">Placeholder Only</span>
      </div>
      <EmptyState type="no-history" />
    </div>
  );
};
export default AuditCenterPlaceholder;
