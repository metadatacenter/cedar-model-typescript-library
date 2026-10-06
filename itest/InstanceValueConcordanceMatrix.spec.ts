import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as YAML from 'yaml';
import { CedarReaders, CedarWriters, JsonNode } from '../src';

/**
 * Every shape a field value can take, at the root of an instance, inside an element and as a
 * repeated item, as the Java library reads and writes it.
 *
 * Each library decided for itself which keys a value may carry. This one threw on a controlled term
 * carrying both `rdfs:label` and `skos:prefLabel`, the form the YAML specification documents,
 * because it read the node as an element whose child names may not be `rdfs:label`. It also dropped
 * a preferred label from a literal. Each case here is what Java wrote, so this library is held to
 * Java's reading rather than to its own.
 */
type Case = {
  id: string;
  node: string;
  position: string;
  value: JsonNode;
  json: JsonNode;
  yaml: string;
  compactYaml: string;
  jsonFromYaml: JsonNode;
  jsonFromCompactYaml: JsonNode;
};
const directory = path.join(__dirname, 'resources/concordance');
const bytes = fs.readFileSync(path.join(directory, 'java-instance-value-matrix.json'));
const cases = JSON.parse(bytes.toString()) as Case[];
const lock = JSON.parse(fs.readFileSync(path.join(directory, 'java-instance-value-matrix-lock.json'), 'utf8'));
const jsonReader = CedarReaders.json().getStrict().getTemplateInstanceReader();
const jsonWriter = CedarWriters.json().getStrict().getTemplateInstanceWriter();
const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();

it('pins Java fixture provenance', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(cases).toHaveLength(lock.caseCount);
  expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
});

for (const row of cases) {
  describe(row.id, () => {
    it('Java JSON → TS model → JSON is what Java wrote', () => {
      const instance = jsonReader.readFromObject(row.json).instance;
      expect(jsonWriter.getAsJsonNode(instance)).toEqual(row.json);
    });
    for (const compact of [false, true]) {
      const yamlReader = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
      const yaml = compact ? row.compactYaml : row.yaml;
      it(`${compact ? 'compact' : 'full'} YAML is what Java writes, and reads back as Java reads it`, () => {
        const instance = jsonReader.readFromObject(row.json).instance;
        expect(YAML.parse(yamlWriter.getAsYamlString(instance, compact))).toEqual(YAML.parse(yaml));
        const read = yamlReader.getTemplateInstanceReader().readFromString(yaml).instance;
        expect(jsonWriter.getAsJsonNode(read)).toEqual(compact ? row.jsonFromCompactYaml : row.jsonFromYaml);
      });
    }
  });
}
