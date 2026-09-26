import {
  CedarJsonReaders,
  CedarYamlReaders,
  CedarWriters,
  JsonTemplateInstanceReader,
  JsonTemplateInstanceWriter,
  InstanceDataLinkAtom,
  InstanceDataControlledAtom,
} from '../../../../../src';

describe('linked-value datatypes match Java', () => {
  const id = 'https://example.org/term';
  const jsonWriter = CedarWriters.json().getStrict().getTemplateInstanceWriter();
  const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();

  test.each([false, true])('preserves an explicit datatype, labelled=%s', (labelled) => {
    const field = { '@id': id, ...(labelled ? { 'rdfs:label': 'Term' } : {}), '@type': '@id' };
    const source = {
      '@id': 'https://example.org/instance',
      'schema:isBasedOn': 'https://example.org/template',
      'schema:name': 'Example',
      field,
    };
    const instance = CedarJsonReaders.getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source)).instance;
    const direct = jsonWriter.getAsJsonNode(instance) as any;
    expect(direct.field).toEqual(field);
    expect(Object.keys(direct.field)).toEqual(Object.keys(field));
    const yaml = yamlWriter.getAsYamlString(instance);
    expect(yaml).toContain('    datatype: "@id"\n    id: "https://example.org/term"');
    for (const compact of [false, true]) {
      const rendered = yamlWriter.getAsYamlString(instance, compact);
      const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
      const reread = readers.getTemplateInstanceReader().readFromString(rendered).instance;
      expect((jsonWriter.getAsJsonNode(reread) as any).field).toEqual(field);
      expect(yamlWriter.getAsYamlString(reread, compact)).toBe(rendered);
    }
  });

  test.each([false, true])('does not invent a datatype, labelled=%s', (labelled) => {
    const field = { '@id': id, ...(labelled ? { 'rdfs:label': 'Term' } : {}) };
    expect(JsonTemplateInstanceWriter.writeValueNode(JsonTemplateInstanceReader.readValueNode(field as any))).toEqual(field);
  });

  test('supports explicit datatype construction for links and controlled terms', () => {
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataLinkAtom(id, '@id'))).toEqual({ '@id': id, '@type': '@id' });
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataControlledAtom(id, 'Term', '@id'))).toEqual({
      '@id': id,
      'rdfs:label': 'Term',
      '@type': '@id',
    });
  });
});
