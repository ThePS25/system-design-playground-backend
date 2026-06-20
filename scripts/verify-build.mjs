import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverPath = path.join(rootDir, 'dist', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error(`Build output missing: ${serverPath}`);
  console.error('');
  console.error('Render checklist:');
  console.error('  1. Root Directory must be blank (repo root) — NOT "src"');
  console.error('  2. Build command: npm ci --include=dev && npm run build');
  console.error('  3. Start command: npm start');
  process.exit(1);
}

console.log(`Starting server from ${serverPath}`);
