import { CedarReaders, CedarWriters } from '../src';
import YAML from 'yaml';
const jr = CedarReaders.json().getStrict().getTemplateInstanceReader();
const yr = CedarReaders.yaml().getStrict().getTemplateInstanceReader();
const jw = CedarWriters.json().getStrict().getTemplateInstanceWriter();
const yw = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
const source = (iri: string) => ({
  'schema:name': 'IRI example',
  'schema:isBasedOn': 'https://example.org/template',
  country: { '@id': iri, 'rdfs:label': 'Niger (NER)' },
});
test.each([
  'https://example.org/Niger\u00a0NER',
  'https://example.org/Niger%C2%A0NER',
  'https://example.org/café',
  'https://example.org/\u2003term',
  'https://example.org/😀',
  'https://example.org/?q=\ue000',
  'urn:example:Niger\u00a0NER',
])('preserves exact field IRI: %s', (iri) => {
  const model = jr.readFromString(JSON.stringify(source(iri))).instance;
  expect((jw.getAsJsonNode(model) as any).country['@id']).toBe(iri);
  const yaml = yw.getAsYamlString(model);
  const restored = yr.readFromString(yaml).instance;
  expect((jw.getAsJsonNode(restored) as any).country['@id']).toBe(iri);
  expect(yw.getAsYamlString(restored)).toBe(yaml);
});
test.each([
  '',
  'https://example.org/a b',
  'https://example.org/a\tb',
  'https://example.org/\u0085',
  'https://example.org/%xx',
  'https://example.org/a#b#c',
  '://example.org/a',
  'https://example.org/\ud800',
  'https://example.org/\uffff',
  'https://example.org/\ue000',
  'https://example.org/#\ue000',
])('rejects malformed field IRI: %s', (iri) => {
  expect(() => jr.readFromString(JSON.stringify(source(iri)))).toThrow();
  const model = jr.readFromString(JSON.stringify(source('https://example.org/term'))).instance;
  const document = YAML.parse(yw.getAsYamlString(model));
  document.children.country.id = iri;
  expect(() => yr.readFromObject(document)).toThrow();
});
