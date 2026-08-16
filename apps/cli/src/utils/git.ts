import simpleGit, { type SimpleGit } from 'simple-git';
import type { ChangedFile } from '@acie/shared';

export function createGit(rootPath: string): SimpleGit {
  return simpleGit(rootPath);
}

export async function getChangedFilesFromPR(
  rootPath: string,
  baseBranch: string,
  headBranch: string
): Promise<ChangedFile[]> {
  const git = createGit(rootPath);
  const diff = await git.diff([`${baseBranch}...${headBranch}`, '--name-status']);
  
  return diff.split('\n')
    .filter(Boolean)
    .map(line => {
      const [status, ...rest] = line.split('\t');
      const filename = rest[rest.length - 1];
      return {
        filename,
        status: mapGitStatus(status),
        additions: 0,
        deletions: 0,
      };
    })
    .filter(f => f.filename.match(/\.(ts|tsx|js|jsx|py|go)$/));
}

export async function getFilePatch(
  rootPath: string,
  filePath: string,
  baseSha: string,
  headSha: string
): Promise<string> {
  const git = createGit(rootPath);
  try {
    return await git.diff([baseSha, headSha, '--', filePath]);
  } catch {
    return '';
  }
}

export async function getCurrentBranch(rootPath: string): Promise<string> {
  const git = createGit(rootPath);
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

export async function getHeadSha(rootPath: string): Promise<string> {
  const git = createGit(rootPath);
  const sha = await git.revparse(['HEAD']);
  return sha.trim();
}

function mapGitStatus(status: string): ChangedFile['status'] {
  switch (status[0]) {
    case 'A': return 'added';
    case 'D': return 'removed';
    case 'R': return 'renamed';
    default: return 'modified';
  }
}
