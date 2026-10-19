"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var scoring_1 = require("../src/scoring");
(0, vitest_1.describe)('scoreRisk', function () {
    (0, vitest_1.it)('should return LOW risk (0-25) for minimal changes', function () {
        var result = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 1,
            impactedServicesCount: 0,
            entryPointsAffected: false,
            maxDepth: 1,
            changedSymbolsCount: 1,
        });
        (0, vitest_1.expect)(result.score).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(25);
        (0, vitest_1.expect)(result.level).toBe('low');
    });
    (0, vitest_1.it)('should return MEDIUM risk (26-50) for moderate changes', function () {
        var result = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 8,
            impactedServicesCount: 1,
            entryPointsAffected: false,
            maxDepth: 3,
            changedSymbolsCount: 3,
        });
        (0, vitest_1.expect)(result.score).toBeGreaterThanOrEqual(26);
        (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(50);
        (0, vitest_1.expect)(result.level).toBe('medium');
    });
    (0, vitest_1.it)('should return HIGH risk (51-75) for significant changes', function () {
        var result = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 8,
            impactedServicesCount: 1,
            entryPointsAffected: true,
            maxDepth: 3,
            changedSymbolsCount: 3,
        });
        (0, vitest_1.expect)(result.score).toBeGreaterThanOrEqual(51);
        (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(75);
        (0, vitest_1.expect)(result.level).toBe('high');
    });
    (0, vitest_1.it)('should return CRITICAL risk (76-100) for severe changes', function () {
        var result = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 20,
            impactedServicesCount: 4,
            entryPointsAffected: true,
            maxDepth: 8,
            changedSymbolsCount: 10,
        });
        (0, vitest_1.expect)(result.score).toBeGreaterThanOrEqual(76);
        (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(100);
        (0, vitest_1.expect)(result.level).toBe('critical');
    });
    (0, vitest_1.it)('should never exceed score of 100', function () {
        var result = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 100,
            impactedServicesCount: 20,
            entryPointsAffected: true,
            maxDepth: 50,
            changedSymbolsCount: 50,
        });
        (0, vitest_1.expect)(result.score).toBeLessThanOrEqual(100);
    });
    (0, vitest_1.it)('should weigh entry points heavily (+35 points)', function () {
        var withEntryPoint = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 5,
            impactedServicesCount: 0,
            entryPointsAffected: true,
            maxDepth: 2,
            changedSymbolsCount: 2,
        });
        var withoutEntryPoint = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 5,
            impactedServicesCount: 0,
            entryPointsAffected: false,
            maxDepth: 2,
            changedSymbolsCount: 2,
        });
        (0, vitest_1.expect)(withEntryPoint.score - withoutEntryPoint.score).toBe(35);
    });
    (0, vitest_1.it)('should cap service impact at 30 points', function () {
        var manyServices = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 0,
            impactedServicesCount: 10,
            entryPointsAffected: false,
            maxDepth: 0,
            changedSymbolsCount: 0,
        });
        (0, vitest_1.expect)(manyServices.score).toBeLessThanOrEqual(30);
    });
    (0, vitest_1.it)('should cap depth contribution at 10 points', function () {
        var deepDepth = (0, scoring_1.scoreRisk)({
            impactedFilesCount: 0,
            impactedServicesCount: 0,
            entryPointsAffected: false,
            maxDepth: 100,
            changedSymbolsCount: 0,
        });
        (0, vitest_1.expect)(deepDepth.score).toBeLessThanOrEqual(10);
    });
});
(0, vitest_1.describe)('scoreToLevel', function () {
    (0, vitest_1.it)('should map 0-25 to low', function () {
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(0)).toBe('low');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(12)).toBe('low');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(25)).toBe('low');
    });
    (0, vitest_1.it)('should map 26-50 to medium', function () {
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(26)).toBe('medium');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(38)).toBe('medium');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(50)).toBe('medium');
    });
    (0, vitest_1.it)('should map 51-75 to high', function () {
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(51)).toBe('high');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(63)).toBe('high');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(75)).toBe('high');
    });
    (0, vitest_1.it)('should map 76-100 to critical', function () {
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(76)).toBe('critical');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(88)).toBe('critical');
        (0, vitest_1.expect)((0, scoring_1.scoreToLevel)(100)).toBe('critical');
    });
});
(0, vitest_1.describe)('isEntryPoint', function () {
    (0, vitest_1.it)('should identify controller files', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/auth.controller.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/user.controller.js')).toBe(true);
    });
    (0, vitest_1.it)('should identify route files', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/routes/api.route.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/routes/auth.route.js')).toBe(true);
    });
    (0, vitest_1.it)('should identify handler files', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/handler.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('api/github.handler.js')).toBe(true);
    });
    (0, vitest_1.it)('should identify lambda files', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/lambda.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/index.lambda.js')).toBe(true);
    });
    (0, vitest_1.it)('should identify Next.js pages (pattern-based)', function () {
        // pages/ directory pages
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/pages/Login.tsx')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/pages/Dashboard.tsx')).toBe(true);
    });
    (0, vitest_1.it)('should identify Next.js app router pages', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('apps/web/src/app/page.tsx')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('apps/web/src/app/dashboard/page.tsx')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/app/page.tsx')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/app/api/route.ts')).toBe(true);
    });
    (0, vitest_1.it)('should identify Next.js API routes', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('apps/web/src/app/api/auth/route.ts')).toBe(true);
    });
    (0, vitest_1.it)('should identify server and main entry files', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/server.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/main.ts')).toBe(true);
    });
    (0, vitest_1.it)('should identify index.ts at root level', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('index.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('index.js')).toBe(true);
    });
    (0, vitest_1.it)('should NOT identify nested index.ts files as entry points', function () {
        // This is the fix for false positives - index.ts should only match at root
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/utils/index.ts')).toBe(false);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/components/index.ts')).toBe(false);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('lib/helpers/index.ts')).toBe(false);
    });
    (0, vitest_1.it)('should identify root index.ts as entry point', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('index.ts')).toBe(true);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('index.js')).toBe(true);
    });
    (0, vitest_1.it)('should NOT identify regular source files as entry points', function () {
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/utils/helper.ts')).toBe(false);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/services/auth.service.ts')).toBe(false);
        (0, vitest_1.expect)((0, scoring_1.isEntryPoint)('src/models/user.model.ts')).toBe(false);
    });
});
(0, vitest_1.describe)('detectService', function () {
    (0, vitest_1.it)('should detect monorepo apps', function () {
        (0, vitest_1.expect)((0, scoring_1.detectService)('apps/cli/src/core/engine.ts')).toBe('cli');
        (0, vitest_1.expect)((0, scoring_1.detectService)('apps/web/src/app/page.tsx')).toBe('web');
        (0, vitest_1.expect)((0, scoring_1.detectService)('packages/shared/src/index.ts')).toBe('shared');
    });
    (0, vitest_1.it)('should detect feature-based services', function () {
        (0, vitest_1.expect)((0, scoring_1.detectService)('src/features/auth/service.ts')).toBe('auth');
        (0, vitest_1.expect)((0, scoring_1.detectService)('src/features/payments/handler.ts')).toBe('payments');
    });
    (0, vitest_1.it)('should detect module-based services', function () {
        (0, vitest_1.expect)((0, scoring_1.detectService)('src/modules/users/controller.ts')).toBe('users');
        (0, vitest_1.expect)((0, scoring_1.detectService)('src/modules/orders/service.ts')).toBe('orders');
    });
    (0, vitest_1.it)('should detect domain-based services', function () {
        (0, vitest_1.expect)((0, scoring_1.detectService)('src/auth/middleware.ts')).toBe('auth');
        (0, vitest_1.expect)((0, scoring_1.detectService)('src/api/routes.ts')).toBe('api');
    });
    (0, vitest_1.it)('should default to core for unrecognized paths', function () {
        (0, vitest_1.expect)((0, scoring_1.detectService)('lib/utils.ts')).toBe('core');
        (0, vitest_1.expect)((0, scoring_1.detectService)('helpers/index.ts')).toBe('core');
    });
});
(0, vitest_1.describe)('generateRecommendations', function () {
    (0, vitest_1.it)('should warn about removed exports', function () {
        var recs = (0, scoring_1.generateRecommendations)({
            riskLevel: 'medium',
            entryPointsAffected: false,
            impactedServicesCount: 0,
            changedSymbols: [
                { symbolName: 'oldFunction', changeType: 'removed' },
            ],
        });
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('Removed exports'); })).toBe(true);
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('oldFunction'); })).toBe(true);
    });
    (0, vitest_1.it)('should warn about modified exports', function () {
        var recs = (0, scoring_1.generateRecommendations)({
            riskLevel: 'medium',
            entryPointsAffected: false,
            impactedServicesCount: 0,
            changedSymbols: [
                { symbolName: 'config', changeType: 'modified' },
            ],
        });
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('Modified exports'); })).toBe(true);
    });
    (0, vitest_1.it)('should warn about entry points', function () {
        var recs = (0, scoring_1.generateRecommendations)({
            riskLevel: 'medium',
            entryPointsAffected: true,
            impactedServicesCount: 0,
            changedSymbols: [],
        });
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('Entry points'); })).toBe(true);
    });
    (0, vitest_1.it)('should recommend coordinated deployment for many services', function () {
        var recs = (0, scoring_1.generateRecommendations)({
            riskLevel: 'high',
            entryPointsAffected: false,
            impactedServicesCount: 5,
            changedSymbols: [],
        });
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('coordinated deployment'); })).toBe(true);
    });
    (0, vitest_1.it)('should recommend senior review for high/critical risk', function () {
        var recs = (0, scoring_1.generateRecommendations)({
            riskLevel: 'critical',
            entryPointsAffected: false,
            impactedServicesCount: 0,
            changedSymbols: [],
        });
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('senior engineers'); })).toBe(true);
    });
    (0, vitest_1.it)('should provide standard recommendation when no issues', function () {
        var recs = (0, scoring_1.generateRecommendations)({
            riskLevel: 'low',
            entryPointsAffected: false,
            impactedServicesCount: 0,
            changedSymbols: [],
        });
        (0, vitest_1.expect)(recs.some(function (r) { return r.includes('No critical issues'); })).toBe(true);
    });
});
//# sourceMappingURL=scoring.test.js.map