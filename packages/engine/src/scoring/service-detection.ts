export function detectService(filePath: string): string {
  // Monorepo: service = first directory segment under apps/ or packages/
  const appsMatch = filePath.match(/(?:apps|packages)\/([^/]+)\//);
  if (appsMatch) return appsMatch[1];

  // Feature-based: src/features/[name]/
  const featureMatch = filePath.match(/features\/([^/]+)\//);
  if (featureMatch) return featureMatch[1];

  // Module-based: src/modules/[name]/
  const moduleMatch = filePath.match(/modules\/([^/]+)\//);
  if (moduleMatch) return moduleMatch[1];

  // Domain-based: src/[domain]/[name]/
  const domainMatch = filePath.match(/src\/([^/]+)\//);
  if (domainMatch) return domainMatch[1];

  return 'core';
}