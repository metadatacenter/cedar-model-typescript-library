'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const packageName = '@org.metadatacenter/cedar-model-typescript-library';
const repositoryRoot = __dirname;
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cedar-package-smoke-'));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error([`Command failed: ${command} ${args.join(' ')}`, result.stdout, result.stderr].filter((part) => part).join('\n'));
  }

  return result.stdout.trim();
}

function write(name, content) {
  fs.writeFileSync(path.join(temporaryRoot, name), content);
}

try {
  const packOutput = run(
    npmCommand,
    ['pack', path.join(repositoryRoot, 'dist'), '--json', '--pack-destination', temporaryRoot],
    repositoryRoot,
  );
  const [packed] = JSON.parse(packOutput);

  assert.equal(packed.name, packageName);
  assert.equal(packed.version, require('./package.json').version);
  assert.ok(
    packed.files.some((file) => file.path === 'index.js'),
    'CommonJS bundle is missing from the tarball',
  );
  assert.ok(
    packed.files.some((file) => file.path === 'index.esm.js'),
    'ES module bundle is missing from the tarball',
  );
  assert.ok(
    packed.files.some((file) => file.path === 'index.d.ts'),
    'TypeScript declarations are missing from the tarball',
  );

  write('package.json', JSON.stringify({ name: 'cedar-package-smoke-consumer', private: true, type: 'module' }, null, 2));
  const tarball = path.join(temporaryRoot, packed.filename);
  run(npmCommand, ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball], temporaryRoot);

  const installedPackage = path.join(temporaryRoot, 'node_modules', ...packageName.split('/'));
  const commonJsConsumer = `
const assert = require('node:assert/strict');
const cedar = require('${packageName}');
assert.ok(Object.keys(cedar).length >= 100, 'CommonJS package exports are unexpectedly sparse');
assert.equal(typeof cedar.CedarBuilders.templateBuilder, 'function');
const template = cedar.CedarBuilders.templateBuilder().build();
assert.equal(template.cedarArtifactType, cedar.CedarArtifactType.TEMPLATE);
`;
  write('consumer.cjs', commonJsConsumer);
  run(process.execPath, ['consumer.cjs'], temporaryRoot);

  fs.copyFileSync(path.join(installedPackage, 'index.esm.js'), path.join(temporaryRoot, 'cedar-index.mjs'));
  const esModuleConsumer = `
import assert from 'node:assert/strict';
import cedarCommonJs from '${packageName}';
import * as cedarEsm from './cedar-index.mjs';
assert.equal(typeof cedarCommonJs.CedarReaders.json, 'function');
assert.ok(Object.keys(cedarEsm).length >= 100, 'ES module bundle exports are unexpectedly sparse');
assert.equal(typeof cedarEsm.CedarWriters.yaml, 'function');
const field = cedarEsm.CedarBuilders.textFieldBuilder().withTitle('smoke test').build();
assert.equal(field.title, 'smoke test');
`;
  write('consumer.mjs', esModuleConsumer);
  run(process.execPath, ['consumer.mjs'], temporaryRoot);

  const typeScriptConsumer = `
import { CedarBuilders, CedarReaders, CedarWriters, Template } from '${packageName}';
const template: Template = CedarBuilders.templateBuilder().withTitle('typed consumer').build();
const readers = CedarReaders.json().getStrict();
const writers = CedarWriters.yaml().getStrict();
void [template, readers, writers];
`;
  write('consumer.ts', typeScriptConsumer);
  write(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['ES2022'],
          module: 'CommonJS',
          moduleResolution: 'Node',
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: 'ES2022',
        },
        files: ['consumer.ts'],
      },
      null,
      2,
    ),
  );
  run(
    process.execPath,
    [path.join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '--project', 'tsconfig.json'],
    temporaryRoot,
  );

  console.log(`Packed consumer smoke test passed for ${packed.name}@${packed.version}`);
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
