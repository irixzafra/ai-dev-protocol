import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { copyTemplate, copyProtocol, ensureDir, writeProjectFile, type CopyResult } from '../utils/files.js';
import { protocolPath, projectPath } from '../utils/paths.js';
import { isGitRepo } from '../utils/git.js';

interface InitOptions {
  level: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const level = parseInt(options.level, 10);

  if (isNaN(level) || level < 0 || level > 2) {
    console.error(chalk.red('Error: --level must be 0, 1, or 2'));
    process.exit(1);
  }

  console.log(chalk.bold('\n  ai-dev-protocol init'));
  console.log(chalk.dim(`  Level ${level} — ${levelDescription(level)}\n`));

  if (!isGitRepo()) {
    console.error(chalk.red('Error: Not a git repository. Run `git init` first.'));
    process.exit(1);
  }

  const results: CopyResult[] = [];

  // --- Level 0: Core ---
  console.log(chalk.cyan('Level 0 — Core protocol files:'));

  ensureDir('planning');
  results.push(copyProtocol('protocol.md', 'dev.protocol.md'));
  results.push(copyTemplate('agent-config.template.md', 'CLAUDE.md'));
  results.push(copyTemplate('lessons.template.md', 'planning/LESSONS.md'));
  results.push(copyTemplate('dev-log.template.md', 'planning/dev-log.md'));
  results.push(writeProjectFile('planning/MEMORY.md', memoryTemplate()));

  printResults(results);

  // --- Level 1: Multi-agent ---
  if (level >= 1) {
    const l1Results: CopyResult[] = [];
    console.log(chalk.cyan('\nLevel 1 — Multi-agent coordination:'));

    ensureDir('.claude');
    l1Results.push(copyTemplate('workboard.template.md', 'planning/WORKBOARD.md'));
    l1Results.push(copyTemplate('briefings.template.md', '.claude/BRIEFINGS.md'));
    l1Results.push(copyTemplate('coordination.template.md', '.claude/COORDINATION.md'));

    printResults(l1Results);
    results.push(...l1Results);
  }

  // --- Level 2: Production ---
  if (level >= 2) {
    const l2Results: CopyResult[] = [];
    console.log(chalk.cyan('\nLevel 2 — Production workflow:'));

    l2Results.push(copyTemplate('playbook.template.md', 'playbook.md'));

    printResults(l2Results);
    results.push(...l2Results);
  }

  // --- Git hooks ---
  console.log(chalk.cyan('\nGit hooks:'));
  const hookResults = installGitHooks();
  results.push(...hookResults);
  printResults(hookResults);

  // --- Summary ---
  const created = results.filter(r => r.created).length;
  const skipped = results.filter(r => r.skipped).length;

  console.log(chalk.bold('\n  Summary'));
  console.log(`  ${chalk.green(`${created} created`)}  ${chalk.dim(`${skipped} skipped (already exist)`)}\n`);

  if (created > 0) {
    console.log(chalk.dim('  Next steps:'));
    console.log(chalk.dim('  1. Review dev.protocol.md — the development workflow'));
    console.log(chalk.dim('  2. Edit CLAUDE.md — configure for your project'));
    console.log(chalk.dim('  3. Run `devox status` to see your planning state'));
    console.log('');
  }
}

function levelDescription(level: number): string {
  switch (level) {
    case 0: return 'Solo developer + AI agent';
    case 1: return 'Multi-agent coordination';
    case 2: return 'Production workflow with playbook';
    default: return '';
  }
}

function memoryTemplate(): string {
  return `# Project Memory

> Architectural decisions, patterns, and operational knowledge.
> Updated by agents after significant work. Read by agents at session start.

---

<!-- Add entries below as work progresses -->
`;
}

function installGitHooks(): CopyResult[] {
  const results: CopyResult[] = [];
  const hooksSource = protocolPath('packages', 'hooks');

  if (!fs.existsSync(hooksSource)) {
    console.log(chalk.dim('  (hooks source not found, skipping)'));
    return results;
  }

  // Prefer .husky/ if it exists, otherwise .git/hooks/
  const huskyDir = projectPath('.husky');
  const gitHooksDir = projectPath('.git', 'hooks');
  const targetDir = fs.existsSync(huskyDir) ? huskyDir : gitHooksDir;
  const targetLabel = fs.existsSync(huskyDir) ? '.husky/' : '.git/hooks/';

  const hookFiles = ['pre-commit.sh', 'commit-msg.sh', 'pre-push.sh'];
  const hookNameMap: Record<string, string> = {
    'pre-commit.sh': 'pre-commit',
    'commit-msg.sh': 'commit-msg',
    'pre-push.sh': 'pre-push',
  };

  for (const hookFile of hookFiles) {
    const src = path.join(hooksSource, hookFile);
    if (!fs.existsSync(src)) continue;

    const hookName = hookNameMap[hookFile] ?? hookFile;
    const dest = path.join(targetDir, hookName);
    const relDest = path.relative(process.cwd(), dest);

    if (fs.existsSync(dest)) {
      results.push({ dest: relDest, created: false, skipped: true });
      continue;
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.copyFileSync(src, dest);
    fs.chmodSync(dest, 0o755);
    results.push({ dest: relDest, created: true, skipped: false });
  }

  return results;
}

function printResults(results: CopyResult[]): void {
  for (const r of results) {
    if (r.created) {
      console.log(`  ${chalk.green('+')} ${r.dest}`);
    } else if (r.skipped) {
      console.log(`  ${chalk.dim('-')} ${r.dest} ${chalk.dim('(exists)')}`);
    }
  }
}
