"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var blast_radius_1 = require("../src/graph/blast-radius");
(0, vitest_1.describe)('calculateBlastRadius', function () {
    var createEdge = function (source, target) { return ({ sourceFile: source, targetFile: target }); };
    (0, vitest_1.it)('should return low risk for single file with no dependencies', function () {
        var input = {
            changedFiles: ['src/utils/helper.ts'],
            changedSymbols: [{ filePath: 'src/utils/helper.ts', symbolName: 'formatDate', changeType: 'modified' }],
            edges: [],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.riskLevel).toBe('low');
        (0, vitest_1.expect)(result.totalImpactedFiles).toBe(0);
        (0, vitest_1.expect)(result.dependencyChain).toHaveLength(0);
        (0, vitest_1.expect)(result.entryPointsAffected).toBe(false);
    });
    (0, vitest_1.it)('should find direct importers at depth 1', function () {
        var input = {
            changedFiles: ['src/utils/helper.ts'],
            changedSymbols: [{ filePath: 'src/utils/helper.ts', symbolName: 'formatDate', changeType: 'modified' }],
            edges: [
                createEdge('src/services/user.ts', 'src/utils/helper.ts'),
                createEdge('src/services/order.ts', 'src/utils/helper.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.totalImpactedFiles).toBe(2);
        (0, vitest_1.expect)(result.dependencyChain).toHaveLength(2);
        (0, vitest_1.expect)(result.dependencyChain.every(function (n) { return n.depth === 1; })).toBe(true);
        (0, vitest_1.expect)(result.impactedServices.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should find transitive importers at depth 2', function () {
        var input = {
            changedFiles: ['src/utils/helper.ts'],
            changedSymbols: [{ filePath: 'src/utils/helper.ts', symbolName: 'formatDate', changeType: 'modified' }],
            edges: [
                createEdge('src/services/user.ts', 'src/utils/helper.ts'),
                createEdge('src/controllers/user.ts', 'src/services/user.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.totalImpactedFiles).toBe(2);
        var depths = result.dependencyChain.map(function (n) { return n.depth; }).sort();
        (0, vitest_1.expect)(depths).toEqual([1, 2]);
    });
    (0, vitest_1.it)('should detect entry points in blast radius', function () {
        var input = {
            changedFiles: ['src/utils/auth.ts'],
            changedSymbols: [{ filePath: 'src/utils/auth.ts', symbolName: 'checkAuth', changeType: 'modified' }],
            edges: [
                createEdge('src/controllers/auth.controller.ts', 'src/utils/auth.ts'),
                createEdge('src/services/user.ts', 'src/utils/auth.ts'),
                createEdge('src/services/order.ts', 'src/utils/auth.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.entryPointsAffected).toBe(true);
        // entry point (35) + 3 services (30) + depth 1 (2) + 3 files (3) + 1 symbol (1) = 71 -> high
        (0, vitest_1.expect)(result.riskLevel).toBe('high');
        (0, vitest_1.expect)(result.impactedServices.some(function (s) { return s.entryPoints.length > 0; })).toBe(true);
    });
    (0, vitest_1.it)('should respect MAX_DEPTH of 10', function () {
        var edges = [];
        for (var i = 0; i < 15; i++) {
            edges.push(createEdge("src/file".concat(i + 1, ".ts"), "src/file".concat(i, ".ts")));
        }
        var input = {
            changedFiles: ['src/file0.ts'],
            changedSymbols: [{ filePath: 'src/file0.ts', symbolName: 'fn', changeType: 'modified' }],
            edges: edges,
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.totalImpactedFiles).toBeLessThanOrEqual(10);
        (0, vitest_1.expect)(Math.max.apply(Math, result.dependencyChain.map(function (n) { return n.depth; }))).toBeLessThanOrEqual(10);
    });
    (0, vitest_1.it)('should detect multiple services', function () {
        var input = {
            changedFiles: ['packages/shared/src/utils.ts'],
            changedSymbols: [{ filePath: 'packages/shared/src/utils.ts', symbolName: 'sharedFn', changeType: 'modified' }],
            edges: [
                createEdge('apps/cli/src/command.ts', 'packages/shared/src/utils.ts'),
                createEdge('apps/web/src/component.tsx', 'packages/shared/src/utils.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.impactedServices.length).toBe(2);
        var serviceNames = result.impactedServices.map(function (s) { return s.name; }).sort();
        (0, vitest_1.expect)(serviceNames).toEqual(['cli', 'web']);
    });
    (0, vitest_1.it)('should include symbols in dependency chain', function () {
        var input = {
            changedFiles: ['src/utils/date.ts'],
            changedSymbols: [
                { filePath: 'src/utils/date.ts', symbolName: 'formatDate', changeType: 'removed' },
                { filePath: 'src/utils/date.ts', symbolName: 'parseDate', changeType: 'modified' },
            ],
            edges: [
                createEdge('src/services/report.ts', 'src/utils/date.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.dependencyChain[0].symbols).toContain('formatDate');
        (0, vitest_1.expect)(result.dependencyChain[0].symbols).toContain('parseDate');
    });
    (0, vitest_1.it)('should handle removed exports with higher risk', function () {
        var input = {
            changedFiles: ['src/utils/date.ts'],
            changedSymbols: [
                { filePath: 'src/utils/date.ts', symbolName: 'formatDate', changeType: 'removed' },
            ],
            edges: [
                createEdge('src/services/report.ts', 'src/utils/date.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        var recs = result.recommendations.join(' ');
        (0, vitest_1.expect)(recs).toContain('Removed exports');
        (0, vitest_1.expect)(recs).toContain('formatDate');
    });
    (0, vitest_1.it)('should handle removed exports in recommendations', function () {
        var input = {
            changedFiles: ['src/utils/helper.ts'],
            changedSymbols: [
                { filePath: 'src/utils/helper.ts', symbolName: 'oldFn', changeType: 'removed' },
            ],
            edges: [
                createEdge('src/consumer.ts', 'src/utils/helper.ts'),
            ],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        var recs = result.recommendations.join(' ');
        (0, vitest_1.expect)(recs).toContain('Removed exports');
    });
    (0, vitest_1.it)('should generate recommendations for high risk', function () {
        var input = {
            changedFiles: ['src/core/base.ts'],
            changedSymbols: [
                { filePath: 'src/core/base.ts', symbolName: 'BaseClass', changeType: 'modified' },
            ],
            // Create enough edges to push risk to high (entry point + many files)
            edges: __spreadArray([
                createEdge('src/controllers/main.controller.ts', 'src/core/base.ts')
            ], Array.from({ length: 15 }, function (_, i) { return createEdge("src/service".concat(i, ".ts"), 'src/core/base.ts'); }), true),
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.riskLevel).toBe('high');
        var recs = result.recommendations.join(' ');
        (0, vitest_1.expect)(recs).toContain('senior engineers');
    });
    (0, vitest_1.it)('should not crash on empty edges', function () {
        var input = {
            changedFiles: ['src/isolated.ts'],
            changedSymbols: [{ filePath: 'src/isolated.ts', symbolName: 'fn', changeType: 'modified' }],
            edges: [],
        };
        var result = (0, blast_radius_1.calculateBlastRadius)(input);
        (0, vitest_1.expect)(result.riskScore).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(result.riskScore).toBeLessThanOrEqual(100);
    });
});
//# sourceMappingURL=blast-radius.test.js.map