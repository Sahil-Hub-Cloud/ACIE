export interface AuditRecord {
  id: string;
  repository: string;
  prNumber: number;
  author: string;
  timestamp: string;
  prUrl?: string;
  prTitle?: string;
  securityScore?: number;
  qualityScore?: number;
  healthScore?: number;
  dependencyCount?: number;
  dependencyRisk?: string;
  rootCause?: string;
  suggestedFix?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
