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
        `Group:\n  Attribute:\n    value: ${spelling}\n`;
      const values = yamlReader.readFromString(yaml).instance.dataContainer.values;
      const element = values['Element'];
      if (!(element instanceof InstanceDataContainer)) throw new Error('expected an element');

      expect(literal(values['Count'])).toBe(spelling);
      expect(literal(values['Typed'])).toBe(spelling);
      expect(literal(first(values['Counts']))).toBe(spelling);
      expect(literal(element.values['Nested'])).toBe(spelling);
      expect(literal(attribute(values['Group'], 'Attribute'))).toBe(spelling);
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

/**
 * The Java library's reader refuses these inputs, and so does this one. A document the Java reader
 * would not store must not be read here as though it held data. Each case names the input and the
 * place the refusal points to.
 */
describe('YamlTemplateInstanceReader refuses what the Java reader refuses', () => {
  const yamlReader = CedarReaders.yaml().getStrict().getTemplateInstanceReader();
  const read = (body: string) => () =>
    yamlReader.readFromString('type: instance\nname: X\nisBasedOn: "https://repo.metadatacenter.org/templates/abc"\n' + body);

  // A value that is not known is left out. Null, an empty mapping and an empty list are refused
  // wherever an instance holds data.
  test.each([
    ['a value of null with no label', 'children: {F: {value: null}}', /null is not a valid value at \/children\/F\/value;/],
    ['a value written as ~', 'children: {F: {value: ~}}', /null is not a valid value at \/children\/F\/value;/],
    ['a value left empty', 'children:\n  F:\n    value:\n', /null is not a valid value at \/children\/F\/value;/],
    [
      'a null value beside a datatype alone',
      'children: {F: {value: null, datatype: "xsd:int"}}',
      /null is not a valid value at \/children\/F\/value;/,
    ],
    [
      'a null value beside a language alone',
      'children: {F: {value: null, language: en}}',
      /null is not a valid value at \/children\/F\/value;/,
    ],
    [
      'a null value beside a label that is not a string',
      'children: {F: {value: null, label: 42}}',
      /null is not a valid value at \/children\/F\/value;/,
    ],
    ['a null value in a list entry', 'children: {F: [{value: null}]}', /null is not a valid value at \/children\/F\[0\]\/value;/],
    [
      'a null value in a nested element',
      'children: {E: {children: {F: {value: null}}}}',
      /null is not a valid value at \/children\/E\/children\/F\/value;/,
    ],
    ['a null value in an attribute', 'G: {A: {value: null}}', /null is not a valid value at \/G\/A\/value;/],
    [
      'a null value beside an id',
      'children: {F: {id: "https://example.org/x", value: null}}',
      /null is not a valid value at \/children\/F\/value;/,
    ],
    ['a null id', 'children: {F: {id: null}}', /null is not a valid value at \/children\/F\/id;/],
    ['a null id beside a label', 'children: {F: {id: null, label: L}}', /null is not a valid value at \/children\/F\/id;/],
    ['a null label', 'children: {F: {value: x, label: null}}', /null is not a valid value at \/children\/F\/label;/],
    ['a null label alone', 'children: {F: {label: null}}', /null is not a valid value at \/children\/F\/label;/],
    ['a null notation', 'children: {F: {value: x, notation: null}}', /null is not a valid value at \/children\/F\/notation;/],
    ['a null preferred label', 'children: {F: {value: x, prefLabel: null}}', /null is not a valid value at \/children\/F\/prefLabel;/],
    ['a null language', 'children: {F: {value: x, language: null}}', /null is not a valid value at \/children\/F\/language;/],
    ['a null datatype', 'children: {F: {value: x, datatype: null}}', /null is not a valid value at \/children\/F\/datatype;/],
    [
      'a null under a key the reader does not know',
      'children: {F: {value: x, note: null}}',
      /null is not a valid value at \/children\/F\/note;/,
    ],
    ['a null child', 'children: {F: null}', /null is not a valid value at \/children\/F;/],
    ['an empty mapping as a child', 'children: {F: {}}', /An empty mapping \(\{\}\) is not a valid value at \/children\/F;/],
    ['an empty list as a child', 'children: {F: []}', /An empty list \(\[\]\) is not a valid value at \/children\/F;/],
    ['a null list entry', 'children: {F: [{value: a}, null]}', /null is not a valid value at \/children\/F\[1\];/],
    [
      'an empty mapping as a list entry',
      'children: {F: [{value: a}, {}]}',
      /An empty mapping \(\{\}\) is not a valid value at \/children\/F\[1\];/,
    ],
    [
      'an empty mapping as a value',
      'children: {F: {value: {}}}',
      /An empty mapping \(\{\}\) is not a valid value at \/children\/F\/value;/,
    ],
    ['an empty list as a value', 'children: {F: {value: []}}', /An empty list \(\[\]\) is not a valid value at \/children\/F\/value;/],
    ['a null children block', 'children: null', /null is not a valid value at \/children;/],
    ['an empty children block', 'children: {}', /An empty mapping \(\{\}\) is not a valid value at \/children;/],
    [
      'an empty children block in an element',
      'children: {E: {type: element-instance, children: {}}}',
      /An empty mapping \(\{\}\) is not a valid value at \/children\/E\/children;/,
    ],
    ['a null element id', 'children: {E: {id: null, children: {F: {value: x}}}}', /null is not a valid value at \/children\/E\/id;/],
    ['a null attribute-value field', 'G: null', /null is not a valid value at \/G;/],
    ['an empty attribute-value field', 'G: {}', /An empty mapping \(\{\}\) is not a valid value at \/G;/],
    ['an empty list where an attribute-value field may be', 'G: []', /An empty list \(\[\]\) is not a valid value at \/G;/],
    ['a null attribute', 'G: {A: null}', /null is not a valid value at \/G\/A;/],
    ['an empty attribute', 'G: {A: {}}', /An empty mapping \(\{\}\) is not a valid value at \/G\/A;/],
    [
      'a null attribute-value field in an element',
      'children: {E: {children: {F: {value: x}}, G: null}}',
      /null is not a valid value at \/children\/E\/G;/,
    ],
  ])('%s', (_name, body, refusal) => {
    expect(read(body)).toThrow(refusal);
  });

  // A field holds a literal: a string, or a number or boolean read as the text it was written as.
  test.each([
    ['a mapping', 'children: {F: {value: {a: 1}}}', /Expected a string, number or boolean at \/children\/F\/value\./],
    ['a sequence', 'children: {F: {value: [a, b]}}', /Expected a string, number or boolean at \/children\/F\/value\./],
    [
      'a mapping beside a label',
      'children: {F: {value: {a: 1}, label: L}}',
      /Expected a string, number or boolean at \/children\/F\/value\./,
    ],
    ['a sequence in a list entry', 'children: {F: [{value: [a]}]}', /Expected a string, number or boolean at \/children\/F\[0\]\/value\./],
    [
      'a mapping in a nested element',
      'children: {E: {children: {F: {value: {a: 1}}}}}',
      /Expected a string, number or boolean at \/children\/E\/children\/F\/value\./,
    ],
    ['a mapping in an attribute', 'G: {A: {value: {a: 1}}}', /Expected a string, number or boolean at \/G\/A\/value\./],
    ['a sequence in an attribute', 'G: {A: {value: [a]}}', /Expected a string, number or boolean at \/G\/A\/value\./],
  ])('a value that is %s', (_name, body, refusal) => {
    expect(read(body)).toThrow(refusal);
  });

  // What describes a value is text, as Java's reader requires.
  test.each(['label', 'notation', 'prefLabel', 'language', 'datatype'])('a %s that is not a string', (key) => {
    expect(read(`children: {F: {value: x, ${key}: 42}}`)).toThrow(new RegExp(`Expected a string at /children/F/${key}\\.`));
    expect(read(`children: {F: {value: x, ${key}: {a: 1}}}`)).toThrow(new RegExp(`Expected a string at /children/F/${key}\\.`));
    expect(read(`G: {A: {value: x, ${key}: 42}}`)).toThrow(new RegExp(`Expected a string at /G/A/${key}\\.`));
  });

  test.each([
    ['a label alone', 'children: {F: {label: 42}}', /Expected a string at \/children\/F\/label\./],
    ['a label beside an id', 'children: {F: {id: "https://example.org/x", label: 42}}', /Expected a string at \/children\/F\/label\./],
    [
      'a datatype beside an id',
      'children: {F: {id: "https://example.org/x", datatype: 42}}',
      /Expected a string at \/children\/F\/datatype\./,
    ],
    ['a datatype that is not an IRI', 'children: {F: {value: x, datatype: "a b"}}', /Invalid URI\/IRI at "datatype"/],
  ])('%s that Java refuses', (_name, body, refusal) => {
    expect(read(body)).toThrow(refusal);
  });

  // A child is a mapping, or a list of mappings for a repeated child. An attribute is a mapping.
  test.each([
    ['a child written as a bare string', 'children: {F: text}', /Expected a mapping or a list for the child instance at \/children\/F\./],
    ['a child written as a bare number', 'children: {F: 42}', /Expected a mapping or a list for the child instance at \/children\/F\./],
    ['a child written as a bare boolean', 'children: {F: true}', /Expected a mapping or a list for the child instance at \/children\/F\./],
    [
      'a nested child written as a bare string',
      'children: {E: {children: {F: text}}}',
      /Expected a mapping or a list for the child instance at \/children\/E\/children\/F\./,
    ],
    [
      'a list of bare strings',
      'children: {F: [a, b]}',
      /Expected a mapping for the entry of a multi-instance list at \/children\/F\[0\]\./,
    ],
    [
      'a bare string after a mapping in a list',
      'children: {F: [{value: a}, b]}',
      /Expected a mapping for the entry of a multi-instance list at \/children\/F\[1\]\./,
    ],
    [
      'a list nested in a list',
      'children: {F: [[{value: a}]]}',
      /Expected a mapping for the entry of a multi-instance list at \/children\/F\[0\]\./,
    ],
    ['a children block that is a string', 'children: x', /Expected a mapping of child instances at \/children\./],
    ['a children block that is a list', 'children: [a]', /Expected a mapping of child instances at \/children\./],
    [
      'an element whose children block is a string',
      'children: {E: {children: x}}',
      /Expected a mapping of child instances at \/children\/E\/children\./,
    ],
    ['an attribute written as a bare string', 'G: {A: x}', /Expected a mapping for the attribute-value field at \/G\/A\./],
    ['an attribute written as a bare number', 'G: {A: 7}', /Expected a mapping for the attribute-value field at \/G\/A\./],
    ['an attribute written as a list', 'G: {A: [x]}', /Expected a mapping for the attribute-value field at \/G\/A\./],
    [
      'an attribute in an element written as a bare string',
      'children: {E: {children: {F: {value: x}}, G: {A: x}}}',
      /Expected a mapping for the attribute-value field at \/children\/E\/G\/A\./,
    ],
    [
      'an attribute with both an id and a value',
      'G: {A: {id: "https://example.org/x", value: x}}',
      /A field cannot contain both id and value\./,
    ],
    ['an attribute with an id that is not an IRI', 'G: {A: {id: "a b"}}', /Invalid URI\/IRI at "id"/],
    ['an attribute with two datatypes', 'G: {A: {value: x, datatype: [a, b]}}', /at most one datatype/],
    [
      'a child written as a number too large for JavaScript',
      'children: {F: 9007199254740993}',
      /Expected a mapping or a list for the child instance at \/children\/F\./,
    ],
  ])('%s', (_name, body, refusal) => {
    expect(read(body)).toThrow(refusal);
  });

  // A number beside `children` is not an attribute-value field. One too large for a JavaScript
  // number arrives as an exact decimal, an object, which was read as a field whose attributes were
  // that object's own properties.
  test.each(['7', '1.50', '9007199254740993'])(
    'a number %s where an attribute-value field may be is refused, as Java refuses it',
    (number) => {
      // Only a mapping there can be an attribute-value field, so a number is no key of the form.
      expect(read(`children: {E: {children: {F: {value: x}}, G: ${number}}}\n`)).toThrow('Unknown key "G" at /children/E/G');
      expect(read(`children: {F: {value: x}}\nG: ${number}\n`)).toThrow('Unknown key "G" at /G');
    },
  );

  test('a field holding a key the reader does not know is refused for it, as it is in Java', () => {
    expect(read('children: {F: {note: x}}')).toThrow('Unknown key "note" at /children/F/note');
  });

  // A null value beside a label, a preferred label or a notation is the shape of a term chosen
  // without a literal, and reads as no value, as it does in Java.
  test.each([
    ['label', 'L', (atom: InstanceDataStringAtom) => atom.label],
    ['prefLabel', 'P', (atom: InstanceDataStringAtom) => atom.preferredLabel],
    ['notation', 'N', (atom: InstanceDataStringAtom) => atom.notation],
    ['label', '', (atom: InstanceDataStringAtom) => atom.label],
  ])('a null value beside a %s %j reads as no value', (key, text, described) => {
    const values = read(
      `children: {F: {value: null, ${key}: ${JSON.stringify(text)}}}\nG: {A: {value: null, ${key}: ${JSON.stringify(text)}}}\n`,
    )().instance.dataContainer.values;
    const field = values['F'];
    if (!(field instanceof InstanceDataStringAtom)) throw new Error(`expected a literal, got ${String(field)}`);
    expect(field.value).toBeNull();
    expect(described(field)).toBe(text);
    const group = values['G'];
    if (!(group instanceof InstanceDataAttributeValueField)) throw new Error(`expected an attribute-value field, got ${String(group)}`);
    expect((group.values['A'] as InstanceDataStringAtom).value).toBeNull();
  });
});
