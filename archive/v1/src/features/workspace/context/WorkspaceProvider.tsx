import React, { createContext, useState, useEffect } from 'react';
import { Workspace } from '../../../shared/types';
import { WorkspaceService } from '../../../shared/services/WorkspaceService';

export interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWorkspaces = async () => {
      try {
        const list = await WorkspaceService.getWorkspaces();
        const active = await WorkspaceService.getActiveWorkspace();
        setWorkspaces(list);
        setActiveWorkspace(active);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize workspaces.');
      } finally {
        setLoading(false);
      }
    };
    initWorkspaces();
  }, []);

  const switchWorkspace = async (workspaceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const active = await WorkspaceService.switchWorkspace(workspaceId);
      setActiveWorkspace(active);
    } catch (err: any) {
      setError(err.message || 'Failed to switch workspace.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: WorkspaceContextType = {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    loading,
    error,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export default WorkspaceProvider;
