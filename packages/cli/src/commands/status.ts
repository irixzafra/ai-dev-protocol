import chalk from 'chalk';
import fs from 'node:fs';
import { projectPath } from '../utils/paths.js';
import { isProtocolProject } from '../utils/paths.js';

export async function statusCommand(): Promise<void> {
  if (!isProtocolProject()) {
    console.error(chalk.red('Error: Not a protocol project. Run `devox init` first.'));
    process.exit(1);
  }

  console.log(chalk.bold('\n  devox status\n'));

  // --- WORKBOARD ---
  showSection('planning/WORKBOARD.md', 'Workboard', parseWorkboard);

  // --- Claims ---
  showClaims();

  // --- Briefings ---
  showSection('.claude/BRIEFINGS.md', 'Briefings', parseBriefings);

  console.log('');
}

function showSection(
  filePath: string,
  title: string,
  parser: (content: string) => void
): void {
  const fullPath = projectPath(filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.dim(`  ${title}: ${filePath} not found`));
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  console.log(chalk.cyan(`  ${title}`));
  parser(content);
  console.log('');
}

function parseWorkboard(content: string): void {
  const lines = content.split('\n');
  let taskCount = 0;
  let inTaskSection = false;

  for (const line of lines) {
    // Detect task lines: lines starting with | that contain task IDs
    if (line.match(/^\|.*\|.*\|/)) {
      inTaskSection = true;

      // Skip header separator lines
      if (line.match(/^\|\s*[-:]+\s*\|/)) continue;

      // Skip the header row
      if (line.match(/^\|\s*(ID|Task|Status|Owner)/i)) {
        console.log(chalk.dim(`    ${line.trim()}`));
        continue;
      }

      // Color-code by status
      const trimmed = line.trim();
      if (trimmed.includes('DONE') || trimmed.includes('CERRADO')) {
        console.log(`    ${chalk.dim(trimmed)}`);
      } else if (trimmed.includes('IN_PROGRESS') || trimmed.includes('CLAIMED')) {
        console.log(`    ${chalk.yellow(trimmed)}`);
      } else if (trimmed.includes('OPEN') || trimmed.includes('TODO')) {
        console.log(`    ${chalk.white(trimmed)}`);
      } else if (trimmed.includes('BLOCKED')) {
        console.log(`    ${chalk.red(trimmed)}`);
      } else {
        console.log(`    ${trimmed}`);
      }

      taskCount++;
    } else if (inTaskSection && line.trim() === '') {
      inTaskSection = false;
    }
  }

  if (taskCount === 0) {
    console.log(chalk.dim('    (no tasks found)'));
  }
}

function showClaims(): void {
  const claimsDir = projectPath('.claude', 'claims');

  console.log(chalk.cyan('  Active Claims'));

  if (!fs.existsSync(claimsDir)) {
    console.log(chalk.dim('    (no claims directory)'));
    console.log('');
    return;
  }

  const lockFiles = fs.readdirSync(claimsDir).filter(f => f.endsWith('.lock'));

  if (lockFiles.length === 0) {
    console.log(chalk.dim('    (no active claims)'));
    console.log('');
    return;
  }

  for (const lockFile of lockFiles) {
    const content = fs.readFileSync(
      projectPath('.claude', 'claims', lockFile),
      'utf-8'
    );
    const taskId = lockFile.replace('.lock', '');
    const firstLine = content.split('\n')[0] ?? '';
    console.log(`    ${chalk.yellow(taskId)} ${chalk.dim(firstLine)}`);
  }

  console.log('');
}

function parseBriefings(content: string): void {
  const lines = content.split('\n');
  let found = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Look for briefing entries (## headers or lines with agent assignments)
    if (trimmed.startsWith('## ')) {
      console.log(`    ${chalk.bold(trimmed)}`);
      found = true;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      console.log(`    ${trimmed}`);
      found = true;
    }
  }

  if (!found) {
    console.log(chalk.dim('    (no active briefings)'));
  }
}
