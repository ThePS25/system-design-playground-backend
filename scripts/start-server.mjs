/**
 * Starts the compiled server using a path relative to the repo root,
 * not process.cwd(). This avoids Render failures when Root Directory or
 * working directory is misconfigured (e.g. cwd = src → looks for src/dist/server.js).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverPath = path.join(rootDir, 'dist', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error(`Build output missing: ${serverPath}`);
  console.error('');
  console.error('Run: npm run build');
  console.error('On Render: build command must be "npm ci --include=dev && npm run build"');
  process.exit(1);
}

const child = spawn(process.execPath, [serverPath], {
  cwd: rootDir,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
