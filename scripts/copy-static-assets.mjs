import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const assets = [
  {
    from: path.join(rootDir, 'src', 'seed', 'data', 'pricing.json'),
    to: path.join(rootDir, 'dist', 'seed', 'data', 'pricing.json'),
  },
];

for (const { from, to } of assets) {
  if (!fs.existsSync(from)) {
    console.error(`Missing source asset: ${from}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`Copied ${path.relative(rootDir, from)} → ${path.relative(rootDir, to)}`);
}
