import { describe, it, expect } from 'vitest';

// We test the blast-radius module by mocking at the lowest level
// Import the mocked modules first
vi.mock('../../utils/db', () => {
  const getImportersOf = vi.fn();
  return {
    EdgeQueries: { getImportersOf },
    __mocks: { getImportersOf },
  };
});

vi.mock('../risk-scorer', () => {
  return {
    scoreRisk: vi.fn(({ impactedFilesCount, impactedServicesCount, entryPointsAffected, maxDepth }) => {
      let score = 0;
      if (entryPointsAffected) score += 35;
      score += Math.min(impactedServicesCount * 10, 30);
      score += Math.min(maxDepth * 2, 10);
      score += Math.min(impactedFilesCount, 20);
      score = Math.min(score, 100);
      let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (score >= 76) level = 'critical';
      else if (score >= 51) level = 'high';
      else if (score >= 26) level = 'medium';
      return { score, level };
    }),
    isEntryPoint: vi.fn((filePath: string) => {
      return /\.(controller|route|handler|lambda)\.(ts|js)$/.test(filePath) ||
             /\/pages\/.*\.(ts|tsx|js|jsx)$/.test(filePath) ||
             /\/app\/.*\/route\.(ts|js)$/.test(filePath);
    }),
    detectService: vi.fn((filePath: string) => {
      const appsMatch = filePath.match(/(?:apps|packages)\/([^/]+)\//);
      if (appsMatch) return appsMatch[1];
      return 'core';
    }),
    generateRecommendations: vi.fn(() => ['Standard review recommended.']),
  };
});

import { calculateBlastRadius, formatPRComment } from '../blast-radius';
import { EdgeQueries } from '../../utils/db';

const mockDb = {} as any;
const getImportersOf = (EdgeQueries.getImportersOf as any);

describe('calculateBlastRadius', () => {
  beforeEach(() => {
    getImportersOf.mockReset();
  });

  it('should return empty blast radius for a file with no importers', async () => {
    getImportersOf.mockReturnValue([]);

    const result = await calculateBlastRadius(
      [{ filePath: 'src/utils/helper.ts', symbolName: 'helperFn', changeType: 'modified' }],
      mockDb,
    );

    expect(result.totalImpactedFiles).toBe(0);
    expect(result.dependencyChain).toEqual([]);
    expect(result.entryPointsAffected).toBe(false);
  });

  it('should find downstream dependents via BFS', async () => {
    getImportersOf.mockImplementation((_db: any, target: string) => {
      const graph: Record<string, Array<{ source_file: string }>> = {
        'src/auth.ts': [
          { source_file: 'src/services/userService.ts' },
          { source_file: 'src/api/handler.ts' },
        ],
        'src/services/userService.ts': [
          { source_file: 'src/controllers/auth.controller.ts' },
        ],
      };
      return graph[target] || [];
    });

    const result = await calculateBlastRadius(
      [{ filePath: 'src/auth.ts', symbolName: 'authenticate', changeType: 'modified' }],
      mockDb,
    );

    expect(result.totalImpactedFiles).toBe(3);
    expect(result.dependencyChain).toHaveLength(3);
    // Should find depth 1 and depth 2 entries
    const depths = result.dependencyChain.map(n => n.depth);
    expect(depths).toContain(1);
    expect(depths).toContain(2);
  });

  it('should limit BFS to MAX_DEPTH of 10', async () => {
    getImportersOf.mockImplementation((_db: any, target: string) => {
      const match = (target as string).match(/level(\d+)/);
      if (match) {
        const level = parseInt(match[1]);
        if (level < 15) return [{ source_file: `level${level + 1}.ts` }];
      }
      return [];
    });

    const result = await calculateBlastRadius(
      [{ filePath: 'level0.ts', symbolName: 'root', changeType: 'modified' }],
      mockDb,
    );

    // Should find at most 10 impacted files (levels 1-10)
    expect(result.totalImpactedFiles).toBeLessThanOrEqual(10);
    const maxDepth = result.dependencyChain.reduce((max, n) => Math.max(max, n.depth), 0);
    expect(maxDepth).toBeLessThanOrEqual(10);
  });

  it('should detect services for monorepo paths', async () => {
    getImportersOf.mockImplementation((_db: any, target: string) => {
      const graph: Record<string, Array<{ source_file: string }>> = {
        'packages/shared/src/types.ts': [
          { source_file: 'apps/cli/src/core/engine.ts' },
          { source_file: 'apps/web/src/lib/utils.ts' },
        ],
      };
      return graph[target] || [];
    });

    const result = await calculateBlastRadius(
      [{ filePath: 'packages/shared/src/types.ts', symbolName: 'Type', changeType: 'modified' }],
      mockDb,
    );

    const serviceNames = result.impactedServices.map(s => s.name);
    expect(serviceNames).toContain('cli');
    expect(serviceNames).toContain('web');
  });

  it('should detect entry points in the blast radius', async () => {
    getImportersOf.mockImplementation((_db: any, target: string) => {
      const graph: Record<string, Array<{ source_file: string }>> = {
        'src/config.ts': [
          { source_file: 'src/routes/auth.route.ts' },
          { source_file: 'src/routes/api.route.ts' },
        ],
      };
      return graph[target] || [];
    });

    const result = await calculateBlastRadius(
      [{ filePath: 'src/config.ts', symbolName: 'config', changeType: 'modified' }],
      mockDb,
    );

    expect(result.entryPointsAffected).toBe(true);
    expect(result.impactedServices.length).toBeGreaterThan(0);
  });

  it('should handle multiple changed files', async () => {
    getImportersOf.mockImplementation((_db: any, target: string) => {
      const graph: Record<string, Array<{ source_file: string }>> = {
        'src/a.ts': [{ source_file: 'src/dep1.ts' }],
        'src/b.ts': [{ source_file: 'src/dep2.ts' }],
      };
      return graph[target] || [];
    });

    const result = await calculateBlastRadius(
      [
        { filePath: 'src/a.ts', symbolName: 'fnA', changeType: 'modified' },
        { filePath: 'src/b.ts', symbolName: 'fnB', changeType: 'modified' },
      ],
      mockDb,
    );

    expect(result.totalImpactedFiles).toBeGreaterThanOrEqual(2);
  });
});

describe('formatPRComment', () => {
  it('should generate valid Markdown with all sections', () => {
    const result = {
      riskScore: 78,
      riskLevel: 'high' as const,
      impactedServices: [
        { name: 'auth-service', entryPoints: ['src/routes/login.ts'], trafficPerHour: 1000 },
      ],
      dependencyChain: [
        { file: 'src/utils/auth.ts', depth: 1, symbols: ['authenticate'] },
      ],
      totalImpactedFiles: 5,
      entryPointsAffected: true,
      recommendations: ['Run integration tests', 'Request senior review'],
    };

    const comment = formatPRComment(42, ['src/auth.ts', 'src/config.ts'], result);

    expect(comment).toContain('PR #42');
    expect(comment).toContain('78/100');
    expect(comment).toContain('HIGH');
    expect(comment).toContain('auth-service');
    expect(comment).toContain('Run integration tests');
    expect(comment).toContain('ACIE');
  });

  it('should handle low risk results', () => {
    const result = {
      riskScore: 12,
      riskLevel: 'low' as const,
      impactedServices: [],
      dependencyChain: [],
      totalImpactedFiles: 0,
      entryPointsAffected: false,
      recommendations: ['Standard review recommended.'],
    };

    const comment = formatPRComment(1, ['src/utils.ts'], result);

    expect(comment).toContain('12/100');
    expect(comment).toContain('LOW');
    expect(comment).toContain('No services affected');
  });
});
