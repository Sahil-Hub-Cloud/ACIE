export const ENTRY_POINT_PATTERNS: RegExp[] = [
  /\.controller\.(ts|js)$/,
  /\.route\.(ts|js)$/,
  /\/pages\/.*\.(ts|tsx|js|jsx)$/,
  /(^|\/)app\/(.*\/)?page\.(ts|tsx)$/,
  /(^|\/)app\/(.*\/)?route\.(ts|js)$/,
  /server\.(ts|js)$/,
  /main\.(ts|js)$/,
  /^index\.(ts|js)$/,
  /handler\.(ts|js)$/,
  /lambda\.(ts|js)$/,
];

export function isEntryPoint(filePath: string): boolean {
  return ENTRY_POINT_PATTERNS.some(pattern => pattern.test(filePath));
}