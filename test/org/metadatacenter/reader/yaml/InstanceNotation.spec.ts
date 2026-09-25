import {
  CedarJsonReaders,
  CedarYamlReaders,
  CedarWriters,
  JsonTemplateInstanceReader,
  JsonTemplateInstanceWriter,
  InstanceDataNotationAtom,
} from '../../../../../src';

describe('SKOS notation survives instance conversion', () => {
  const json = CedarWriters.json().getStrict().getTemplateInstanceWriter();
  const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
  const fields = [
    { '@id': 'https://example.org/term', 'rdfs:label': 'Country', 'skos:notation': 'US' },
    { '@id': 'https://example.org/term', '@type': '@id', 'skos:notation': '' },
    { '@value': 'literal', 'rdfs:label': 'Label', 'skos:notation': 'code' },
    { '@value': null, '@type': 'xsd:string', 'skos:notation': 'code' },
    { '@value': null, 'skos:notation': '' },
    { 'rdfs:label': '', 'skos:notation': 'code' },
    { 'skos:notation': 'code' },
    { '@type': '@id', 'skos:notation': '' },
  ];
  test.each(fields)('preserves %j through JSON and both YAML forms', (field) => {
    const atom = JsonTemplateInstanceReader.readValueNode(field as any);
    expect(JsonTemplateInstanceWriter.writeValueNode(atom)).toEqual(field);
    const source = { 'schema:name': 'Example', 'schema:isBasedOn': 'https://example.org/template', field };
    const instance = CedarJsonReaders.getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source)).instance;
    for (const compact of [false, true]) {
      const rendered = yaml.getAsYamlString(instance, compact);
      const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
      const restored = readers.getTemplateInstanceReader().readFromString(rendered).instance;
      expect((json.getAsJsonNode(restored) as any).field).toEqual(field);
      expect(Object.keys((json.getAsJsonNode(restored) as any).field)).toEqual(Object.keys(field));
      expect(yaml.getAsYamlString(restored, compact)).toBe(rendered);
    }
  });
  test('supports notation-only construction', () => {
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataNotationAtom('code'))).toEqual({ 'skos:notation': 'code' });
  });
});
