'use strict';

// Parity is a verification operation: generate into an isolated tree, compare that output to Java,
// and also require the committed TypeScript fixtures to be current. The explicit `generate:*`
// commands remain the intentional way to refresh those fixtures.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repositoryRoot = path.resolve(__dirname, '../..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tsNodeBin = require.resolve('ts-node/dist/bin.js');

const modes = {
  json: [
    [npmCommand, ['run', 'verify:java-lock']],
    [npmCommand, ['run', 'generate:json:ts']],
    [process.execPath, [tsNodeBin, './itest/scripts/verify-ts-java-json-parity.ts']],
  ],
  yaml: [
    [npmCommand, ['run', 'generate:yaml:ts']],
    [npmCommand, ['run', 'generate:yaml:compact:ts']],
    [process.execPath, [tsNodeBin, './itest/scripts/verify-ts-java-yaml-parity.ts']],
  ],
  'yaml-compact': [
    [npmCommand, ['run', 'generate:yaml:compact:ts']],
    [process.execPath, [tsNodeBin, './itest/scripts/compare-verbatim-ts-java-yaml-compact-files.ts']],
  ],
  'yaml-instances': [
    [npmCommand, ['run', 'generate:yaml:instances:ts']],
    [process.execPath, [tsNodeBin, './itest/scripts/compare-verbatim-ts-java-yaml-instance-files.ts']],
  ],
};

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status}: ${command} ${args.join(' ')}`);
  }
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

function verifyCommittedFixtures(temporaryRoot, mode) {
  const generatedFiles = listFiles(temporaryRoot);
  if (generatedFiles.length === 0) {
    throw new Error('Parity run generated no TypeScript fixtures');
  }

  const stale = [];
  for (const generatedFile of generatedFiles) {
    const relativePath = path.relative(temporaryRoot, generatedFile);
    const committedFile = path.join(repositoryRoot, relativePath);
    if (!fs.existsSync(committedFile) || !fs.readFileSync(generatedFile).equals(fs.readFileSync(committedFile))) {
      stale.push(relativePath);
    }
  }

  if (stale.length > 0) {
    const commands = {
      json: 'npm run generate:json:ts',
      yaml: 'npm run generate:yaml:ts && npm run generate:yaml:compact:ts',
      'yaml-compact': 'npm run generate:yaml:compact:ts',
      'yaml-instances': 'npm run generate:yaml:instances:ts',
    };
    throw new Error(
      `Committed TypeScript fixtures are stale:\n  ${stale.join('\n  ')}\n` + `Regenerate and review them with: ${commands[mode]}`,
    );
  }

  console.log(`Committed TypeScript fixtures are current (${generatedFiles.length} checked).`);
}

const mode = process.argv[2];
const steps = modes[mode];
if (!steps) {
  console.error(`Usage: node itest/scripts/run-parity.js ${Object.keys(modes).join('|')}`);
  process.exitCode = 2;
} else {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cedar-parity-'));
  try {
    const env = {
      ...process.env,
      CEDAR_HOME: '.',
      CEDAR_GENERATED_OUTPUT_ROOT: temporaryRoot,
    };
    for (const [command, args] of steps) {
      run(command, args, env);
    }
    verifyCommittedFixtures(temporaryRoot, mode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
