import { Workspace } from '../../shared/types';

const WORKSPACE_KEY = 'acie_active_workspace';

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-01',
    name: 'ACIE Core Dev',
    repositories: ['ACIE-Enterprise', 'ACIE-Core', 'acie-bot'],
  },
  {
    id: 'ws-02',
    name: 'Beta Production',
    repositories: ['ACIE-Staging', 'ACIE-Gateway', 'auth-service'],
  },
];

export class WorkspaceStorage {
  static getWorkspaces(): Workspace[] {
    return MOCK_WORKSPACES;
  }

  static getActiveWorkspaceId(): string | null {
    try {
      const activeId = localStorage.getItem(WORKSPACE_KEY);
      if (!activeId) {
        // Default to first workspace if not set
        return MOCK_WORKSPACES[0].id;
      }
      return activeId;
    } catch (e) {
      console.error('Failed to get active workspace ID:', e);
      return MOCK_WORKSPACES[0].id;
    }
  }

  static setActiveWorkspaceId(id: string | null): void {
    try {
      if (!id) {
        localStorage.removeItem(WORKSPACE_KEY);
      } else {
        localStorage.setItem(WORKSPACE_KEY, id);
      }
    } catch (e) {
      console.error('Failed to set active workspace ID:', e);
    }
  }
}
export default WorkspaceStorage;
