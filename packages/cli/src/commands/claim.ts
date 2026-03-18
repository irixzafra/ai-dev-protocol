import chalk from 'chalk';
import fs from 'node:fs';
import { projectPath, isProtocolProject } from '../utils/paths.js';
import { ensureDir } from '../utils/files.js';
import * as gitOps from '../utils/git.js';

interface ClaimOptions {
  agent?: string;
}

export async function claimCommand(taskId: string, options: ClaimOptions): Promise<void> {
  if (!isProtocolProject()) {
    console.error(chalk.red('Error: Not a protocol project. Run `devox init` first.'));
    process.exit(1);
  }

  if (!gitOps.isGitRepo()) {
    console.error(chalk.red('Error: Not a git repository.'));
    process.exit(1);
  }

  const agent = options.agent ?? detectAgent();
  const lockFile = `.claude/claims/${taskId}.lock`;
  const lockPath = projectPath(lockFile);

  console.log(chalk.bold(`\n  Claiming ${taskId}`));
  console.log(chalk.dim(`  Agent: ${agent}\n`));

  // Step 1: Pull latest
  console.log(chalk.dim('  Pulling latest...'));
  const pullResult = gitOps.pull();
  if (!pullResult.success) {
    console.log(chalk.yellow(`  Warning: pull failed — ${pullResult.error}`));
    console.log(chalk.dim('  Continuing with local state...\n'));
  }

  // Step 2: Check if already claimed
  if (fs.existsSync(lockPath)) {
    const existing = fs.readFileSync(lockPath, 'utf-8');
    console.error(chalk.red(`  Already claimed!\n`));
    console.log(chalk.dim(`  Lock contents:\n  ${existing.split('\n').join('\n  ')}`));
    process.exit(1);
  }

  // Step 3: Create lock file
  ensureDir('.claude/claims');
  const timestamp = new Date().toISOString();
  const lockContent = `agent: ${agent}\nclaimed: ${timestamp}\ntask: ${taskId}\n`;
  fs.writeFileSync(lockPath, lockContent, 'utf-8');
  console.log(chalk.green(`  + ${lockFile}`));

  // Step 4: Commit
  const addResult = gitOps.add(lockFile);
  if (!addResult.success) {
    console.error(chalk.red(`  Failed to stage: ${addResult.error}`));
    process.exit(1);
  }

  const commitResult = gitOps.commit(`chore: claim ${taskId} [agent: ${agent}]`);
  if (!commitResult.success) {
    console.error(chalk.red(`  Failed to commit: ${commitResult.error}`));
    process.exit(1);
  }

  console.log(chalk.dim(`  Committed: ${commitResult.output.split('\n')[0]}`));

  // Step 5: Push
  console.log(chalk.dim('  Pushing...'));
  const pushResult = gitOps.push();

  if (!pushResult.success) {
    console.error(chalk.red('\n  Push failed — another agent may have claimed this task.'));
    console.log(chalk.dim(`  Error: ${pushResult.error}`));
    console.log(chalk.dim('\n  To recover: git pull --rebase && check the lock file'));
    process.exit(1);
  }

  console.log(chalk.green(`\n  Claimed ${taskId} successfully.\n`));
}

function detectAgent(): string {
  // Check common env vars that indicate which agent is running
  if (process.env['CLAUDE_AGENT']) return process.env['CLAUDE_AGENT'];
  if (process.env['AGENT_NAME']) return process.env['AGENT_NAME'];
  if (process.env['USER']) return process.env['USER'];
  return 'unknown';
}
