import {
  CedarReaders,
  CedarWriters,
  InstanceDataAtomType,
  InstanceDataAttributeValueField,
  InstanceDataContainer,
  InstanceDataStringAtom,
  InstanceDataTypedAtom,
} from '../../../../../src';

/**
 * The YAML instance reader reads back what the YAML instance writer wrote.
 *
 * An instance is taken in as JSON (so it arrives with a real `@context`), turned
 * into YAML, read back through the new reader, and written to YAML again. The two
 * YAML documents must be identical: everything the YAML serialization carries —
 * literals, typed values, controlled terms, links, a nested element, an
 * attribute-value field — has to survive the reader. `@context` is not among
 * them; it is template data the YAML never held and the writer never emits, so
 * its absence cannot make the round trip differ.
 */
const CONTEXT = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  pav: 'http://purl.org/pav/',
  schema: 'http://schema.org/',
  oslc: 'http://open-services.net/ns/core#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  'rdfs:label': { '@type': 'xsd:string' },
  'schema:isBasedOn': { '@type': '@id' },
  'schema:name': { '@type': 'xsd:string' },
  'schema:description': { '@type': 'xsd:string' },
  _note: 'https://schema.metadatacenter.org/properties/note',
  _count: 'https://schema.metadatacenter.org/properties/count',
  _org: 'https://schema.metadatacenter.org/properties/org',
  _link: 'https://schema.metadatacenter.org/properties/link',
  _addr: 'https://schema.metadatacenter.org/properties/addr',
};

const jsonInstance = {
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  'schema:name': 'My Instance',
  'schema:description': '',
  _note: { '@value': 'hello' },
  _count: { '@value': '42', '@type': 'xsd:decimal' },
  _org: { '@id': 'https://example.org/terms/hs', 'rdfs:label': 'Homo sapiens' },
  _link: { '@id': 'https://example.org/thing' },
  _addr: {
    '@id': 'https://repo.metadatacenter.org/template-element-instances/e1',
    _city: { '@value': 'Palo Alto' },
    '@context': { _city: 'https://schema.metadatacenter.org/properties/city' },
  },
  '@context': CONTEXT,
};

describe('YamlTemplateInstanceReader', () => {
  const jsonReader = CedarReaders.json().getStrict().getTemplateInstanceReader();
  const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
  const yamlReader = CedarReaders.yaml().getStrict().getTemplateInstanceReader();

  const modelFromJson = jsonReader.readFromObject(jsonInstance, undefined as never).instance;
  const yamlOnce = yamlWriter.getAsYamlString(modelFromJson);
  const modelFromYaml = yamlReader.readFromString(yamlOnce).instance;
  const yamlTwice = yamlWriter.getAsYamlString(modelFromYaml);

  test('a YAML instance round-trips write → read → write unchanged', () => {
    expect(yamlTwice).toBe(yamlOnce);
  });

  test('the envelope survives', () => {
    expect(modelFromYaml.schema_name).toBe('My Instance');
    expect(modelFromYaml.schema_isBasedOn.getValue()).toBe('https://repo.metadatacenter.org/templates/t1');
    expect(modelFromYaml.at_id.getValue()).toBe('https://repo.metadatacenter.org/template-instances/i1');
  });

  test('every value kind is present after reading YAML', () => {
    const yaml = yamlWriter.getAsYamlString(modelFromYaml);
    expect(yaml).toContain('value: "hello"'); // literal
    expect(yaml).toContain('datatype: xsd:decimal'); // typed
    expect(yaml).toContain('label: "Homo sapiens"'); // controlled term
    expect(yaml).toContain('https://example.org/thing'); // link
    expect(yaml).toContain('value: "Palo Alto"'); // value nested in an element
  });
});

describe('YamlTemplateInstanceReader on an unquoted value', () => {
  const yamlReader = CedarReaders.yaml().getStrict().getTemplateInstanceReader();

  const literal = (atom: InstanceDataAtomType | undefined): string | null => {
    if (atom instanceof InstanceDataStringAtom || atom instanceof InstanceDataTypedAtom) return atom.value;
    throw new Error(`expected a literal, got ${String(atom)}`);
  };
  const first = (atom: InstanceDataAtomType | undefined): InstanceDataAtomType | undefined => {
    if (Array.isArray(atom)) return atom[0];
    throw new Error(`expected a list, got ${String(atom)}`);
  };
  const attribute = (atom: InstanceDataAtomType | undefined, name: string): InstanceDataAtomType | undefined => {
    if (atom instanceof InstanceDataAttributeValueField) return atom.values[name];
    throw new Error(`expected an attribute-value field, got ${String(atom)}`);
  };

  // A YAML 1.2 core resolver reads these plain scalars as numbers or booleans. A field holds a
  // literal, so the value read must be the text written: a ZIP code of 007 is not 7. Java's reader
  // keeps the same text.
  test.each(['007', '0x1F', '0o17', '1e3', '+1', '.5', '-0', '1.50', '9007199254740993', 'True', 'TRUE', 'false'])(
    '%s keeps the text it was written with',
    (spelling) => {
      const yaml =
        'type: instance\nname: X\nisBasedOn: "https://repo.metadatacenter.org/templates/abc"\n' +
        `children:\n  Count:\n    value: ${spelling}\n  Typed:\n    value: ${spelling}\n    datatype: xsd:int\n` +
        `  Counts:\n    - value: ${spelling}\n  Element:\n    children:\n      Nested:\n        value: ${spelling}\n` +
        `Group:\n  Attribute:\n    value: ${spelling}\n  Bare: ${spelling}\n`;
      const values = yamlReader.readFromString(yaml).instance.dataContainer.values;
      const element = values['Element'];
      if (!(element instanceof InstanceDataContainer)) throw new Error('expected an element');

      expect(literal(values['Count'])).toBe(spelling);
      expect(literal(values['Typed'])).toBe(spelling);
      expect(literal(first(values['Counts']))).toBe(spelling);
      expect(literal(element.values['Nested'])).toBe(spelling);
      expect(literal(attribute(values['Group'], 'Attribute'))).toBe(spelling);
      expect(literal(attribute(values['Group'], 'Bare'))).toBe(spelling);
    },
  );

  test('a value parsed elsewhere is still read as a string', () => {
    const values = yamlReader.readFromObject({
      type: 'instance',
      name: 'X',
      isBasedOn: 'https://repo.metadatacenter.org/templates/abc',
      children: { Count: { value: 7 }, Flag: { value: true } },
    }).instance.dataContainer.values;

    expect(literal(values['Count'])).toBe('7');
    expect(literal(values['Flag'])).toBe('true');
  });
});
