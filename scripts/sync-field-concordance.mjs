import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const javaRoot = resolve(root, '../cedar-artifact-library');
const fixture = 'src/test/resources/concordance/field-matrix.json';
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'src/main', 'src/test'], { cwd: javaRoot, encoding: 'utf8' });
if (dirty.trim()) throw new Error('Commit the Java implementation, matrix generator and fixture before syncing its provenance.');
const bytes = readFileSync(resolve(javaRoot, fixture));
const destination = resolve(root, 'itest/resources/concordance');
mkdirSync(destination, { recursive: true });
writeFileSync(resolve(destination, 'java-field-matrix.json'), bytes);
writeFileSync(
  resolve(destination, 'java-field-matrix-lock.json'),
  JSON.stringify(
    {
      javaCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: javaRoot, encoding: 'utf8' }).trim(),
      sha256: createHash('sha256').update(bytes).digest('hex'),
      caseCount: JSON.parse(bytes.toString()).length,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Copied ${JSON.parse(bytes.toString()).length} Java field concordance cases.`);
