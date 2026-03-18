import chalk from 'chalk';
import fs from 'node:fs';
import { projectPath, isProtocolProject } from '../utils/paths.js';
import { ensureDir } from '../utils/files.js';

export async function briefingCommand(action: string | undefined): Promise<void> {
  if (!isProtocolProject()) {
    console.error(chalk.red('Error: Not a protocol project. Run `devox init` first.'));
    process.exit(1);
  }

  const subcommand = action ?? 'show';

  switch (subcommand) {
    case 'show':
      showBriefings();
      break;
    case 'create':
      createBriefing();
      break;
    default:
      console.error(chalk.red(`Unknown subcommand: ${subcommand}`));
      console.log(chalk.dim('Usage: devox briefing [show|create]'));
      process.exit(1);
  }
}

function showBriefings(): void {
  const briefingsPath = projectPath('.claude', 'BRIEFINGS.md');

  console.log(chalk.bold('\n  Briefings\n'));

  if (!fs.existsSync(briefingsPath)) {
    console.log(chalk.dim('  No briefings file found at .claude/BRIEFINGS.md'));
    console.log(chalk.dim('  Run `devox init --level 1` to create it.\n'));
    return;
  }

  const content = fs.readFileSync(briefingsPath, 'utf-8');
  const sections = parseBriefingSections(content);

  if (sections.length === 0) {
    console.log(chalk.dim('  No active briefings.\n'));
    return;
  }

  for (const section of sections) {
    const statusColor = section.status === 'pending'
      ? chalk.yellow
      : section.status === 'done'
        ? chalk.green
        : chalk.white;

    console.log(`  ${statusColor(section.title)}`);
    if (section.agent) {
      console.log(chalk.dim(`    Agent: ${section.agent}`));
    }
    if (section.summary) {
      console.log(chalk.dim(`    ${section.summary}`));
    }
    console.log('');
  }
}

interface BriefingSection {
  title: string;
  agent?: string;
  summary?: string;
  status: 'pending' | 'done' | 'unknown';
}

function parseBriefingSections(content: string): BriefingSection[] {
  const lines = content.split('\n');
  const sections: BriefingSection[] = [];
  let current: BriefingSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      if (current) sections.push(current);
      const title = trimmed.slice(3);
      current = {
        title,
        status: title.toLowerCase().includes('done') ? 'done' : 'pending',
      };
    } else if (current) {
      if (trimmed.toLowerCase().startsWith('agent:')) {
        current.agent = trimmed.slice(6).trim();
      } else if (trimmed.length > 0 && !current.summary && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        current.summary = trimmed;
      }
    }
  }

  if (current) sections.push(current);
  return sections;
}

function createBriefing(): void {
  const briefingsPath = projectPath('.claude', 'BRIEFINGS.md');

  ensureDir('.claude');

  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
  const agent = process.env['AGENT_NAME'] ?? process.env['USER'] ?? 'unassigned';

  const entry = `
## Briefing — ${timestamp}

Agent: ${agent}
Status: pending

**Objective:**
<!-- Describe the task objective -->

**Scope:**
<!-- What files/areas to touch -->

**Constraints:**
<!-- What NOT to touch -->

---
`;

  if (fs.existsSync(briefingsPath)) {
    const existing = fs.readFileSync(briefingsPath, 'utf-8');
    fs.writeFileSync(briefingsPath, existing + entry, 'utf-8');
  } else {
    const header = `# Briefings\n\n> Active briefings for agents. Read at session start.\n`;
    fs.writeFileSync(briefingsPath, header + entry, 'utf-8');
  }

  console.log(chalk.bold('\n  Briefing created\n'));
  console.log(chalk.dim(`  Edit .claude/BRIEFINGS.md to fill in the details.\n`));
}
