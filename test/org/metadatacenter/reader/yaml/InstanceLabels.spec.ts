import { CedarJsonReaders, CedarYamlReaders, CedarWriters } from '../../../../../src';

describe('instance label preservation', () => {
  const json = CedarWriters.json().getStrict().getTemplateInstanceWriter();
  const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
  const fields = [
    { '@value': 'literal', 'rdfs:label': 'Personal' },
    { '@value': 'literal', 'rdfs:label': '', '@type': 'xsd:string' },
    { '@value': null, 'rdfs:label': 'High-quality MAG' },
    { '@value': null, 'rdfs:label': '', '@type': 'xsd:string' },
    { 'rdfs:label': 'Category' },
    { 'rdfs:label': '' },
    { 'rdfs:label': 'Category', '@type': '@id' },
  ];
  test.each(fields)('preserves %j in JSON and both YAML forms', (field) => {
    const source = { 'schema:name': 'Example', 'schema:isBasedOn': 'https://example.org/template', field };
    const instance = CedarJsonReaders.getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source)).instance;
    expect((json.getAsJsonNode(instance) as any).field).toEqual(field);
    for (const compact of [false, true]) {
      const rendered = yaml.getAsYamlString(instance, compact);
      const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
      const restored = readers.getTemplateInstanceReader().readFromString(rendered).instance;
      expect((json.getAsJsonNode(restored) as any).field).toEqual(field);
      expect(Object.keys((json.getAsJsonNode(restored) as any).field)).toEqual(Object.keys(field));
      expect(yaml.getAsYamlString(restored, compact)).toBe(rendered);
    }
  });
});
