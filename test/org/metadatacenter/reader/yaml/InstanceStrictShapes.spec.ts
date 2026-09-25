import { CedarJsonReaders, CedarYamlReaders, CedarWriters } from '../../../../../src';
import { SimpleYamlSerializer } from '../../../../../src/org/metadatacenter/io/writer/yaml/SimpleYamlSerializer';

describe('Strict instance values and canonical long keys', () => {
  const json = (field: object) =>
    CedarJsonReaders.getStrict()
      .getTemplateInstanceReader()
      .readFromString(
        JSON.stringify({
          'schema:name': 'Example',
          'schema:isBasedOn': 'https://example.org/t',
          field,
        }),
      );
  const yaml = (field: string) =>
    CedarYamlReaders.getStrict()
      .getTemplateInstanceReader()
      .readFromString('type: instance\nname: Example\nisBasedOn: https://example.org/t\nchildren:\n  field:\n' + field);
  test.each([null, 'same', 'different'])('rejects id/value coexistence even with value=%s', (value) => {
    expect(() => json({ '@id': 'https://example.org/term', '@value': value })).toThrow('both');
    expect(() => yaml(`    id: https://example.org/term\n    value: ${JSON.stringify(value)}\n`)).toThrow('both');
  });
  test.each([
    'https://example.org/Niger\u00a0NER',
    'https://example.org/x\u0085',
    'https://example.org/x#a#b',
    '://bit.ly/x',
    '1bad:value',
  ])('rejects Java-invalid URI %j in both readers', (id) => {
    expect(() => json({ '@id': id })).toThrow('Invalid URI');
    expect(() => yaml(`    id: ${JSON.stringify(id)}\n`)).toThrow('Invalid URI');
  });
  test.each([
    'https://example.org/café',
    'https://example.org/Niger%C2%A0NER',
    'https://example.org/x#a%23b',
    'urn:example:value',
    '../relative',
  ])('keeps valid reference %s', (id) => {
    const instance = json({ '@id': id }).instance;
    expect((CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instance) as any).field['@id']).toBe(id);
  });
  test.each(['a', 'é', '😀'])('matches the Java long-key boundary for %s', (character) => {
    for (const count of [63, 64, 127, 128, 129]) {
      const key = character.repeat(count);
      const text = SimpleYamlSerializer.serialize({ [key]: { value: 'kept' } });
      expect(text.startsWith('? ')).toBe(key.length >= 128);
      expect(text).toContain('value: "kept"');
    }
  });
});
