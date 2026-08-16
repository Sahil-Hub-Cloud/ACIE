export interface Repo {
  id: number;
  githubId: number;
  name: string;
  owner: string;
  url: string;
  language: string;
  isMonorepo: boolean;
  monorepoTool: 'nx' | 'turbo' | 'pnpm' | 'yarn' | null;
  lastIndexedAt: string | null;
  createdAt: string;
}

export interface RepoStats {
  totalFiles: number;
  totalNodes: number;
  totalEdges: number;
  totalServices: number;
  totalAnalyses: number;
  avgRiskScore: number;
}
