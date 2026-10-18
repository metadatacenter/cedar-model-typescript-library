import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const javaRoot = resolve(root, '../cedar-artifact-library');
// Each Java concordance matrix, and the name its fixture and lock take here.
const matrices = [
  {
    fixture: 'src/test/resources/concordance/semantic-verification.json',
    name: 'semantic-verification',
    what: 'semantic verification',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  {
    fixture: 'src/test/resources/concordance/configuration-validation.json',
    name: 'configuration-validation',
    what: 'configuration validation',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  {
    fixture: 'src/test/resources/concordance/instance-validation.json',
    name: 'instance-validation',
    what: 'instance validation',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  {
    fixture: 'src/test/resources/concordance/regex-policy.json',
    name: 'regex-policy',
    what: 'regex policy',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  {
    fixture: 'src/test/resources/concordance/timestamp-policy.json',
    name: 'timestamp-policy',
    what: 'timestamp policy',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  {
    fixture: 'src/test/resources/concordance/numeric-policy.json',
    name: 'numeric-policy',
    what: 'numeric policy',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  { fixture: 'src/test/resources/concordance/source-policy.json', name: 'source-policy', what: 'source policy' },
  {
    fixture: 'src/test/resources/concordance/text-policy.json',
    name: 'text-policy',
    what: 'text policy',
    root: resolve(root, '../cedar-model-validation-library'),
  },
  { fixture: 'src/test/resources/concordance/field-matrix.json', name: 'java-field-matrix', what: 'field' },
  { fixture: 'src/test/resources/concordance/instance-value-matrix.json', name: 'java-instance-value-matrix', what: 'instance value' },
  { fixture: 'src/test/resources/concordance/multiplicity-matrix.json', name: 'java-multiplicity-matrix', what: 'multiplicity' },
  { fixture: 'src/test/resources/concordance/rule-matrix.json', name: 'java-rule-matrix', what: 'rule' },
];
const workingTree = process.argv.includes('--working-tree');
const matrixIndex = process.argv.indexOf('--matrix');
const selected = matrixIndex < 0 ? matrices : matrices.filter((matrix) => matrix.name === process.argv[matrixIndex + 1]);
if (!selected.length) throw new Error('Unknown concordance matrix.');
const destination = resolve(root, 'itest/resources/concordance');
mkdirSync(destination, { recursive: true });
for (const matrix of selected) {
  const sourceRoot = matrix.root ?? javaRoot;
  const dirty = execFileSync('git', ['status', '--porcelain', '--', 'src/main', 'src/test'], { cwd: sourceRoot, encoding: 'utf8' });
  if (dirty.trim() && !workingTree)
    throw new Error(
      `Java sources in ${sourceRoot} are uncommitted. Commit before syncing, or use --working-tree to record explicit local-source provenance.`,
    );
  const javaCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim();
  const provenance = { javaCommit };
  if (dirty.trim()) {
    const paths = [
      ...new Set(
        execFileSync('git', ['ls-files', '-co', '--exclude-standard', '--', 'src/main', 'src/test'], { cwd: sourceRoot, encoding: 'utf8' })
          .trim()
          .split('\n'),
      ),
    ].sort();
    const hash = createHash('sha256');
    for (const path of paths) {
      hash.update(path + '\0');
      try {
        hash.update(readFileSync(resolve(sourceRoot, path)));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        hash.update('<deleted>');
      }
      hash.update('\0');
    }
    provenance.javaWorkingTree = true;
    provenance.javaSourceSha256 = hash.digest('hex');
  }
  const bytes = readFileSync(resolve(sourceRoot, matrix.fixture));
  const parsed = JSON.parse(bytes.toString());
  const caseCount = Array.isArray(parsed) ? parsed.length : (parsed.cases ?? parsed.positions.flatMap((position) => position.cases)).length;
  writeFileSync(resolve(destination, `${matrix.name}.json`), bytes);
  writeFileSync(
    resolve(destination, `${matrix.name}-lock.json`),
    JSON.stringify({ ...provenance, sha256: createHash('sha256').update(bytes).digest('hex'), caseCount }, null, 2) + '\n',
  );
  console.log(`Copied ${caseCount} Java ${matrix.what} concordance cases.`);
}
