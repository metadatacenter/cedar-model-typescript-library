import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as YAML from 'yaml';
import { CedarReaders, CedarWriters, CedarFieldType, JsonNode } from '../src';

type Case = {
  id: string;
  type: string;
  feature: string;
  json: JsonNode;
  templateJson: JsonNode;
  yaml: string;
  compactYaml: string;
  templateYaml: string;
  templateCompactYaml: string;
  jsonFromYaml: JsonNode;
  jsonFromCompactYaml: JsonNode;
  templateJsonFromYaml: JsonNode;
  templateJsonFromCompactYaml: JsonNode;
};
const directory = path.join(__dirname, 'resources/concordance');
const bytes = fs.readFileSync(path.join(directory, 'java-field-matrix.json'));
const cases = JSON.parse(bytes.toString()) as Case[];
const lock = JSON.parse(fs.readFileSync(path.join(directory, 'java-field-matrix-lock.json'), 'utf8'));
const definition = (json: JsonNode): JsonNode => (json['items'] as JsonNode) ?? json;
const jsonReaders = CedarReaders.json().getStrict();
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();

/** Compact YAML omits lifecycle metadata. Java supplies root defaults; TS preserves absence.
 * Pin the exact two-key difference instead of ignoring lifecycle values throughout the tree. */
function expectCompactRoot(actual: JsonNode, java: JsonNode): void {
  expect(java['pav:version']).toBe('0.0.1');
  expect(java['bibo:status']).toBe('bibo:draft');
  expect(actual).not.toHaveProperty('pav:version');
  expect(actual).not.toHaveProperty('bibo:status');
  const expected = { ...java };
  delete expected['pav:version'];
  delete expected['bibo:status'];
  expect(actual).toEqual(expected);
}

it('pins Java fixture provenance and covers every TypeScript field type', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(cases).toHaveLength(lock.caseCount);
  expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
  const baseline = cases.filter((c) => c.feature === 'baseline');
  const covered = baseline.map((c) => jsonReaders.getTemplateFieldReader().readFromObject(definition(c.json)).field.cedarFieldType);
  expect(new Set(covered)).toEqual(new Set(CedarFieldType.values()));
});

for (const row of cases) {
  describe(row.id, () => {
    it('Java JSON → TS model → JSON preserves the entire field definition', () => {
      const field = jsonReaders.getTemplateFieldReader().readFromObject(definition(row.json)).field;
      expect(jsonWriters.getFieldWriterForField(field).getAsJsonNode(field)).toEqual(definition(row.json));
    });
    it('Java template JSON → TS model → JSON preserves the field and deployment', () => {
      const template = jsonReaders.getTemplateReader().readFromObject(row.templateJson).template;
      expect(jsonWriters.getTemplateWriter().getAsJsonNode(template)).toEqual(row.templateJson);
    });
    for (const compact of [false, true]) {
      const yamlReaders = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
      const fieldYaml = compact ? row.compactYaml : row.yaml;
      const templateYaml = compact ? row.templateCompactYaml : row.templateYaml;
      it(`${compact ? 'compact' : 'full'} field YAML agrees and reader JSON follows the pinned lifecycle policy`, () => {
        const original = jsonReaders.getTemplateFieldReader().readFromObject(definition(row.json)).field;
        const written = yamlWriters.getFieldWriterForField(original).getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(fieldYaml));
        const read = yamlReaders.getTemplateFieldReader().readFromString(fieldYaml).field;
        const actual = jsonWriters.getFieldWriterForField(read).getAsJsonNode(read);
        if (compact) expectCompactRoot(actual, definition(row.jsonFromCompactYaml));
        else expect(actual).toEqual(definition(row.jsonFromYaml));
      });
      it(`${compact ? 'compact' : 'full'} template YAML agrees and reader JSON preserves deployment under the pinned lifecycle policy`, () => {
        const original = jsonReaders.getTemplateReader().readFromObject(row.templateJson).template;
        const written = yamlWriters.getTemplateWriter().getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(templateYaml));
        const read = yamlReaders.getTemplateReader().readFromString(templateYaml).template;
        const actual = jsonWriters.getTemplateWriter().getAsJsonNode(read);
        if (compact) expectCompactRoot(actual, row.templateJsonFromCompactYaml);
        else expect(actual).toEqual(row.templateJsonFromYaml);
      });
    }
  });
}
