import { Workspace } from '../types';
import { WorkspaceStorage } from '../../auth/storage/WorkspaceStorage';

export class WorkspaceService {
  static async getWorkspaces(): Promise<Workspace[]> {
    return new Promise((resolve) => {
      resolve(WorkspaceStorage.getWorkspaces());
    });
  }

  static async getActiveWorkspace(): Promise<Workspace | null> {
    return new Promise((resolve) => {
      const workspaces = WorkspaceStorage.getWorkspaces();
      const activeId = WorkspaceStorage.getActiveWorkspaceId();
      const active = workspaces.find((w) => w.id === activeId) || workspaces[0] || null;
      resolve(active);
    });
  }

  static async switchWorkspace(workspaceId: string): Promise<Workspace> {
    return new Promise((resolve, reject) => {
      const workspaces = WorkspaceStorage.getWorkspaces();
      const match = workspaces.find((w) => w.id === workspaceId);
      if (match) {
        WorkspaceStorage.setActiveWorkspaceId(workspaceId);
        resolve(match);
      } else {
        reject(new Error(`Workspace ID ${workspaceId} not found.`));
      }
    });
  }
}
export default WorkspaceService;
