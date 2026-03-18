import fs from 'node:fs';
import path from 'node:path';
import { protocolPath, projectPath } from './paths.js';

export interface CopyResult {
  dest: string;
  created: boolean;
  skipped: boolean;
}

/**
 * Copy a file from the protocol repo to the user's project.
 * Skips if the destination already exists (no overwrites).
 */
export function copyFile(src: string, dest: string): CopyResult {
  const destPath = projectPath(dest);

  if (fs.existsSync(destPath)) {
    return { dest, created: false, skipped: true };
  }

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(src, destPath);
  return { dest, created: true, skipped: false };
}

/**
 * Copy a template file from templates/ to the user's project.
 */
export function copyTemplate(templateName: string, dest: string): CopyResult {
  const src = protocolPath('templates', templateName);
  if (!fs.existsSync(src)) {
    throw new Error(`Template not found: ${src}`);
  }
  return copyFile(src, dest);
}

/**
 * Copy a protocol file from protocol/ to the user's project.
 */
export function copyProtocol(protocolFile: string, dest: string): CopyResult {
  const src = protocolPath('protocol', protocolFile);
  if (!fs.existsSync(src)) {
    throw new Error(`Protocol file not found: ${src}`);
  }
  return copyFile(src, dest);
}

/**
 * Ensure a directory exists in the user's project.
 */
export function ensureDir(dir: string): void {
  const fullPath = projectPath(dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

/**
 * Read a file from the user's project, returning null if it doesn't exist.
 */
export function readProjectFile(filePath: string): string | null {
  const fullPath = projectPath(filePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Write content to a file in the user's project.
 * Creates parent directories as needed. Does NOT overwrite if file exists.
 */
export function writeProjectFile(filePath: string, content: string, overwrite = false): CopyResult {
  const fullPath = projectPath(filePath);

  if (fs.existsSync(fullPath) && !overwrite) {
    return { dest: filePath, created: false, skipped: true };
  }

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content, 'utf-8');
  return { dest: filePath, created: true, skipped: false };
}
