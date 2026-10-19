import { describe, it, expect } from 'vitest';
import { calculateBlastRadius, type BlastRadiusInput } from '../src/graph/blast-radius';

describe('calculateBlastRadius', () => {
  const createEdge = (source: string, target: string) => ({ sourceFile: source, targetFile: target });

  it('should return low risk for single file with no dependencies', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/helper.ts'],
      changedSymbols: [{ filePath: 'src/utils/helper.ts', symbolName: 'formatDate', changeType: 'modified' }],
      edges: [],
    };

    const result = calculateBlastRadius(input);

    expect(result.riskLevel).toBe('low');
    expect(result.totalImpactedFiles).toBe(0);
    expect(result.dependencyChain).toHaveLength(0);
    expect(result.entryPointsAffected).toBe(false);
  });

  it('should find direct importers at depth 1', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/helper.ts'],
      changedSymbols: [{ filePath: 'src/utils/helper.ts', symbolName: 'formatDate', changeType: 'modified' }],
      edges: [
        createEdge('src/services/user.ts', 'src/utils/helper.ts'),
        createEdge('src/services/order.ts', 'src/utils/helper.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    expect(result.totalImpactedFiles).toBe(2);
    expect(result.dependencyChain).toHaveLength(2);
    expect(result.dependencyChain.every(n => n.depth === 1)).toBe(true);
    expect(result.impactedServices.length).toBeGreaterThan(0);
  });

  it('should find transitive importers at depth 2', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/helper.ts'],
      changedSymbols: [{ filePath: 'src/utils/helper.ts', symbolName: 'formatDate', changeType: 'modified' }],
      edges: [
        createEdge('src/services/user.ts', 'src/utils/helper.ts'),
        createEdge('src/controllers/user.ts', 'src/services/user.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    expect(result.totalImpactedFiles).toBe(2);
    const depths = result.dependencyChain.map(n => n.depth).sort();
    expect(depths).toEqual([1, 2]);
  });

  it('should detect entry points in blast radius', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/auth.ts'],
      changedSymbols: [{ filePath: 'src/utils/auth.ts', symbolName: 'checkAuth', changeType: 'modified' }],
      edges: [
        createEdge('src/controllers/auth.controller.ts', 'src/utils/auth.ts'),
        createEdge('src/services/user.ts', 'src/utils/auth.ts'),
        createEdge('src/services/order.ts', 'src/utils/auth.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    expect(result.entryPointsAffected).toBe(true);
    // entry point (35) + 3 services (30) + depth 1 (2) + 3 files (3) + 1 symbol (1) = 71 -> high
    expect(result.riskLevel).toBe('high');
    expect(result.impactedServices.some(s => s.entryPoints.length > 0)).toBe(true);
  });

  it('should respect MAX_DEPTH of 10', () => {
    const edges = [];
    for (let i = 0; i < 15; i++) {
      edges.push(createEdge(`src/file${i + 1}.ts`, `src/file${i}.ts`));
    }

    const input: BlastRadiusInput = {
      changedFiles: ['src/file0.ts'],
      changedSymbols: [{ filePath: 'src/file0.ts', symbolName: 'fn', changeType: 'modified' }],
      edges,
    };

    const result = calculateBlastRadius(input);

    expect(result.totalImpactedFiles).toBeLessThanOrEqual(10);
    expect(Math.max(...result.dependencyChain.map(n => n.depth))).toBeLessThanOrEqual(10);
  });

  it('should detect multiple services', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['packages/shared/src/utils.ts'],
      changedSymbols: [{ filePath: 'packages/shared/src/utils.ts', symbolName: 'sharedFn', changeType: 'modified' }],
      edges: [
        createEdge('apps/cli/src/command.ts', 'packages/shared/src/utils.ts'),
        createEdge('apps/web/src/component.tsx', 'packages/shared/src/utils.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    expect(result.impactedServices.length).toBe(2);
    const serviceNames = result.impactedServices.map(s => s.name).sort();
    expect(serviceNames).toEqual(['cli', 'web']);
  });

  it('should include symbols in dependency chain', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/date.ts'],
      changedSymbols: [
        { filePath: 'src/utils/date.ts', symbolName: 'formatDate', changeType: 'removed' },
        { filePath: 'src/utils/date.ts', symbolName: 'parseDate', changeType: 'modified' },
      ],
      edges: [
        createEdge('src/services/report.ts', 'src/utils/date.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    expect(result.dependencyChain[0].symbols).toContain('formatDate');
    expect(result.dependencyChain[0].symbols).toContain('parseDate');
  });

  it('should handle removed exports with higher risk', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/date.ts'],
      changedSymbols: [
        { filePath: 'src/utils/date.ts', symbolName: 'formatDate', changeType: 'removed' },
      ],
      edges: [
        createEdge('src/services/report.ts', 'src/utils/date.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    const recs = result.recommendations.join(' ');
    expect(recs).toContain('Removed exports');
    expect(recs).toContain('formatDate');
  });

  it('should handle removed exports in recommendations', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/utils/helper.ts'],
      changedSymbols: [
        { filePath: 'src/utils/helper.ts', symbolName: 'oldFn', changeType: 'removed' },
      ],
      edges: [
        createEdge('src/consumer.ts', 'src/utils/helper.ts'),
      ],
    };

    const result = calculateBlastRadius(input);

    const recs = result.recommendations.join(' ');
    expect(recs).toContain('Removed exports');
  });

  it('should generate recommendations for high risk', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/core/base.ts'],
      changedSymbols: [
        { filePath: 'src/core/base.ts', symbolName: 'BaseClass', changeType: 'modified' },
      ],
      // Create enough edges to push risk to high (entry point + many files)
      edges: [
        createEdge('src/controllers/main.controller.ts', 'src/core/base.ts'),
        ...Array.from({ length: 15 }, (_, i) => createEdge(`src/service${i}.ts`, 'src/core/base.ts')),
      ],
    };

    const result = calculateBlastRadius(input);

    expect(result.riskLevel).toBe('high');
    const recs = result.recommendations.join(' ');
    expect(recs).toContain('senior engineers');
  });

  it('should not crash on empty edges', () => {
    const input: BlastRadiusInput = {
      changedFiles: ['src/isolated.ts'],
      changedSymbols: [{ filePath: 'src/isolated.ts', symbolName: 'fn', changeType: 'modified' }],
      edges: [],
    };

    const result = calculateBlastRadius(input);

    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});