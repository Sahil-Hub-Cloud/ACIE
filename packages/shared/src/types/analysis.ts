import type { BlastRadiusResult } from './graph';

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
