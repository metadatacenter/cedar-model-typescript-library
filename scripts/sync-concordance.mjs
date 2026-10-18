import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const javaRoot = resolve(root, '../cedar-artifact-library');
// Each Java concordance matrix, and the name its fixture and lock take here.
const matrices = [
  { fixture: 'src/test/resources/concordance/regex-policy.json', name: 'regex-policy', what: 'regex policy', root: resolve(root, '../cedar-model-validation-library') },
  { fixture: 'src/test/resources/concordance/timestamp-policy.json', name: 'timestamp-policy', what: 'timestamp policy', root: resolve(root, '../cedar-model-validation-library') },
  { fixture: 'src/test/resources/concordance/numeric-policy.json', name: 'numeric-policy', what: 'numeric policy', root: resolve(root, '../cedar-model-validation-library') },
  { fixture: 'src/test/resources/concordance/source-policy.json', name: 'source-policy', what: 'source policy' },
  { fixture: 'src/test/resources/concordance/text-policy.json', name: 'text-policy', what: 'text policy', root: resolve(root, '../cedar-model-validation-library') },
  { fixture: 'src/test/resources/concordance/field-matrix.json', name: 'java-field-matrix', what: 'field' },
  { fixture: 'src/test/resources/concordance/instance-value-matrix.json', name: 'java-instance-value-matrix', what: 'instance value' },
  { fixture: 'src/test/resources/concordance/multiplicity-matrix.json', name: 'java-multiplicity-matrix', what: 'multiplicity' },
  { fixture: 'src/test/resources/concordance/rule-matrix.json', name: 'java-rule-matrix', what: 'rule' },
];
const destination = resolve(root, 'itest/resources/concordance');
mkdirSync(destination, { recursive: true });
for (const matrix of matrices) {
  const sourceRoot = matrix.root ?? javaRoot;
  const dirty = execFileSync('git', ['status', '--porcelain', '--', 'src/main', 'src/test'], { cwd: sourceRoot, encoding: 'utf8' });
  if (dirty.trim()) throw new Error(`Commit the Java implementation, matrix and fixture in ${sourceRoot} before syncing provenance.`);
  const javaCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim();
  const bytes = readFileSync(resolve(sourceRoot, matrix.fixture));
  const parsed = JSON.parse(bytes.toString());
  const caseCount = Array.isArray(parsed)
    ? parsed.length
    : (parsed.cases ?? parsed.positions.flatMap((position) => position.cases)).length;
  writeFileSync(resolve(destination, `${matrix.name}.json`), bytes);
  writeFileSync(
    resolve(destination, `${matrix.name}-lock.json`),
    JSON.stringify({ javaCommit, sha256: createHash('sha256').update(bytes).digest('hex'), caseCount }, null, 2) + '\n',
  );
  console.log(`Copied ${caseCount} Java ${matrix.what} concordance cases.`);
}
