import { CedarJsonReaders, CedarYamlReaders, CedarWriters } from '../../../../../src';

describe('instance identifiers reject unescaped spaces and controls like Java', () => {
  const json = CedarJsonReaders.getStrict().getTemplateInstanceReader();
  const yaml = CedarYamlReaders.getStrict().getTemplateInstanceReader();
  test.each([' ', '\t', '\n', '\r', '\u0000', '\u001f', '\u007f'])('rejects raw character %j in JSON and YAML IRIs', (character) => {
    const id = `https://example.org/?usqp=mq331${character}AQFKAGWASA%3D`;
    for (const labelled of [false, true]) {
      expect(() =>
        json.readFromString(
          JSON.stringify({
            'schema:name': 'Example',
            'schema:isBasedOn': 'urn:template',
            field: { '@id': id, ...(labelled ? { 'rdfs:label': 'Link' } : {}) },
          }),
        ),
      ).toThrow(/Invalid URI/);
      expect(() =>
        yaml.readFromString(
          JSON.stringify({
            type: 'instance',
            name: 'Example',
            isBasedOn: 'urn:template',
            children: { field: { id, ...(labelled ? { label: 'Link' } : {}) } },
          }),
        ),
      ).toThrow(/Invalid URI/);
    }
  });
  test.each(['https://example.org/a%20b', 'urn:example:term', 'https://example.org/café', '../relative'])(
    'retains accepted URI spelling %s',
    (id) => {
      const instance = json.readFromString(
        JSON.stringify({ 'schema:name': 'Example', 'schema:isBasedOn': 'urn:template', field: { '@id': id } }),
      ).instance;
      const rendered = CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getAsYamlString(instance);
      const restored = yaml.readFromString(rendered).instance;
      expect((CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(restored) as any).field).toEqual({ '@id': id });
    },
  );
});
