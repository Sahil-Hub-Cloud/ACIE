// Graph node types
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
