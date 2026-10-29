import { SchemaArtifactValidator } from '../src/org/metadatacenter/model/cedar/validation/SchemaArtifactValidator';
import { readConstraintLinks } from '../src';
describe('the common constraint links schema', () => {
  it.each([
    { landingPage: 'https://example.org/page' },
    { icon: 'https://example.org/icon.svg' },
    { landingPage: 'https://example.org/page', icon: 'https://example.org/icon.svg' },
  ])('accepts %j', (links) => {
    expect(readConstraintLinks(links)).toEqual(links);
  });
  it.each([
    null,
    {},
    [],
    { icon: 'bioportal' },
    { landingPage: 'javascript:alert(1)' },
    { landingPage: 'https://user:secret@example.org/' },
    { landingPage: null },
    { landingPage: 'https://example.org', versionScope: 'current' },
    { landingPage: 'https://example.org', provider: {} },
  ])('rejects %j', (links) => {
    expect(() => readConstraintLinks(links)).toThrow();
  });
  it('permits absence', () => expect(readConstraintLinks(undefined)).toBeNull());
});

import { CedarReaders, CedarWriters } from '../src';
import * as YAML from 'yaml';

describe('links survive both core serializations', () => {
  const links = { landingPage: 'https://example.org/page', icon: 'https://example.org/icon.svg' };
  const version = { id: 'snapshot', effectiveDate: '2026-10-28', declaredVersion: 'release-one' };
  const common = { sourceSystem: 'future', sourceAcronym: 'TEST', sourceIri: 'urn:source:test', version, links };
  it.each([
    { type: 'ontology', sourceName: 'Test', sourceUri: 'https://example.org/api', termCount: 3 },
    { type: 'branch', sourceName: 'Test', termBaseIri: 'urn:root', termBaseLabel: 'Root', termMaxDepth: 2 },
    { type: 'class', termIri: 'urn:term', termType: 'class', termLabel: 'Term' },
    { type: 'valueSet', termBaseIri: 'urn:set', termBaseLabel: 'Set', termCount: 3 },
  ])('preserves $type identity, links and pin', (entry) => {
    const source = { type: 'controlled-term-field', name: 'Linked field', datatype: 'iri', values: [{ ...entry, ...common }] };
    const read = CedarReaders.yaml().getStrictForCompact().getTemplateFieldReader().readFromString(YAML.stringify(source));
    expect(read.parsingResult.wasSuccessful()).toBe(true);
    const json = CedarWriters.json().getStrict().getFieldWriterForField(read.field).getAsJsonNode(read.field);
    const again = CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(json);
    expect(again.parsingResult.wasSuccessful()).toBe(true);
    const yaml = YAML.parse(CedarWriters.yaml().getStrict().getFieldWriterForField(again.field).getAsYamlString(again.field));
    expect(yaml.values[0].links).toEqual(links);
    expect(yaml.values[0].version).toEqual(version);
    expect(yaml.values[0].sourceIri).toBe(common.sourceIri);
    expect(SchemaArtifactValidator.structure(json).findings).toEqual([]);
  });
});
