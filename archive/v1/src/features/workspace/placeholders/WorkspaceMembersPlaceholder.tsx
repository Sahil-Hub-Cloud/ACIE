import React from 'react';
import { SkeletonCard } from '../../../shared/ui/SkeletonCard';

export const WorkspaceMembersPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Workspace Membership List
        </h4>
        <span className="text-[9px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40 font-mono">Placeholder Only</span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-2">
        A list of team members, invitation records, and permission mappings for this workspace will load here.
      </p>
      <SkeletonCard variant="list" className="bg-slate-950/20 w-full" />
    </div>
  );
};
export default WorkspaceMembersPlaceholder;
