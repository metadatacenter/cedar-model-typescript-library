import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const directory = process.argv[2];
const readModule = (file) => import(pathToFileURL(resolve(directory, file)).href);
const common = (await readModule('index.js')).default;
const commonSchema = (await readModule('schema.js')).default;
const modular = await readModule('esm/index.js');
const policy = await readModule('esm/policy.js');
const schema = await readModule('esm/schema.js');
for (const entry of ['index', 'policy', 'schema']) {
  const named = await readModule(`esm/${entry}.js`);
  const namespace = await readModule(`esm/${entry}-namespace.js`);
  assert.deepEqual(Object.keys(namespace.default).sort(), Object.keys(named).sort());
  for (const key of Object.keys(named)) assert.equal(namespace.default[key], named[key]);
}
const browser = await import(pathToFileURL(process.argv[3]).href);
assert.deepEqual(Object.keys(modular).sort(), Object.keys(common).sort());
assert.equal(modular.ExactDecimal, policy.ExactDecimal);
assert.equal(modular.TextPolicy, policy.TextPolicy);
assert.equal(browser.ExactDecimal, browser.PolicyExactDecimal);
assert.deepEqual(schema.SchemaArtifactValidator.schemaDigests, commonSchema.SchemaArtifactValidator.schemaDigests);

// A packed consumer exercises real module initialization and class identities.
// Source-level tests cannot catch a broken ESM cycle or duplicated policy class.
const documents = [];
function exercise(api) {
  const template = api.CedarBuilders.templateBuilder().withSchemaName('Packaging').build();
  const jsonWriter = api.CedarWriters.json().getStrict().getTemplateWriter();
  const yamlWriter = api.CedarWriters.yaml().getStrict().getTemplateWriter();
  const json = jsonWriter.getAsJsonString(template);
  const yaml = yamlWriter.getAsYamlString(template);
  const fromJson = api.CedarReaders.json().getStrict().getTemplateReader().readFromString(json).template;
  const fromYaml = api.CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
  assert.equal(fromJson.title, template.title);
  assert.equal(fromYaml.title, template.title);
  assert.ok(fromJson instanceof api.Template);
  assert.ok(fromYaml instanceof api.Template);
  const exact = api.ExactDecimal.forValue('9007199254740993');
  assert.equal(policy.JsonSourcePolicy.stringify(policy.JsonSourcePolicy.clone({ n: exact })), '{"n":9007199254740993}');
  const instance = api.CedarBuilders.templateInstanceBuilder().build();
  const verdict = api.InstanceValidator.validateReport(instance, template);
  documents.push(JSON.parse(json));
  return JSON.stringify({ json, yaml, verdict });
}
const expected = exercise(common);
assert.equal(exercise(modular), expected);
assert.equal(exercise(browser), expected);
const sandbox = { Intl, TextEncoder, TextDecoder, setTimeout, clearTimeout };
vm.runInNewContext(readFileSync(resolve(directory, 'index.umd.js'), 'utf8'), sandbox);
assert.equal(exercise(sandbox.CedarModelTypescriptLibrary), expected);
for (const document of [...documents, {}, { '@type': 'invalid' }]) {
  const expected = commonSchema.SchemaArtifactValidator.validate(document);
  assert.deepEqual(schema.SchemaArtifactValidator.validate(document), expected);
  assert.deepEqual(browser.SchemaArtifactValidator.validate(document), expected);
}
console.log('Packed modular ESM, browser bundle, CommonJS and UMD agree on readers, writers, validation and exact values.');
