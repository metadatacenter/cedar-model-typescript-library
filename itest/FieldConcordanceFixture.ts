import * as fs from 'node:fs';
import * as path from 'node:path';
import { JsonNode } from '../src';

export type Case = {
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
  elementJson: JsonNode;
  elementYaml: string;
  elementCompactYaml: string;
  elementJsonFromYaml: JsonNode;
  elementJsonFromCompactYaml: JsonNode;
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
type JsonDocument = 'json' | 'templateJson' | 'elementJson';
type YamlDocument = 'yaml' | 'compactYaml' | 'templateYaml' | 'templateCompactYaml' | 'elementYaml' | 'elementCompactYaml';
type ReadBack =
  | 'jsonFromYaml'
  | 'jsonFromCompactYaml'
  | 'templateJsonFromYaml'
  | 'templateJsonFromCompactYaml'
  | 'elementJsonFromYaml'
  | 'elementJsonFromCompactYaml';
type Base = Pick<Case, JsonDocument | YamlDocument>;
const READ_BACK: Record<ReadBack, JsonDocument> = {
  jsonFromYaml: 'json',
  jsonFromCompactYaml: 'json',
  templateJsonFromYaml: 'templateJson',
  templateJsonFromCompactYaml: 'templateJson',
  elementJsonFromYaml: 'elementJson',
  elementJsonFromCompactYaml: 'elementJson',
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
  for (const document of ['json', 'templateJson', 'elementJson'] as JsonDocument[]) {
    c[document] = applyChanges(base[document], row[document]);
  }
  const yamlDocuments: YamlDocument[] = ['yaml', 'compactYaml', 'templateYaml', 'templateCompactYaml', 'elementYaml', 'elementCompactYaml'];
  for (const document of yamlDocuments) {
    c[document] = applyLineChanges(base[document], row[document]);
  }
  for (const [document, against] of Object.entries(READ_BACK) as [ReadBack, JsonDocument][]) {
    c[document] = applyChanges(c[against], row[document]);
  }
  return c;
}

const directory = path.join(__dirname, 'resources/concordance');

/** The fixture's bytes, which its lock hashes. */
export const fieldMatrixBytes = fs.readFileSync(path.join(directory, 'java-field-matrix.json'));

/** The provenance the Java library recorded when the fixture was synced. */
export const fieldMatrixLock = JSON.parse(fs.readFileSync(path.join(directory, 'java-field-matrix-lock.json'), 'utf8'));

const fixture = JSON.parse(fieldMatrixBytes.toString()) as { bases: Record<string, Base>; cases: Row[] };

/** Every case of the Java field matrix, rebuilt into the documents Java wrote. */
export const fieldCases: Case[] = fixture.cases.map((row) => expand(row, fixture.bases[row.type]));
