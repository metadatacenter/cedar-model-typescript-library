'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// The name the tarball publishes under, taken from the manifest that carries it rather than repeated
// here: the dev channel publishes scoped to Nexus and a release publishes unscoped to npmjs, and this
// check has to follow whichever the build is set to. It read the unscoped name whatever dist said, so
// it passed on a release manifest and failed on a snapshot for the wrong reason.
const packageName = require('../package-dist.json').name;
const repositoryRoot = path.resolve(__dirname, '..');
const temporaryRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'cedar-package-smoke-')));
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
  assert.equal(packed.version, require('../package.json').version);
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
  assert.ok(
    packed.files.some((file) => file.path === 'README.md'),
    'README.md is missing from the tarball',
  );
  assert.equal(
    fs.readFileSync(path.join(repositoryRoot, 'dist', 'README.md'), 'utf8'),
    fs.readFileSync(path.join(repositoryRoot, 'README.md'), 'utf8'),
    'the tarball README differs from the GitHub README',
  );

  write('package.json', JSON.stringify({ name: 'cedar-package-smoke-consumer', private: true, type: 'module' }, null, 2));
  const tarball = path.join(temporaryRoot, packed.filename);
  run(npmCommand, ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball], temporaryRoot);

  const installedPackage = path.join(temporaryRoot, 'node_modules', ...packageName.split('/'));
  for (const filename of [
    'policy.js',
    'policy.esm.js',
    'policy.umd.js',
    'policy.d.ts',
    'schema.js',
    'schema.esm.js',
    'schema.umd.js',
    'schema.d.ts',
    'conformance/java-oracle.mjs',
    'conformance/CedarSchemaOracle.java',
    'conformance/pom.xml',
  ]) {
    assert.ok(
      packed.files.some((file) => file.path === filename),
      `${filename} missing from package`,
    );
  }
  const schema = require(path.join(installedPackage, 'schema.js'));
  assert.equal(schema.SchemaArtifactValidator.structure({}).canSave, false);
  assert.equal(Object.keys(schema.SchemaArtifactValidator.schemaDigests).length, 6);
  const policy = require(path.join(installedPackage, 'policy.js'));
  assert.equal(policy.TextPolicy.isBlank('\u001c'), true);
  assert.equal(policy.TextPolicy.isBlank('\u00a0'), false);
  assert.equal(policy.IdentifierPolicy.isValid('urn:x\ud800'), false);
  const qualityFinding = policy.ValidationPolicy.finding('minValue', '/Count/@value', 'Below minimum');
  assert.equal(policy.ValidationPolicy.summarize([qualityFinding], 'instance').canSave, true);
  assert.equal(policy.ValidationPolicy.summarize([qualityFinding], 'template').canSave, false);
  assert.ok(fs.statSync(path.join(installedPackage, 'policy.js')).size < 27000);
  assert.deepEqual(policy.readConstraintLinks({ landingPage: 'https://example.org' }), { landingPage: 'https://example.org' });
  assert.throws(() => policy.readConstraintLinks({ icon: 'javascript:alert(1)' }));
  const fullModel = require(installedPackage);
  const outside = fullModel.ExactDecimal.forValue('9007199254740993');
  assert.equal(policy.JsonSourcePolicy.stringify(policy.JsonSourcePolicy.clone({ n: outside })), '{"n":9007199254740993}');
  const vm = require('node:vm');
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(path.join(installedPackage, 'policy.umd.js'), 'utf8'), sandbox);
  assert.equal(sandbox.CedarValidationPolicy.TextPolicy.codePointLength('😀'), 1);
  fs.copyFileSync(path.join(installedPackage, 'policy.esm.js'), path.join(temporaryRoot, 'cedar-policy.mjs'));
  const commonJsConsumer = `
const assert = require('node:assert/strict');
const cedar = require('${packageName}');
const policy = require('${packageName}/policy');
assert.equal(policy.TextPolicy.codePointLength('😀'), 1);
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
import { TextPolicy } from './cedar-policy.mjs';
assert.equal(TextPolicy.codePointLength('😀'), 1);
assert.equal(typeof cedarCommonJs.CedarReaders.json, 'function');
assert.ok(Object.keys(cedarEsm).length >= 100, 'ES module bundle exports are unexpectedly sparse');
assert.equal(typeof cedarEsm.CedarWriters.yaml, 'function');
const field = cedarEsm.CedarBuilders.textFieldBuilder().withTitle('smoke test').build();
assert.equal(field.title, 'smoke test');
const paragraph = cedarEsm.CedarBuilders.textAreaBuilder().withMinLength(20).withMaxLength(500).build();
assert.equal(paragraph.valueConstraints.minLength, 20);
assert.equal(paragraph.valueConstraints.maxLength, 500);
`;
  write('consumer.mjs', esModuleConsumer);
  run(process.execPath, ['consumer.mjs'], temporaryRoot);

  // Import the public subpath through a browser bundler. Loading policy.esm.js directly
  // above proves the file works, but misses a package that resolves /policy to CommonJS.
  write(
    'browser-consumer.js',
    `
import { JsonSourcePolicy, TextPolicy } from '${packageName}/policy';
export const json = JsonSourcePolicy.stringify(JsonSourcePolicy.parse('{"n":9007199254740993}'));
export const length = TextPolicy.codePointLength('😀');
`,
  );
  write(
    'webpack.config.cjs',
    `module.exports = ${JSON.stringify({
      mode: 'production',
      target: 'web',
      entry: './browser-consumer.js',
      module: { rules: [{ include: path.join(temporaryRoot, 'browser-consumer.js'), resolve: { fullySpecified: false } }] },
      output: {
        path: path.join(temporaryRoot, 'browser'),
        filename: 'consumer.mjs',
        library: { type: 'module' },
      },
      experiments: { outputModule: true },
    })};`,
  );
  try {
    run(
      process.execPath,
      [require.resolve('webpack/bin/webpack.js'), '--config', 'webpack.config.cjs', '--json', 'browser-stats.json'],
      temporaryRoot,
    );
  } catch (error) {
    const statsPath = path.join(temporaryRoot, 'browser-stats.json');
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      throw new Error(stats.errors.map((entry) => entry.message).join('\n'), { cause: error });
    }
    throw error;
  }
  const browserStats = JSON.parse(fs.readFileSync(path.join(temporaryRoot, 'browser-stats.json'), 'utf8'));
  const browserModules = [...browserStats.modules];
  for (let i = 0; i < browserModules.length; i++) browserModules.push(...(browserModules[i].modules ?? []));
  const browserFiles = browserModules.map((module) => module.nameForCondition);
  assert.ok(browserFiles.includes(path.join(installedPackage, 'policy.esm.js')), 'browser /policy import must resolve to ESM');
  for (const filename of ['policy.js', 'index.js', 'index.esm.js']) {
    assert.ok(!browserFiles.includes(path.join(installedPackage, filename)), `browser /policy import must not include ${filename}`);
  }
  write(
    'browser-check.mjs',
    `
import assert from 'node:assert/strict';
import { json, length } from './browser/consumer.mjs';
assert.equal(json, '{"n":9007199254740993}');
assert.equal(length, 1);
`,
  );
  run(process.execPath, ['browser-check.mjs'], temporaryRoot);

  const typeScriptConsumer = `
import { CedarBuilders, CedarReaders, CedarWriters, Template, TextArea } from '${packageName}';
import { TextPolicy } from '${packageName}/policy';
const count: number = TextPolicy.codePointLength('😀');
void count;
const template: Template = CedarBuilders.templateBuilder().withTitle('typed consumer').build();
const readers = CedarReaders.json().getStrict();
const writers = CedarWriters.yaml().getStrict();
const paragraph: TextArea = CedarBuilders.textAreaBuilder().withMinLength(20).withMaxLength(500).build();
const minimum: number | null = paragraph.valueConstraints.minLength;
const maximum: number | null = paragraph.valueConstraints.maxLength;
void [template, readers, writers, minimum, maximum];
`;
  // A CommonJS consumer under Node's own resolution. The consumer project is an ES module package,
  // so only the .cts extension makes this file CommonJS.
  write('consumer.cts', typeScriptConsumer);
  write(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['ES2022'],
          module: 'Node16',
          moduleResolution: 'Node16',
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: 'ES2022',
        },
        files: ['consumer.cts'],
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
