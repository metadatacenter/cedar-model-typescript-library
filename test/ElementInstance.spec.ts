import { CedarReaders, CedarWriters, JsonElementInstanceReader, YamlElementInstanceReader, CedarArtifactType } from '../src';

// A standalone element instance, read and written as the Java library's ElementInstanceArtifact is. The
// verdicts on the YAML documents below are the Java YamlArtifactReader's.
const source = {
  '@context': {
    Title: 'https://example.org/properties/title',
    Colour: 'https://example.org/properties/colour',
  },
  '@id': 'https://repo.metadatacenter.org/template-element-instances/e1',
  '@type': 'https://example.org/classes/Study',
  'schema:name': 'Study details',
  Title: { '@value': 'A study' },
  Address: {
    '@context': { City: 'https://example.org/properties/city' },
    '@id': 'https://repo.metadatacenter.org/template-element-instances/e2',
    City: { '@value': 'Stanford' },
  },
  Attributes: ['Colour'],
  Colour: { '@value': 'blue' },
  'pav:createdOn': '2026-11-17T09:30:00-08:00',
};

const jsonWriter = CedarWriters.json().getStrict().getElementInstanceWriter();
const yamlWriter = CedarWriters.yaml().getStrict().getElementInstanceWriter();

test('reads and writes JSON as it was stated, with no key it does not hold', () => {
  const instance = JsonElementInstanceReader.getStrict().readFromObject(structuredClone(source)).instance;
  expect(instance.cedarArtifactType).toBe(CedarArtifactType.ELEMENT_INSTANCE);
  expect(instance.at_id.getValue()).toBe(source['@id']);
  expect(instance.schema_name).toBe('Study details');
  const written = jsonWriter.getAsJsonNode(instance);
  expect(written).toEqual(source);
  expect(Object.keys(written)).not.toEqual(expect.arrayContaining(['schema:description', 'pav:createdBy', 'schema:isBasedOn']));
  expect(Object.keys(written).slice(0, 3)).toEqual(['@id', '@type', 'schema:name']);
});

test('keeps a stated empty description and writes an absent identifier as null', () => {
  const instance = CedarReaders.json()
    .getStrict()
    .getElementInstanceReader()
    .readFromString(JSON.stringify({ '@context': {}, 'schema:description': '', Title: { '@value': 'x' } })).instance;
  expect(jsonWriter.getAsJsonNode(instance)).toEqual({ '@id': null, 'schema:description': '', Title: { '@value': 'x' }, '@context': {} });
});

test('refuses an empty identifier in either behavior, as the root of a template instance is refused one', () => {
  const blank = { '@context': {}, '@id': '', Title: { '@value': 'x' } };
  expect(() => JsonElementInstanceReader.getStrict().readFromObject(structuredClone(blank))).toThrow('An empty string is not a URI');
  expect(() => JsonElementInstanceReader.getFebruary2024().readFromObject(structuredClone(blank))).toThrow('An empty string is not a URI');
  expect(() => JsonElementInstanceReader.getStrict().readFromObject([] as never)).toThrow('An element instance must be a JSON object.');
});

test('writes YAML that reads back to the same instance, and leaves provenance out of the compact form', () => {
  const instance = JsonElementInstanceReader.getStrict().readFromObject(structuredClone(source)).instance;
  const full = yamlWriter.getAsYamlString(instance);
  expect(full.split('\n').slice(0, 5)).toEqual([
    'type: element-instance',
    'name: "Study details"',
    `id: "${source['@id']}"`,
    `instanceType: "${source['@type']}"`,
    'createdOn: "2026-11-17T09:30:00-08:00"',
  ]);
  const reread = CedarReaders.yaml().getStrict().getElementInstanceReader().readFromString(full).instance;
  expect(yamlWriter.getAsYamlString(reread)).toBe(full);
  const compact = yamlWriter.getAsYamlString(instance, true);
  expect(compact).not.toContain('createdOn');
  expect(compact).toContain(`id: "${source['@id']}"`);
});

test.each([
  ['an empty name', 'type: element-instance\nname: ""\nchildren:\n  Title:\n    value: "x"\n', null],
  ['no name', 'type: element-instance\nchildren:\n  Title:\n    value: "x"\n', null],
  ['only an attribute-value field', 'type: element-instance\nGroup:\n  Colour:\n    value: "blue"\n', null],
  ['an attribute-value field named annotations', 'type: element-instance\nannotations:\n  x:\n    value: "y"\n', null],
  ['no type', 'children:\n  Title:\n    value: "x"\n', 'No type present'],
  ['a template instance', 'type: instance\nname: "a"\nchildren:\n  Title:\n    value: "x"\n', 'Invalid artifact type'],
  ['the template it is based on', 'type: element-instance\nisBasedOn: "https://example.org/t"\n', 'Unknown key "isBasedOn"'],
  ['what it is derived from', 'type: element-instance\nderivedFrom: "https://example.org/x"\n', 'Unknown key "derivedFrom"'],
  ['an attribute-value field named name', 'type: element-instance\nname:\n  Colour:\n    value: "blue"\n', 'Expected a string at /name'],
])('reads YAML stating %s as the Java reader does', (_what, yaml, refusal) => {
  const read = () => YamlElementInstanceReader.getStrict().readFromString(yaml);
  if (refusal === null) expect(read().instance.dataContainer).toBeDefined();
  else expect(read).toThrow(refusal);
});

test('refuses to write an attribute-value field named for a key of the standalone envelope', () => {
  const instance = YamlElementInstanceReader.getStrict().readFromString(
    'type: element-instance\nGroup:\n  Colour:\n    value: "blue"\n',
  ).instance;
  const group = instance.dataContainer.values['Group'];
  instance.dataContainer.removeValue('Group');
  instance.dataContainer.setValue('createdOn', group);
  expect(() => yamlWriter.getAsYamlString(instance)).toThrow('reserved');
});
