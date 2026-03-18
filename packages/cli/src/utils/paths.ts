import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Resolve the root of the ai-dev-protocol repo.
 *
 * Resolution order:
 * 1. PROTOCOL_ROOT env var (production override)
 * 2. Walk up from this file until we find protocol/protocol.md (monorepo dev)
 */
export function getProtocolRoot(): string {
  const envRoot = process.env['PROTOCOL_ROOT'];
  if (envRoot && fs.existsSync(path.join(envRoot, 'protocol', 'protocol.md'))) {
    return envRoot;
  }

  // In monorepo dev: this file is at packages/cli/dist/utils/paths.js (compiled)
  // or packages/cli/src/utils/paths.ts (tsx dev). Walk up to find root.
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  let candidate = thisDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(candidate, 'protocol', 'protocol.md'))) {
      return candidate;
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) break;
    candidate = parent;
  }

  throw new Error(
    'Cannot find ai-dev-protocol root. Set PROTOCOL_ROOT env var or run from within the monorepo.'
  );
}

/**
 * Resolve a path relative to the protocol repo root.
 */
export function protocolPath(...segments: string[]): string {
  return path.join(getProtocolRoot(), ...segments);
}

/**
 * Resolve a path relative to the current working directory (user's project).
 */
export function projectPath(...segments: string[]): string {
  return path.join(process.cwd(), ...segments);
}

/**
 * Check if the current directory looks like a project with the protocol installed.
 */
export function isProtocolProject(): boolean {
  return fs.existsSync(projectPath('dev.protocol.md')) ||
         fs.existsSync(projectPath('planning'));
}
