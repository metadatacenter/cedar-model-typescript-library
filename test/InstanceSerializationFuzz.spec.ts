import { CedarReaders, CedarWriters } from '../src';
import { Command, commands, checkHistory, historySeeds } from './support/seeded-history';

import type { JsonNode } from '../src/org/metadatacenter/model/cedar/types/basic-types/JsonNode';
type ObjectValue = JsonNode;
const jsonReader = CedarReaders.json().getStrict().getTemplateInstanceReader();
const yamlReader = CedarReaders.yaml().getStrict().getTemplateInstanceReader();
const jsonWriter = CedarWriters.json().getStrict().getTemplateInstanceWriter();
const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
const strings = ['', 'on', 'null', '007', 'a: b # c', '\nfirst\nsecond\n', 'trailing ', 'é Δ 😀', '"quoted"', 'a\tb', '\u0000'];

function atom(command: Command, offset: number): ObjectValue {
  const value = strings[(command.b + offset) % strings.length];
  switch (command.op) {
    case 1:
      return {};
    case 2:
      return { '@value': null };
    case 3:
      return { '@value': value, '@language': command.c % 2 ? 'fr' : 'en' };
    case 4:
      return { '@value': `${command.b % 1000}.${offset}`, '@type': 'xsd:decimal' };
    case 5:
      return { '@id': `https://example.org/term/${command.b + offset}` };
    case 6:
      return { '@id': `https://example.org/term/${command.b + offset}`, 'rdfs:label': value, 'skos:notation': String(offset) };
    case 7:
      return { '@value': '2026-10-09', '@type': 'xsd:date' };
    case 8:
      return { 'skos:notation': value };
    default:
      return { '@value': value };
  }
}

/** Generate JSON independently of the model builders/readers being checked. */
function sourceFor(history: Command[]): ObjectValue {
  const root: ObjectValue = {
    '@id': 'https://example.org/instance',
    '@context': {},
    'schema:isBasedOn': 'https://example.org/template',
    'schema:name': 'Generated instance',
    'schema:description': 'Preserve author values',
  };
  const containers = [{ node: root, depth: 0 }];
  history.forEach((command, index) => {
    const target = containers[command.a % containers.length];
    const name = `f_${index}_${strings[command.c % (strings.length - 1)]}`;
    const context = target.node['@context'] as ObjectValue;
    context[name] = `https://example.org/property/${index}`;
    // Context terms for omitted fields must also survive.
    context[`absent_${index}`] = `https://example.org/absent/${index}`;
    if (command.op === 0 && target.depth < 4) {
      const count = command.b % 3;
      const children = Array.from({ length: count }, (_, occurrence) => {
        const node: ObjectValue = { '@id': `https://example.org/element/${index}/${occurrence}`, '@context': {} };
        containers.push({ node, depth: target.depth + 1 });
        return node;
      });
      target.node[name] = children;
    } else {
      target.node[name] = command.c % 2 ? atom(command, 0) : Array.from({ length: command.b % 4 }, (_, offset) => atom(command, offset));
    }
  });
  return root;
}

/** Check supplied values directly, before any reader can normalize or discard them. */
function expectPayload(actual: unknown, expected: unknown): void {
  if (Array.isArray(expected)) {
    expect(Array.isArray(actual)).toBe(true);
    expect((actual as unknown[]).length).toBe(expected.length);
    expected.forEach((value, index) => expectPayload((actual as unknown[])[index], value));
  } else if (expected && typeof expected === 'object' && '@context' in expected) {
    const source = expected as ObjectValue;
    const result = actual as ObjectValue;
    expect(result['@id']).toEqual(source['@id']);
    expect(result['@context']).toMatchObject(source['@context'] as ObjectValue);
    const keys = Object.keys(source).filter((key) => key.startsWith('f_'));
    expect(Object.keys(result).filter((key) => key.startsWith('f_'))).toEqual(keys);
    keys.forEach((key) => expectPayload(result[key], source[key]));
  } else expect(actual).toStrictEqual(expected);
}

/** YAML instances deliberately omit schema context and unfilled field slots.
 * They must retain every supplied value and every repeated element occurrence.
 * JSON is checked separately above without those omissions. */
function leanPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    const entries = value.map(leanPayload).filter((entry) => entry !== undefined);
    return entries.length ? entries : undefined;
  }
  if (!value || typeof value !== 'object') return value;
  const node = value as ObjectValue;
  if ('@context' in node) {
    return Object.fromEntries([
      ['@id', node['@id']],
      ...Object.entries(node)
        .filter(([key]) => key.startsWith('f_'))
        .map(([key, child]) => [key, leanPayload(child)])
        .filter(([, child]) => child !== undefined),
    ]);
  }
  if (Object.keys(node).length === 0 || (Object.keys(node).length === 1 && node['@value'] === null)) return undefined;
  return node;
}

function replay(history: Command[]): void {
  const source = sourceFor(history);
  const frozen = JSON.stringify(source);
  const model = jsonReader.readFromObject(source).instance;
  const canonical = jsonWriter.getAsJsonNode(model);
  expectPayload(canonical, source);
  expect(JSON.stringify(source)).toBe(frozen);
  expect(jsonWriter.getAsJsonNode(jsonReader.readFromString(JSON.stringify(canonical)).instance)).toEqual(canonical);
  const yaml = yamlWriter.getAsYamlString(model);
  const restored = yamlReader.readFromString(yaml).instance;
  const restoredJson = jsonWriter.getAsJsonNode(restored);
  expect(leanPayload(restoredJson)).toEqual(leanPayload(source));
  for (const key of ['schema:name', 'schema:description', 'schema:isBasedOn']) expect(restoredJson[key]).toEqual(source[key]);
  expect(yamlWriter.getAsYamlString(restored)).toBe(yaml);
  expect(jsonWriter.getAsJsonNode(model)).toEqual(canonical);
}

describe('seeded nested instance serialization', () => {
  test.each(historySeeds(250))('seed %i', (seed) => checkHistory(seed, commands(seed, 35, 10), replay));
});
