import {
  CedarJsonReaders,
  CedarYamlReaders,
  CedarWriters,
  JsonTemplateInstanceReader,
  JsonTemplateInstanceWriter,
} from '../../../../../src';

describe('Full instance audit regressions', () => {
  const json = CedarWriters.json().getStrict().getTemplateInstanceWriter();
  const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
  const read = (children: object) =>
    CedarJsonReaders.getStrict()
      .getTemplateInstanceReader()
      .readFromString(
        JSON.stringify({
          'schema:name': 'Example',
          'schema:isBasedOn': 'https://example.org/template',
          ...children,
        }),
      ).instance;

  test.each([
    { '@value': 'Title', '@language': 'en' },
    { '@value': 'Titre', 'rdfs:label': 'Label', '@type': 'xsd:string', '@language': 'fr', 'skos:notation': 'code' },
    { '@value': null, 'rdfs:label': 'Label', '@language': 'en' },
  ])('preserves populated literal language and canonical metadata order: %j', (field) => {
    expect(JsonTemplateInstanceWriter.writeValueNode(JsonTemplateInstanceReader.readValueNode(field))).toEqual(field);
    for (const compact of [false, true]) {
      const text = yaml.getAsYamlString(read({ field }), compact);
      const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
      const restored = readers.getTemplateInstanceReader().readFromString(text).instance;
      const result = (json.getAsJsonNode(restored) as any).field;
      expect(result).toEqual(field);
      expect(Object.keys(result)).toEqual(Object.keys(field));
      expect(text).toContain('language: "');
    }
  });

  test.each([false, true])('metadata precedes nested attribute groups (compact=%s)', (compact) => {
    const text = yaml.getAsYamlString(
      read({ element: { '@id': 'https://example.org/element', '@context': {}, group: ['attribute'], attribute: { '@value': 'data' } } }),
      compact,
    );
    expect(text.indexOf('type: element-instance')).toBeLessThan(text.indexOf('    group:'));
    if (!compact) expect(text.indexOf('id: "https://example.org/element"')).toBeLessThan(text.indexOf('    group:'));
    const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
    expect(yaml.getAsYamlString(readers.getTemplateInstanceReader().readFromString(text).instance, compact)).toBe(text);
  });

  test('numeric attribute names follow their membership group, at root and nested levels', () => {
    const group = { group: ['51'], '51': { '@value': 'data' } };
    const instance = read({ ...group, element: { '@id': 'https://example.org/element', '@context': {}, ...group } });
    const text = json.getAsJsonString(instance);
    expect(JSON.parse(text)).toEqual(json.getAsJsonNode(instance));
    for (const part of text.split('"group":').slice(1)) expect(part.indexOf('"51":')).toBeGreaterThan(part.indexOf(']'));
    expect(text.indexOf('"@id":')).toBeLessThan(text.indexOf('"51":'));
  });

  test('numeric ordinary field names follow the instance envelope', () => {
    const text = json.getAsJsonString(read({ '1212': { '@value': 'data' }, text: { '@value': 'next' } }));
    expect(text.indexOf('"schema:name":')).toBeLessThan(text.indexOf('"1212":'));
    expect(text.indexOf('"1212":')).toBeLessThan(text.indexOf('"text":'));
    expect(text.indexOf('"text":')).toBeLessThan(text.indexOf('"@context":'));
  });

  test.each([false, true])('preserves repeated empty element cardinality (reverse=%s)', (reverse) => {
    const entries = [{ '@id': 'https://example.org/occurrence' }, { '@context': {}, field: { '@value': null } }];
    if (reverse) entries.reverse();
    for (const compact of [false, true]) {
      const text = yaml.getAsYamlString(read({ items: entries }), compact);
      const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
      const restored = readers.getTemplateInstanceReader().readFromString(text).instance;
      const result = (json.getAsJsonNode(restored) as any).items;
      expect(result).toHaveLength(2);
      expect(result.every((entry: any) => Object.hasOwn(entry, '@context'))).toBe(true);
      if (!compact) expect(result[reverse ? 1 : 0]['@id']).toBe('https://example.org/occurrence');
    }
  });

  test('rejects mixed literal and element arrays', () => {
    expect(() => read({ items: [{ '@value': 'keep me' }, { '@context': {} }] })).toThrow('Cannot mix');
  });
});
