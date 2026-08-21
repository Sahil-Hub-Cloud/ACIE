import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scoreRisk,
  scoreToLevel,
  isEntryPoint,
  detectService,
  generateRecommendations,
} from '../risk-scorer';

describe('scoreRisk', () => {
  it('should return LOW risk (0-25) for minimal changes', () => {
    const result = scoreRisk({
      impactedFilesCount: 1,
      impactedServicesCount: 0,
      entryPointsAffected: false,
      maxDepth: 1,
      changedSymbolsCount: 1,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.level).toBe('low');
  });

  it('should return MEDIUM risk (26-50) for moderate changes', () => {
    const result = scoreRisk({
      impactedFilesCount: 8,
      impactedServicesCount: 1,
      entryPointsAffected: false,
      maxDepth: 3,
      changedSymbolsCount: 3,
    });

    expect(result.score).toBeGreaterThanOrEqual(26);
    expect(result.score).toBeLessThanOrEqual(50);
    expect(result.level).toBe('medium');
  });

  it('should return HIGH risk (51-75) for significant changes', () => {
    const result = scoreRisk({
      impactedFilesCount: 8,
      impactedServicesCount: 1,
      entryPointsAffected: true,
      maxDepth: 3,
      changedSymbolsCount: 3,
    });

    expect(result.score).toBeGreaterThanOrEqual(51);
    expect(result.score).toBeLessThanOrEqual(75);
    expect(result.level).toBe('high');
  });

  it('should return CRITICAL risk (76-100) for severe changes', () => {
    const result = scoreRisk({
      impactedFilesCount: 20,
      impactedServicesCount: 4,
      entryPointsAffected: true,
      maxDepth: 8,
      changedSymbolsCount: 10,
    });

    expect(result.score).toBeGreaterThanOrEqual(76);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.level).toBe('critical');
  });

  it('should never exceed score of 100', () => {
    const result = scoreRisk({
      impactedFilesCount: 100,
      impactedServicesCount: 20,
      entryPointsAffected: true,
      maxDepth: 50,
      changedSymbolsCount: 50,
    });

    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should weigh entry points heavily (+35 points)', () => {
    const withEntryPoint = scoreRisk({
      impactedFilesCount: 5,
      impactedServicesCount: 0,
      entryPointsAffected: true,
      maxDepth: 2,
      changedSymbolsCount: 2,
    });

    const withoutEntryPoint = scoreRisk({
      impactedFilesCount: 5,
      impactedServicesCount: 0,
      entryPointsAffected: false,
      maxDepth: 2,
      changedSymbolsCount: 2,
    });

    expect(withEntryPoint.score - withoutEntryPoint.score).toBe(35);
  });

  it('should cap service impact at 30 points', () => {
    const manyServices = scoreRisk({
      impactedFilesCount: 0,
      impactedServicesCount: 10,
      entryPointsAffected: false,
      maxDepth: 0,
      changedSymbolsCount: 0,
    });

    expect(manyServices.score).toBeLessThanOrEqual(30);
  });

  it('should cap depth contribution at 10 points', () => {
    const deepDepth = scoreRisk({
      impactedFilesCount: 0,
      impactedServicesCount: 0,
      entryPointsAffected: false,
      maxDepth: 100,
      changedSymbolsCount: 0,
    });

    expect(deepDepth.score).toBeLessThanOrEqual(10);
  });
});

describe('scoreToLevel', () => {
  it('should map 0-25 to low', () => {
    expect(scoreToLevel(0)).toBe('low');
    expect(scoreToLevel(12)).toBe('low');
    expect(scoreToLevel(25)).toBe('low');
  });

  it('should map 26-50 to medium', () => {
    expect(scoreToLevel(26)).toBe('medium');
    expect(scoreToLevel(38)).toBe('medium');
    expect(scoreToLevel(50)).toBe('medium');
  });

  it('should map 51-75 to high', () => {
    expect(scoreToLevel(51)).toBe('high');
    expect(scoreToLevel(63)).toBe('high');
    expect(scoreToLevel(75)).toBe('high');
  });

  it('should map 76-100 to critical', () => {
    expect(scoreToLevel(76)).toBe('critical');
    expect(scoreToLevel(88)).toBe('critical');
    expect(scoreToLevel(100)).toBe('critical');
  });
});

describe('isEntryPoint', () => {
  it('should identify controller files', () => {
    expect(isEntryPoint('src/auth.controller.ts')).toBe(true);
    expect(isEntryPoint('src/user.controller.js')).toBe(true);
  });

  it('should identify route files', () => {
    expect(isEntryPoint('src/routes/api.route.ts')).toBe(true);
    expect(isEntryPoint('src/routes/auth.route.js')).toBe(true);
  });

  it('should identify handler files', () => {
    expect(isEntryPoint('src/handler.ts')).toBe(true);
    expect(isEntryPoint('api/github.handler.js')).toBe(true);
  });

  it('should identify lambda files', () => {
    expect(isEntryPoint('src/lambda.ts')).toBe(true);
    expect(isEntryPoint('src/index.lambda.js')).toBe(true);
  });

  it('should identify Next.js pages (pattern-based)', () => {
    // pages/ directory pages
    expect(isEntryPoint('src/pages/Login.tsx')).toBe(true);
    expect(isEntryPoint('src/pages/Dashboard.tsx')).toBe(true);
  });

  it('should identify Next.js API routes', () => {
    expect(isEntryPoint('apps/web/src/app/api/auth/route.ts')).toBe(true);
  });

  it('should identify server and main entry files', () => {
    expect(isEntryPoint('src/server.ts')).toBe(true);
    expect(isEntryPoint('src/main.ts')).toBe(true);
  });

  it('should NOT identify regular source files as entry points', () => {
    expect(isEntryPoint('src/utils/helper.ts')).toBe(false);
    expect(isEntryPoint('src/services/auth.service.ts')).toBe(false);
    expect(isEntryPoint('src/models/user.model.ts')).toBe(false);
  });
});

describe('detectService', () => {
  it('should detect monorepo apps', () => {
    expect(detectService('apps/cli/src/core/engine.ts')).toBe('cli');
    expect(detectService('apps/web/src/app/page.tsx')).toBe('web');
    expect(detectService('packages/shared/src/index.ts')).toBe('shared');
  });

  it('should detect feature-based services', () => {
    expect(detectService('src/features/auth/service.ts')).toBe('auth');
    expect(detectService('src/features/payments/handler.ts')).toBe('payments');
  });

  it('should detect module-based services', () => {
    expect(detectService('src/modules/users/controller.ts')).toBe('users');
    expect(detectService('src/modules/orders/service.ts')).toBe('orders');
  });

  it('should detect domain-based services', () => {
    expect(detectService('src/auth/middleware.ts')).toBe('auth');
    expect(detectService('src/api/routes.ts')).toBe('api');
  });

  it('should default to core for unrecognized paths', () => {
    expect(detectService('lib/utils.ts')).toBe('core');
    expect(detectService('helpers/index.ts')).toBe('core');
  });
});

describe('generateRecommendations', () => {
  it('should warn about removed exports', () => {
    const recs = generateRecommendations({
      riskLevel: 'medium',
      entryPointsAffected: false,
      impactedServicesCount: 0,
      changedSymbols: [
        { symbolName: 'oldFunction', changeType: 'removed' },
      ],
    });

    expect(recs.some(r => r.includes('Removed exports'))).toBe(true);
    expect(recs.some(r => r.includes('oldFunction'))).toBe(true);
  });

  it('should warn about modified exports', () => {
    const recs = generateRecommendations({
      riskLevel: 'medium',
      entryPointsAffected: false,
      impactedServicesCount: 0,
      changedSymbols: [
        { symbolName: 'config', changeType: 'modified' },
      ],
    });

    expect(recs.some(r => r.includes('Modified exports'))).toBe(true);
  });

  it('should warn about entry points', () => {
    const recs = generateRecommendations({
      riskLevel: 'medium',
      entryPointsAffected: true,
      impactedServicesCount: 0,
      changedSymbols: [],
    });

    expect(recs.some(r => r.includes('Entry points'))).toBe(true);
  });

  it('should recommend coordinated deployment for many services', () => {
    const recs = generateRecommendations({
      riskLevel: 'high',
      entryPointsAffected: false,
      impactedServicesCount: 5,
      changedSymbols: [],
    });

    expect(recs.some(r => r.includes('coordinated deployment'))).toBe(true);
  });

  it('should recommend senior review for high/critical risk', () => {
    const recs = generateRecommendations({
      riskLevel: 'critical',
      entryPointsAffected: false,
      impactedServicesCount: 0,
      changedSymbols: [],
    });

    expect(recs.some(r => r.includes('senior engineers'))).toBe(true);
  });

  it('should provide standard recommendation when no issues', () => {
    const recs = generateRecommendations({
      riskLevel: 'low',
      entryPointsAffected: false,
      impactedServicesCount: 0,
      changedSymbols: [],
    });

    expect(recs.some(r => r.includes('No critical issues'))).toBe(true);
  });
});
