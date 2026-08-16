// ============================================================
// Inlined shared types — no workspace dependency needed
// This file is the single source of truth for the web app.
// ============================================================

// --- graph.ts ---
export type SymbolKind = 'function' | 'class' | 'interface' | 'type' | 'const' | 'variable';
export type EdgeType = 'imports' | 'calls' | 'extends' | 'implements';

export interface GraphNode {
  id: number;
  filePath: string;
  symbolName: string;
  symbolKind: SymbolKind;
  lineNumber: number | null;
  isExported: boolean;
  createdAt: string;
}

export interface GraphEdge {
  id: number;
  sourceFile: string;
  targetFile: string;
  edgeType: EdgeType;
  createdAt: string;
}

export interface GraphService {
  id: number;
  name: string;
  entryPoints: string[];
  trafficPerHour: number;
  errorRate: number;
  lastUpdated: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  services: GraphService[];
}

export interface BlastRadiusResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impactedServices: Array<{
    name: string;
    entryPoints: string[];
    trafficPerHour: number;
  }>;
  dependencyChain: Array<{
    file: string;
    depth: number;
    symbols: string[];
  }>;
  totalImpactedFiles: number;
  entryPointsAffected: boolean;
}

// --- analysis.ts ---
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ChangedFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface ChangedSymbol {
  filePath: string;
  symbolName: string;
  changeType: 'added' | 'modified' | 'removed';
}

export interface AnalysisResult {
  id: number;
  repoId: number;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  prAuthor: string;
  riskScore: number;
  riskLevel: RiskLevel;
  changedFiles: ChangedFile[];
  changedSymbols: ChangedSymbol[];
  blastRadius: BlastRadiusResult;
  impactedServices: string[];
  recommendations: string[];
  createdAt: string;
}

export interface AnalysisStats {
  totalAnalyses: number;
  highRiskCount: number;
  criticalRiskCount: number;
  avgRiskScore: number;
  incidentsPrevented: number;
  riskTrend: Array<{
    date: string;
    avgScore: number;
    count: number;
  }>;
}

export interface PRCommentPayload {
  riskLevel: RiskLevel;
  riskScore: number;
  changedFiles: ChangedFile[];
  blastRadius: BlastRadiusResult;
  recommendations: string[];
}

// --- repo.ts ---
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

// --- user.ts ---
export type UserRole = 'developer' | 'manager' | 'admin';

export interface User {
  id: number;
  githubId: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  userId: number;
  username: string;
  avatarUrl: string | null;
  role: UserRole;
  token: string;
}
