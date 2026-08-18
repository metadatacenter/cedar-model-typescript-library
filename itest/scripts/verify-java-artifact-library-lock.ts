import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface LockedCollection {
  fileCount: number;
  sha256: string;
}

interface LockFile {
  javaArtifactLibrary: { gitCommit: string };
  sharedCorpus: { gitCommit: string };
  collections: Record<string, LockedCollection>;
}

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const VENDORED_JAVA_ROOT = path.join(PROJECT_ROOT, 'cedar-artifact-library/src/test/resources/templates');
const VENDORED_CORPUS_ROOT = path.join(PROJECT_ROOT, 'cedar-test-artifacts/artifacts');
const lock = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'itest/resources/javaArtifactLibraryLock.json'), 'utf8')) as LockFile;

const walk = (directory: string): string[] =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(absolute) : [absolute];
    })
    .sort();

const sourceJson = (file: string): boolean => /\/(?:field|element|template|instance)-\d+\.json$/.test(file);

const collections = (javaRoot: string, corpusRoot: string): Record<string, { root: string; files: string[] }> => {
  const corpusFiles = walk(corpusRoot);
  return {
    javaReferenceTemplates: { root: javaRoot, files: walk(javaRoot).filter((file) => file.endsWith('.json')) },
    sharedArtifactInputs: { root: corpusRoot, files: corpusFiles.filter(sourceJson) },
    sharedJavaJsonFixtures: {
      root: corpusRoot,
      files: corpusFiles.filter((file) => file.endsWith('-generated-java-artifact-lib.json')),
    },
    sharedJavaYamlFixtures: {
      root: corpusRoot,
      files: corpusFiles.filter(
        (file) => file.endsWith('-generated-java-artifact-lib.yaml') || file.endsWith('-generated-java-artifact-lib.compact.yaml'),
      ),
    },
    ceeSuite: {
      root: corpusRoot,
      files: corpusFiles.filter((file) => file.includes(`${path.sep}cee-suite${path.sep}`) && file.endsWith('.json')),
    },
  };
};

const digest = (root: string, files: string[]): string => {
  const hash = createHash('sha256');
  for (const file of files) {
    const bytes = fs.readFileSync(file);
    hash.update(path.relative(root, file).split(path.sep).join('/'));
    hash.update('\0');
    hash.update(String(bytes.length));
    hash.update('\0');
    hash.update(bytes);
    hash.update('\0');
  }
  return hash.digest('hex');
};

const verifyCollections = (javaRoot: string, corpusRoot: string, label: string): number => {
  let failures = 0;
  const actualCollections = collections(javaRoot, corpusRoot);
  for (const unexpected of Object.keys(lock.collections).filter((name) => !(name in actualCollections))) {
    console.error(`${label}: lock declares unknown collection ${unexpected}`);
    failures++;
  }
  for (const [name, collection] of Object.entries(actualCollections)) {
    const actual = { fileCount: collection.files.length, sha256: digest(collection.root, collection.files) };
    const expected = lock.collections[name];
    if (expected === undefined || actual.fileCount !== expected.fileCount || actual.sha256 !== expected.sha256) {
      console.error(`${label} ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      failures++;
    } else {
      console.log(`${label} ${name}: ${actual.fileCount} files, ${actual.sha256}`);
    }
  }
  return failures;
};

let failures = verifyCollections(VENDORED_JAVA_ROOT, VENDORED_CORPUS_ROOT, 'vendored');

if (process.argv.includes('--check-siblings')) {
  const cedarRoot = path.resolve(PROJECT_ROOT, '..');
  const javaRepository = path.join(cedarRoot, 'cedar-artifact-library');
  const corpusRepository = path.join(cedarRoot, 'cedar-test-artifacts');
  const revisions = [
    [javaRepository, lock.javaArtifactLibrary.gitCommit, 'Java artifact library'],
    [corpusRepository, lock.sharedCorpus.gitCommit, 'shared corpus'],
  ] as const;

  for (const [repository, expected, label] of revisions) {
    const actual = execFileSync('git', ['-C', repository, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (actual !== expected) {
      console.error(`${label}: expected commit ${expected}, got ${actual}`);
      failures++;
    } else {
      console.log(`${label}: commit ${actual}`);
    }
  }

  failures += verifyCollections(
    path.join(javaRepository, 'src/test/resources/templates'),
    path.join(corpusRepository, 'artifacts'),
    'source',
  );
}

if (failures > 0) {
  console.error(`\nJava compatibility lock failed with ${failures} mismatch${failures === 1 ? '' : 'es'}.`);
  process.exitCode = 1;
} else {
  console.log('\nJava compatibility lock is current.');
}
