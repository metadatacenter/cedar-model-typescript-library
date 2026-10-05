import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const javaRoot = resolve(root, '../cedar-artifact-library');
// Each Java concordance matrix, and the name its fixture and lock take here.
const matrices = [
  { fixture: 'src/test/resources/concordance/field-matrix.json', name: 'java-field-matrix', what: 'field' },
  { fixture: 'src/test/resources/concordance/instance-value-matrix.json', name: 'java-instance-value-matrix', what: 'instance value' },
];
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'src/main', 'src/test'], { cwd: javaRoot, encoding: 'utf8' });
if (dirty.trim()) throw new Error('Commit the Java implementation, matrix generator and fixture before syncing its provenance.');
const javaCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: javaRoot, encoding: 'utf8' }).trim();
const destination = resolve(root, 'itest/resources/concordance');
mkdirSync(destination, { recursive: true });
for (const matrix of matrices) {
  const bytes = readFileSync(resolve(javaRoot, matrix.fixture));
  const caseCount = JSON.parse(bytes.toString()).length;
  writeFileSync(resolve(destination, `${matrix.name}.json`), bytes);
  writeFileSync(
    resolve(destination, `${matrix.name}-lock.json`),
    JSON.stringify({ javaCommit, sha256: createHash('sha256').update(bytes).digest('hex'), caseCount }, null, 2) + '\n',
  );
  console.log(`Copied ${caseCount} Java ${matrix.what} concordance cases.`);
}
