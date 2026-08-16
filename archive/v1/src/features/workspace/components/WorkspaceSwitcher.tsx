import React, { useContext, useState } from 'react';
import { WorkspaceContext } from '../context/WorkspaceProvider';

export const WorkspaceSwitcher: React.FC = () => {
  const context = useContext(WorkspaceContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!context) return null;
  const { workspaces, activeWorkspace, switchWorkspace, loading } = context;

  const handleSelect = async (id: string) => {
    setIsOpen(false);
    if (activeWorkspace?.id === id) return;
    try {
      await switchWorkspace(id);
    } catch (e) {
      console.error('Switcher failed to switch workspace:', e);
    }
  };

  return (
    <div className="relative inline-block text-left font-mono">
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2.5 rounded-xl border border-slate-900 bg-slate-950/40 p-2 pr-3.5 text-xs text-slate-300 hover:bg-slate-900/60 hover:text-white transition-all duration-200 disabled:opacity-50"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400">
          WS
        </div>
        <span className="max-w-[120px] truncate font-semibold">
          {activeWorkspace?.name || 'Loading...'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-30" />
          <div className="absolute right-0 mt-2 z-40 w-52 origin-top-right rounded-xl border border-slate-900 bg-slate-950 p-2.5 shadow-2xl backdrop-blur-md">
            <div className="border-b border-slate-900 pb-2 mb-2">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold px-2">
                Switch Active Project
              </span>
            </div>
            <div className="space-y-1">
              {workspaces.map((ws) => {
                const isActive = activeWorkspace?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => handleSelect(ws.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-cyan-400 font-semibold border-l-2 border-cyan-500'
                        : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
