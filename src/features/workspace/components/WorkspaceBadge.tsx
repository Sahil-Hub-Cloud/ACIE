import React, { useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceProvider';

export const WorkspaceBadge: React.FC = () => {
  const context = useContext(WorkspaceContext);
  if (!context) return null;
  const { activeWorkspace } = context;

  if (!activeWorkspace) return null;

  return (
    <span className="hidden items-center space-x-1.5 rounded-full border border-slate-900 bg-slate-950/40 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:flex shrink-0">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
      <span>{activeWorkspace.repositories.length} Repos Active</span>
    </span>
  );
};

export default WorkspaceBadge;
