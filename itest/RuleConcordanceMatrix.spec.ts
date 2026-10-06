import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import * as YAML from 'yaml';
import { CedarReaders, CedarWriters, JsonNode } from '../src';

/**
 * Every name, version and IRI rule, at each position the rule governs, as the Java library's readers
 * judge it, and this library's readers held to the same verdicts.
 *
 * Which names a child or an invented attribute may take, what a version looks like and what an IRI
 * is were each decided separately by the validator, by the Java readers and by this library, and the
 * copies disagreed. Each case puts one input into one position of an artifact every checker accepts,
 * and records whether each reader takes the result unchanged, rewrites it or refuses it. This
 * library's JSON and YAML readers must give the verdict Java's reader of the same form gives. Java
 * has a reader for a standalone element instance and this library does not, so those cases are
 * Java's alone.
 */
type Verdict = 'accepted' | 'rewritten' | 'refused' | 'crashed';
type Case = { input: string; value?: string; expected: Verdict | null; java: Record<string, Verdict> };
type Position = { rule: string; name: string; base: string; slot: string; cases: Case[] };
type Fixture = { bases: Record<string, { json: JsonNode; yaml: JsonNode }>; positions: Position[] };

const directory = path.join(__dirname, 'resources/concordance');
const bytes = fs.readFileSync(path.join(directory, 'java-rule-matrix.json'));
const fixture = JSON.parse(bytes.toString()) as Fixture;
const lock = JSON.parse(fs.readFileSync(path.join(directory, 'java-rule-matrix-lock.json'), 'utf8'));
const jsonReaders = CedarReaders.json().getStrict();
const yamlReaders = CedarReaders.yaml().getStrict();
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();

/**
 * A copy with every key and string equal to `from` replaced by `to`. `Object.fromEntries` defines
 * each key as the object's own, as `JSON.parse` does, so a key of `__proto__` stays a key rather
 * than setting the copy's prototype.
 */
function replace(node: unknown, from: string, to: string): unknown {
  if (typeof node === 'string') return node === from ? to : node;
  if (Array.isArray(node)) return node.map((item) => replace(item, from, to));
  if (node !== null && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key === from ? to : key, replace(value, from, to)]));
  }
  return node;
}

type Lane = {
  read: (document: JsonNode) => { artifact: unknown; successful: boolean };
  write: (artifact: unknown) => JsonNode;
};

const lanes: Record<string, Partial<Record<'json' | 'yaml', Lane>>> = {
  template: {
    json: {
      read: (d) => outcome(jsonReaders.getTemplateReader().readFromObject(d), 'template'),
      write: (a: any) => jsonWriters.getTemplateWriter().getAsJsonNode(a),
    },
    yaml: {
      read: (d) => outcome(yamlReaders.getTemplateReader().readFromObject(d), 'template'),
      write: (a: any) => YAML.parse(yamlWriters.getTemplateWriter().getAsYamlString(a)),
    },
  },
  element: {
    json: {
      read: (d) => outcome(jsonReaders.getTemplateElementReader().readFromObject(d), 'element'),
      write: (a: any) => jsonWriters.getTemplateElementWriter().getAsJsonNode(a),
    },
    yaml: {
      read: (d) => outcome(yamlReaders.getTemplateElementReader().readFromString(YAML.stringify(d)), 'element'),
      write: (a: any) => YAML.parse(yamlWriters.getTemplateElementWriter().getAsYamlString(a)),
    },
  },
  field: fieldLanes(),
  staticField: fieldLanes(),
  templateInstance: {
    json: {
      read: (d) => outcome(jsonReaders.getTemplateInstanceReader().readFromObject(d), 'instance'),
      write: (a: any) => jsonWriters.getTemplateInstanceWriter().getAsJsonNode(a),
    },
    yaml: {
      read: (d) => outcome(yamlReaders.getTemplateInstanceReader().readFromObject(d), 'instance'),
      write: (a: any) => YAML.parse(yamlWriters.getTemplateInstanceWriter().getAsYamlString(a)),
    },
  },
  elementInstance: {},
};

function fieldLanes(): Partial<Record<'json' | 'yaml', Lane>> {
  return {
    json: {
      read: (d) => outcome(jsonReaders.getTemplateFieldReader().readFromObject(d), 'field'),
      write: (a: any) => jsonWriters.getFieldWriterForField(a).getAsJsonNode(a),
    },
    yaml: {
      read: (d) => outcome(yamlReaders.getTemplateFieldReader().readFromString(YAML.stringify(d)), 'field'),
      write: (a: any) => YAML.parse(yamlWriters.getFieldWriterForField(a).getAsYamlString(a)),
    },
  };
}

function outcome(result: any, property: string): { artifact: unknown; successful: boolean } {
  return { artifact: result[property], successful: result.parsingResult.wasSuccessful() };
}

/** Whether a reader takes the document, and whether what it writes back is the same document. */
function verdict(lane: Lane, document: JsonNode): Verdict {
  let written: JsonNode;
  try {
    const read = lane.read(structuredClone(document));
    if (!read.successful) return 'refused';
    written = lane.write(read.artifact);
  } catch (error) {
    return error instanceof TypeError || error instanceof RangeError ? 'crashed' : 'refused';
  }
  // Key order carries nothing, as in Java's comparison.
  return isDeepStrictEqual(written, document) ? 'accepted' : 'rewritten';
}

/**
 * Where this library still differs from Java's reader, by what the difference is about. The spec
 * fails on a difference no entry matches and on an entry that matches nothing.
 */
const KNOWN: { name: string; matches: (position: Position, row: Case, lane: string, ours: Verdict) => boolean }[] = [
  {
    // Java's readers treat an empty IRI four ways by position, and the validator differs again. This
    // library reads an empty `pav:derivedFrom` or `schema:isBasedOn` as absence, so stored production
    // artifacts open. Settling it is part of the open decision on relative references.
    name: 'empty IRIs',
    matches: (position, row) => position.rule === 'iris' && row.input === '',
  },
  {
    // Java reads 01.2.3 as 1.2.3 and this library keeps what was written. Which is right is the open
    // decision on leading zeros.
    name: 'leading zeros',
    matches: (position, row) => position.rule === 'versions' && ['01.2.3', '1.02.3'].includes(row.input),
  },
];

it('pins Java fixture provenance', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(fixture.positions.flatMap((position) => position.cases)).toHaveLength(lock.caseCount);
});

it('reads every base as Java does', () => {
  for (const [name, base] of Object.entries(fixture.bases)) {
    for (const [form, lane] of Object.entries(lanes[name])) {
      expect([name, form, verdict(lane!, (base as any)[form])]).toEqual([name, form, 'accepted']);
    }
  }
});

it("gives every case the verdict Java's reader of the same form gives", () => {
  const differences: string[] = [];
  const matched = new Set<string>();
  for (const position of fixture.positions) {
    const base = fixture.bases[position.base];
    for (const row of position.cases) {
      const value = row.value ?? row.input;
      for (const [form, lane] of Object.entries(lanes[position.base])) {
        const java = row.java[form];
        if (java === undefined) continue;
        const ours = verdict(lane!, replace((base as any)[form], position.slot, value) as JsonNode);
        if (ours === java) continue;
        const known = KNOWN.find((entry) => entry.matches(position, row, form, ours));
        if (known) matched.add(known.name);
        else differences.push(`${position.name} / ${JSON.stringify(row.input)} / ${form}: ${ours} where Java ${java}`);
      }
    }
  }
  expect(differences).toEqual([]);
  expect(KNOWN.map((entry) => entry.name).filter((name) => !matched.has(name))).toEqual([]);
});
