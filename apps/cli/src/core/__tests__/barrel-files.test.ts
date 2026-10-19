import { describe, it, expect, afterAll } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseFileAST, ParseResult } from '../graph-builder';

type TSParser = InstanceType<typeof import('tree-sitter')>;

function loadAstParser(): { parser: TSParser; lang: unknown } | null {
  try {
    const ParserCtor = require('tree-sitter') as typeof import('tree-sitter');
    const lang = (require('tree-sitter-typescript') as { typescript: unknown }).typescript;
    const parser = new ParserCtor();
    parser.setLanguage(lang);
    return { parser, lang };
  } catch {
    return null;
  }
}

const ast = loadAstParser();
const describeAst = ast ? describe : describe.skip;

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'acie-barrel-test-'));

// Create tsconfig.json for path alias testing
const tsconfig = {
  compilerOptions: {
    baseUrl: '.',
    paths: {
      '@/features/*': ['features/*']
    }
  }
};
fs.writeFileSync(path.join(tmpRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

// Barrel file structure: features/user/index.ts re-exports from ./service
const userDir = path.join(tmpRoot, 'features', 'user');
fs.mkdirSync(userDir, { recursive: true });
fs.writeFileSync(path.join(userDir, 'service.ts'), 'export function getUser() { return {}; }\nexport interface User { id: string; }\n');
fs.writeFileSync(path.join(userDir, 'index.ts'), "export * from './service';\nexport { getUser } from './service';\n");

// Consumer imports from barrel
const consumerDir = path.join(tmpRoot, 'apps', 'api');
fs.mkdirSync(consumerDir, { recursive: true });
fs.writeFileSync(path.join(consumerDir, 'route.ts'), "import { getUser, User } from '@/features/user';\n");

function edgeTo(result: ParseResult, target: string, rootPath: string) {
  return result.imports.filter(i => path.relative(rootPath, i.targetFile).replace(/\\/g, '/') === target);
}

describeAst('parseFileAST with barrel files and path aliases', () => {
  it('resolves barrel file re-exports (export * from)', () => {
    expect(ast).not.toBeNull();
    const barrelPath = path.join(userDir, 'index.ts');
    const barrelContent = fs.readFileSync(barrelPath, 'utf-8');
    console.log('Barrel content:', barrelContent);
    const result = parseFileAST(barrelPath, barrelContent, ast!.parser, ast!.lang, tmpRoot);
    console.log('Barrel result:', JSON.stringify(result, null, 2));
    
    // Should capture re-export edges
    const servicePath = path.join(userDir, 'service.ts');
    const relativeService = path.relative(tmpRoot, servicePath).replace(/\\/g, '/');
    console.log('Looking for edges to:', relativeService);
    console.log('Actual imports:', result.imports.map(i => i.targetFile));
    expect(edgeTo(result, relativeService, tmpRoot)).toHaveLength(2); // export * + export { }
  });

  it('consumer imports resolve through path alias @/features/user', () => {
    expect(ast).not.toBeNull();
    const consumerPath = path.join(consumerDir, 'route.ts');
    const consumerContent = fs.readFileSync(consumerPath, 'utf-8');
    console.log('Consumer content:', consumerContent);
    const result = parseFileAST(consumerPath, consumerContent, ast!.parser, ast!.lang, tmpRoot);
    console.log('Consumer result:', JSON.stringify(result, null, 2));
    
    // Should resolve @/features/user to features/user/index.ts
    const barrelPath = path.join(userDir, 'index.ts');
    const relativeBarrel = path.relative(tmpRoot, barrelPath).replace(/\\/g, '/');
    console.log('Looking for edges to:', relativeBarrel);
    console.log('Actual imports:', result.imports.map(i => i.targetFile));
    expect(edgeTo(result, relativeBarrel, tmpRoot)).toHaveLength(1);
  });
});

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});