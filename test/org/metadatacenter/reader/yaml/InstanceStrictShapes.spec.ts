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
  // The YAML reader refuses a null value with no label before it looks at the id, as Java's does.
  test.each([null, 'same', 'different'])('rejects id/value coexistence even with value=%s', (value) => {
    expect(() => json({ '@id': 'https://example.org/term', '@value': value })).toThrow('both');
    expect(() => yaml(`    id: https://example.org/term\n    value: ${JSON.stringify(value)}\n`)).toThrow(
      value === null ? 'null is not a valid value' : 'both',
    );
  });
  test.each(['https://example.org/x\u0085', 'https://example.org/x#a#b', '://bit.ly/x', '1bad:value'])(
    'rejects Java-invalid URI %j in both readers',
    (id) => {
      expect(() => json({ '@id': id })).toThrow('Invalid URI');
      expect(() => yaml(`    id: ${JSON.stringify(id)}\n`)).toThrow('Invalid URI');
    },
  );
  test.each([
    'https://example.org/Niger\u00a0NER',
    'https://example.org/café',
    'https://example.org/Niger%C2%A0NER',
    'https://example.org/x#a%23b',
    'urn:example:value',
    '../relative',
  ])('keeps valid reference %s', (id) => {
    const instance = json({ '@id': id }).instance;
    expect((CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instance) as any).field['@id']).toBe(id);
  });
  const first = 'http://purl.bioontology.org/ontology/LNC/LA17713-1';
  const second = 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C3671';
  test.each([
    ['a literal', { '@value': 'Mark D Wilkinson' }],
    ['a controlled term', { '@id': 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C100069', 'rdfs:label': 'Cardiac Valve Injury' }],
  ])('rejects two types on %s in both readers', (_kind, field) => {
    expect(() => json({ ...field, '@type': [first, second] })).toThrow('at most one @type');
    const yamlField = Object.entries({ ...field })
      .map(([key, value]) => `    ${key === '@value' ? 'value' : key === '@id' ? 'id' : 'label'}: ${JSON.stringify(value)}\n`)
      .join('');
    expect(() => yaml(`    datatype:\n      - "${first}"\n      - "${second}"\n${yamlField}`)).toThrow('at most one datatype');
  });
  test.each([
    ['a string', 'http://www.w3.org/2001/XMLSchema#string'],
    ['a one-element list', ['http://www.w3.org/2001/XMLSchema#string']],
  ])('reads one type written as %s and writes it back as a string', (_form, type) => {
    const instance = json({ '@value': 'text', '@type': type }).instance;
    const written = CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instance) as any;
    // The writer spells an XSD datatype prefixed, as Java's does.
    expect(written.field['@type']).toBe('xsd:string');
  });
  // Java's reader takes a repeated child to be all elements or all fields, as its first entry is.
  // Read entry by entry, a mixed list came out as something neither a template nor Java would make.
  test.each([
    ['an element then a field', '    - children:\n        inner: {value: "x"}\n    - value: "y"\n'],
    ['a field then an element', '    - value: "y"\n    - children:\n        inner: {value: "x"}\n'],
    ['an element stub then a field', '    - type: element-instance\n    - value: "y"\n'],
    ['a field then an element stub', '    - value: "y"\n    - type: element-instance\n'],
  ])('rejects a repeated child that lists %s', (_order, entries) => {
    expect(() => yaml(entries)).toThrow(/repeated child at \/children\/field\[1\] mixes element and field entries/);
  });
  test('rejects a mixed list inside a nested element as well', () => {
    expect(() => yaml('    children:\n      list:\n        - children: {inner: {value: "x"}}\n        - value: "y"\n')).toThrow(
      /repeated child at \/children\/field\/children\/list\[1\] mixes element and field entries/,
    );
  });
  test.each([
    ['fields', '    - value: "y"\n    - value: "z"\n', 2],
    ['elements', '    - children:\n        inner: {value: "x"}\n    - type: element-instance\n', 2],
  ])('still reads a repeated child that lists only %s', (_kind, entries, count) => {
    expect(yaml(entries).instance.dataContainer.values.field).toHaveLength(count);
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
