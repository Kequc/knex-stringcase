import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve('dist/cjs');
await mkdir(dir, { recursive: true });

const file = path.join(dir, 'package.json');
const data = JSON.stringify({ type: 'commonjs' }, null, 2) + '\n';

await writeFile(file, data, 'utf8');
