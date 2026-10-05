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
/**
 * The fixture records each field type's baseline whole, and every other case as what it changes: in
 * its JSON, the keys it sets and removes; in its YAML, the lines it replaces; and a document read back
 * from YAML against the case's own JSON. Java asserts that each case rebuilds exactly what it wrote,
 * so rebuilding it here gives Java's output.
 */
type Change = { at: string[]; set?: JsonNode; remove?: true };
type LineChanges = { keep: [number, number]; lines: string[] };
type Row = Omit<Case, JsonDocument | YamlDocument | ReadBack> &
  Record<JsonDocument | ReadBack, Change[]> &
  Record<YamlDocument, LineChanges>;
type JsonDocument = 'json' | 'templateJson';
type YamlDocument = 'yaml' | 'compactYaml' | 'templateYaml' | 'templateCompactYaml';
type ReadBack = 'jsonFromYaml' | 'jsonFromCompactYaml' | 'templateJsonFromYaml' | 'templateJsonFromCompactYaml';
type Base = Pick<Case, JsonDocument | YamlDocument>;
const READ_BACK: Record<ReadBack, JsonDocument> = {
  jsonFromYaml: 'json',
  jsonFromCompactYaml: 'json',
  templateJsonFromYaml: 'templateJson',
  templateJsonFromCompactYaml: 'templateJson',
};

function applyChanges(from: JsonNode, changes: Change[]): JsonNode {
  let result = structuredClone(from);
  for (const change of changes) {
    if (change.at.length === 0) {
      result = structuredClone(change.set as JsonNode);
      continue;
    }
    let parent = result as Record<string, JsonNode>;
    for (const key of change.at.slice(0, -1)) parent = parent[key] as Record<string, JsonNode>;
    const key = change.at[change.at.length - 1];
    if (change.remove) delete parent[key];
    else parent[key] = structuredClone(change.set as JsonNode);
  }
  return result;
}

function applyLineChanges(from: string, changes: LineChanges): string {
  const lines = from.split('\n');
  const [prefix, suffix] = changes.keep;
  return [...lines.slice(0, prefix), ...changes.lines, ...lines.slice(lines.length - suffix)].join('\n');
}

function expand(row: Row, base: Base): Case {
  const c = { id: row.id, type: row.type, feature: row.feature } as Case;
  c.json = applyChanges(base.json, row.json);
  c.templateJson = applyChanges(base.templateJson, row.templateJson);
  for (const document of ['yaml', 'compactYaml', 'templateYaml', 'templateCompactYaml'] as YamlDocument[]) {
    c[document] = applyLineChanges(base[document], row[document]);
  }
  for (const [document, against] of Object.entries(READ_BACK) as [ReadBack, JsonDocument][]) {
    c[document] = applyChanges(c[against], row[document]);
  }
  return c;
}

const directory = path.join(__dirname, 'resources/concordance');
const bytes = fs.readFileSync(path.join(directory, 'java-field-matrix.json'));
const fixture = JSON.parse(bytes.toString()) as { bases: Record<string, Base>; cases: Row[] };
const cases: Case[] = fixture.cases.map((row) => expand(row, fixture.bases[row.type]));
const lock = JSON.parse(fs.readFileSync(path.join(directory, 'java-field-matrix-lock.json'), 'utf8'));
const jsonReaders = CedarReaders.json().getStrict();
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();

it('pins Java fixture provenance and covers every TypeScript field type', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(cases).toHaveLength(lock.caseCount);
  expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
  const baseline = cases.filter((c) => c.feature === 'baseline');
  const covered = baseline.map((c) => jsonReaders.getTemplateFieldReader().readFromObject(c.json).field.cedarFieldType);
  expect(new Set(covered)).toEqual(new Set(CedarFieldType.values()));
});

for (const row of cases) {
  describe(row.id, () => {
    it('Java JSON → TS model → JSON preserves the entire field definition', () => {
      const field = jsonReaders.getTemplateFieldReader().readFromObject(row.json).field;
      expect(jsonWriters.getFieldWriterForField(field).getAsJsonNode(field)).toEqual(row.json);
    });
    it('Java template JSON → TS model → JSON preserves the field and deployment', () => {
      const template = jsonReaders.getTemplateReader().readFromObject(row.templateJson).template;
      expect(jsonWriters.getTemplateWriter().getAsJsonNode(template)).toEqual(row.templateJson);
    });
    for (const compact of [false, true]) {
      const yamlReaders = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
      const fieldYaml = compact ? row.compactYaml : row.yaml;
      const templateYaml = compact ? row.templateCompactYaml : row.templateYaml;
      it(`${compact ? 'compact' : 'full'} field YAML agrees and reader JSON follows the Java lifecycle policy`, () => {
        const original = jsonReaders.getTemplateFieldReader().readFromObject(row.json).field;
        const written = yamlWriters.getFieldWriterForField(original).getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(fieldYaml));
        const read = yamlReaders.getTemplateFieldReader().readFromString(fieldYaml).field;
        const actual = jsonWriters.getFieldWriterForField(read).getAsJsonNode(read);
        expect(actual).toEqual(compact ? row.jsonFromCompactYaml : row.jsonFromYaml);
      });
      it(`${compact ? 'compact' : 'full'} template YAML agrees and reader JSON preserves deployment under the Java lifecycle policy`, () => {
        const original = jsonReaders.getTemplateReader().readFromObject(row.templateJson).template;
        const written = yamlWriters.getTemplateWriter().getAsYamlString(original, compact);
        expect(YAML.parse(written)).toEqual(YAML.parse(templateYaml));
        const read = yamlReaders.getTemplateReader().readFromString(templateYaml).template;
        const actual = jsonWriters.getTemplateWriter().getAsJsonNode(read);
        expect(actual).toEqual(compact ? row.templateJsonFromCompactYaml : row.templateJsonFromYaml);
      });
    }
  });
}
