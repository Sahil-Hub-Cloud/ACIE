export function parseFile(filePath, content) {
  const exports = [];
  const imports = [];

  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
    // JS/TS Logic
    const exportMatches = content.matchAll(/export (const|let|var|function|class|type|interface) (\w+)/g);
    for (const m of exportMatches) exports.push(m[2]);

    const importMatches = content.matchAll(/from ['"](.+)['"]/g);
    for (const m of importMatches) imports.push({ from: m[1] });
  } 
  else if (filePath.endsWith('.py')) {
    // Python Logic: Extracting functions and classes as "exports"
    const pyExports = content.matchAll(/^(def|class) (\w+)/gm);
    for (const m of pyExports) exports.push(m[2]);
    
    // Simple Python import detection
    const pyImports = content.matchAll(/^(?:from|import) (\w+)/gm);
    for (const m of pyImports) imports.push({ from: m[1] });
  }

  return { filePath, exports, imports };
}