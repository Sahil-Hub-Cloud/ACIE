export function parseFile(filePath, content) {
  const exports = [];
  const imports = [];

  // 1. JavaScript / TypeScript
  if (filePath.match(/\.(js|ts|jsx|tsx)$/)) {
    const exportMatches = content.matchAll(/export (const|let|var|function|class|type|interface) (\w+)/g);
    for (const m of exportMatches) exports.push(m[2]);

    const importMatches = content.matchAll(/from ['"](.+)['"]/g);
    for (const m of importMatches) imports.push({ from: m[1] });
  } 
  // 2. Python
  else if (filePath.endsWith('.py')) {
    const pyExports = content.matchAll(/^(def|class) (\w+)/gm);
    for (const m of pyExports) exports.push(m[2]);
    
    const pyImports = content.matchAll(/^(?:from|import) (\w+)/gm);
    for (const m of pyImports) imports.push({ from: m[1] });
  }
  // 3. Go (NEW!)
  else if (filePath.endsWith('.go')) {
    const goExports = content.matchAll(/^func\s+(\w+)|^type\s+(\w+)/gm);
    for (const m of goExports) {
      // Find which group matched (function name or type name)
      exports.push(m[1] || m[2]);
    }
  }

  return { filePath, exports, imports };
}