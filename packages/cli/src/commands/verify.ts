import chalk from 'chalk';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { projectPath, isProtocolProject } from '../utils/paths.js';
import { stagedFiles } from '../utils/git.js';

interface GateResult {
  name: string;
  label: string;
  passed: boolean;
  output: string;
  skipped: boolean;
}

// Credential patterns to scan for (description-only — no real secrets)
const SECRET_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /sk_live_[a-zA-Z0-9]{20,}/, label: 'Stripe live key' },
  { pattern: /ya29\.[a-zA-Z0-9._-]+/, label: 'Google OAuth token' },
  { pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/, label: 'Private key' },
  { pattern: /postgres:\/\/[^:]+:[^@]+@/, label: 'Database connection string with password' },
  { pattern: /AKIA[0-9A-Z]{16}/, label: 'AWS access key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: 'GitHub personal access token' },
  { pattern: /xoxb-[0-9]+-[a-zA-Z0-9]+/, label: 'Slack bot token' },
];

export async function verifyCommand(): Promise<void> {
  if (!isProtocolProject()) {
    console.error(chalk.red('Error: Not a protocol project. Run `devox init` first.'));
    process.exit(1);
  }

  console.log(chalk.bold('\n  devox verify\n'));

  const gates: GateResult[] = [];

  // G1: TypeScript type-check
  gates.push(runGate('G1', 'TypeScript (tsc --noEmit)', () => {
    if (!fs.existsSync(projectPath('tsconfig.json'))) {
      return { skipped: true, passed: true, output: 'No tsconfig.json found' };
    }
    return runCommand('npx tsc --noEmit');
  }));

  // G2: Lint
  gates.push(runGate('G2', 'Lint', () => {
    const hasEslint =
      fs.existsSync(projectPath('.eslintrc.js')) ||
      fs.existsSync(projectPath('.eslintrc.json')) ||
      fs.existsSync(projectPath('.eslintrc.cjs')) ||
      fs.existsSync(projectPath('.eslintrc.yml')) ||
      fs.existsSync(projectPath('eslint.config.js')) ||
      fs.existsSync(projectPath('eslint.config.mjs')) ||
      fs.existsSync(projectPath('eslint.config.ts'));

    if (!hasEslint) {
      return { skipped: true, passed: true, output: 'No ESLint config found' };
    }
    return runCommand('npx eslint .');
  }));

  // G3: Secrets scan
  gates.push(runGate('G3', 'Secrets scan', () => {
    return scanSecrets();
  }));

  // G4: Scope check (diff stat)
  gates.push(runGate('G4', 'Scope (git diff --stat)', () => {
    return runCommand('git diff --stat');
  }));

  // --- Results ---
  console.log(chalk.bold('  Results:\n'));

  let allPassed = true;
  for (const gate of gates) {
    const icon = gate.skipped
      ? chalk.dim('~')
      : gate.passed
        ? chalk.green('\u2713')
        : chalk.red('\u2717');
    const status = gate.skipped
      ? chalk.dim('skipped')
      : gate.passed
        ? chalk.green('pass')
        : chalk.red('FAIL');

    console.log(`  ${icon} ${gate.name} ${gate.label} ${status}`);

    if (!gate.passed && !gate.skipped) {
      allPassed = false;
      const lines = gate.output.split('\n').slice(0, 10);
      for (const line of lines) {
        console.log(chalk.dim(`      ${line}`));
      }
    }
  }

  console.log('');

  if (allPassed) {
    console.log(chalk.green('  All gates passed.\n'));
  } else {
    console.log(chalk.red('  Some gates failed. Fix before delivery.\n'));
    process.exit(1);
  }
}

function runGate(
  name: string,
  label: string,
  fn: () => { skipped?: boolean; passed: boolean; output: string }
): GateResult {
  try {
    const result = fn();
    return {
      name,
      label,
      passed: result.passed,
      output: result.output,
      skipped: result.skipped ?? false,
    };
  } catch {
    return { name, label, passed: false, output: 'Gate threw an exception', skipped: false };
  }
}

function runCommand(cmd: string): { passed: boolean; output: string } {
  try {
    const output = execSync(cmd, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60_000,
    }).trim();
    return { passed: true, output };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string };
    const output = [error.stdout ?? '', error.stderr ?? ''].filter(Boolean).join('\n').trim();
    return { passed: false, output };
  }
}

function scanSecrets(): { passed: boolean; output: string } {
  const files = stagedFiles();
  const violations: string[] = [];

  // If no staged files, scan tracked modified files
  const filesToScan = files.length > 0 ? files : getModifiedFiles();

  for (const file of filesToScan) {
    const fullPath = projectPath(file);
    if (!fs.existsSync(fullPath)) continue;

    // Skip binary files and common non-code files
    if (file.match(/\.(png|jpg|jpeg|gif|ico|woff2?|ttf|eot|svg|lock)$/)) continue;

    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      continue;
    }

    for (const { pattern, label } of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        violations.push(`${file}: ${label}`);
      }
    }
  }

  if (violations.length > 0) {
    return {
      passed: false,
      output: `Found potential secrets:\n${violations.join('\n')}`,
    };
  }

  return { passed: true, output: `Scanned ${filesToScan.length} files — clean` };
}

function getModifiedFiles(): string[] {
  try {
    const output = execSync('git diff --name-only', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return output ? output.split('\n') : [];
  } catch {
    return [];
  }
}
