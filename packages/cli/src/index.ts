import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { claimCommand } from './commands/claim.js';
import { verifyCommand } from './commands/verify.js';
import { reportCommand } from './commands/report.js';
import { briefingCommand } from './commands/briefing.js';

const program = new Command();

program
  .name('devox')
  .description('AI Dev Protocol — production-tested framework for AI-assisted development')
  .version('1.0.0');

program
  .command('init')
  .description('Bootstrap a project with the AI dev protocol')
  .option('--level <level>', 'Protocol level: 0 (solo), 1 (multi-agent), 2 (production)', '0')
  .action(initCommand);

program
  .command('status')
  .description('Show workboard, active claims, and briefings')
  .action(statusCommand);

program
  .command('claim')
  .description('Atomically claim a task via git')
  .argument('<task-id>', 'Task ID to claim (e.g., AUTO.01)')
  .option('--agent <name>', 'Agent name for the claim')
  .action(claimCommand);

program
  .command('verify')
  .description('Run verification gates (type-check, lint, secrets, scope)')
  .action(verifyCommand);

program
  .command('report')
  .description('Generate a delivery report with diff stats and gate results')
  .action(reportCommand);

program
  .command('briefing')
  .description('Show or create agent briefings')
  .argument('[action]', 'Action: show or create', 'show')
  .action(briefingCommand);

program.parse();
