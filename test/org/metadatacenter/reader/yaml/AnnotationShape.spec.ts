import { CedarJsonReaders, CedarYamlReaders, CedarWriters } from '../../../../../src';

describe('annotation entries must be value objects, matching Java', () => {
  const jsonReader = CedarJsonReaders.getStrict().getTemplateInstanceReader();
  const yamlReader = CedarYamlReaders.getStrict().getTemplateInstanceReader();
  test.each(['https://example.org/misplaced', 42, true, null, [], {}, { other: 'value' }])(
    'rejects malformed JSON and YAML entry %j',
    (entry) => {
      const source = { 'schema:name': 'Example', 'schema:isBasedOn': 'urn:template', _annotations: { '@id': entry } };
      expect(() => jsonReader.readFromString(JSON.stringify(source))).toThrow(/annotation/i);
      // JSON is also valid YAML and avoids introducing serialization-dependent scalar coercion.
      expect(() =>
        yamlReader.readFromString(
          JSON.stringify({ type: 'instance', name: 'Example', isBasedOn: 'urn:template', annotations: { '@id': entry } }),
        ),
      ).toThrow(/annotation/i);
    },
  );
  test('preserves a proper DOI annotation', () => {
    const source = {
      'schema:name': 'Example',
      'schema:isBasedOn': 'urn:template',
      _annotations: { 'https://datacite.com/doi': { '@id': 'https://doi.org/10.1234/example' } },
    };
    const instance = jsonReader.readFromString(JSON.stringify(source)).instance;
    const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getAsYamlString(instance);
    const restored = yamlReader.readFromString(yaml).instance;
    expect((CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(restored) as any)._annotations).toEqual(
      source._annotations,
    );
  });
});
