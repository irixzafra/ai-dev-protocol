import { execSync } from 'node:child_process';

export interface GitResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Run a git command in the current working directory.
 */
export function git(args: string, options?: { cwd?: string }): GitResult {
  try {
    const output = execSync(`git ${args}`, {
      cwd: options?.cwd ?? process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return { success: true, output };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; message?: string };
    return {
      success: false,
      output: (error.stdout ?? '').trim(),
      error: (error.stderr ?? error.message ?? 'Unknown git error').trim(),
    };
  }
}

/**
 * Check if the current directory is a git repository.
 */
export function isGitRepo(): boolean {
  return git('rev-parse --is-inside-work-tree').success;
}

/**
 * Get the current branch name.
 */
export function getCurrentBranch(): string {
  const result = git('rev-parse --abbrev-ref HEAD');
  return result.success ? result.output : 'unknown';
}

/**
 * Pull from remote.
 */
export function pull(remote = 'origin', branch = 'master'): GitResult {
  return git(`pull ${remote} ${branch}`);
}

/**
 * Stage files.
 */
export function add(...files: string[]): GitResult {
  return git(`add ${files.join(' ')}`);
}

/**
 * Commit with a message.
 */
export function commit(message: string): GitResult {
  return git(`commit -m "${message.replace(/"/g, '\\"')}"`);
}

/**
 * Push to remote.
 */
export function push(remote = 'origin', branch?: string): GitResult {
  const branchArg = branch ? ` ${branch}` : '';
  return git(`push ${remote}${branchArg}`);
}

/**
 * Get diff stat for current changes.
 */
export function diffStat(): string {
  const result = git('diff --stat');
  return result.success ? result.output : '';
}

/**
 * Get diff stat for staged changes.
 */
export function diffStatStaged(): string {
  const result = git('diff --stat --staged');
  return result.success ? result.output : '';
}

/**
 * Get list of staged files.
 */
export function stagedFiles(): string[] {
  const result = git('diff --name-only --staged');
  if (!result.success || !result.output) return [];
  return result.output.split('\n').filter(Boolean);
}
