import {
  CedarReaders,
  CedarWriters,
  InstanceDataAttributeValueField,
  InstanceDataAttributeValueFieldName,
  InstanceDataContainer,
  InstanceDataControlledAtom,
  InstanceDataEmptyNode,
  InstanceDataLinkAtom,
  InstanceDataStringAtom,
  InstanceDataTypedAtom,
  JsonNode,
} from '../../../../../src';

const edgeCaseYaml = `type: "instance"
name: "Edge cases"
id: "https://example.org/instances/edge-cases"
children:
  _scalar: "plain text"
  _empty:
  _nullLiteral:
    value:
  _nullTyped:
    datatype: "xsd:dateTime"
    value:
  _dateTyped:
    datatype: "xsd:date"
    value: "2026-08-11"
  _numericSpellings:
    - datatype: "xsd:decimal"
      value: "12.5"
    - datatype: "xsd:long"
      value: "9007199254740992"
    - datatype: "xsd:int"
      value: "010"
  _list:
    - "first"
    - value: "2"
      datatype: "xsd:integer"
    -
  _nested:
    id: "https://example.org/e1"
    children:
      _inside: "nested text"
  _emptyNested:
    children: {}
  _elements:
    - type: "element-instance"
    - children:
        _inside:
          value: "second"
  _link:
    id: "https://example.org/link"
  _term:
    id: "https://example.org/term"
    label: "Term"
  _unknown:
    label: "label without an id"
_ignoredPrimitive: "not an attribute-value field"
_ignoredList:
  - "not an attribute-value field"
_attributes:
  first:
    value: "one"
_directAttributes:
  value: "direct"
_nullAttributes:
  absent:
    value:
`;

describe('an empty identifier is refused rather than dropped', () => {
  // `id: ""` is what a document writes where an identifier has not been assigned — half the element
  // occurrences in the shared corpus once did. Reading it as though the key were absent dropped the
  // node silently, which is what this used to assert; the value a document should carry there is null.
  test.each([
    ['a link value', 'type: "instance"\nname: "I"\nchildren:\n  _blankLink:\n    id: ""\n'],
    [
      'an element occurrence',
      'type: "instance"\nname: "I"\nchildren:\n  _nested:\n    id: ""\n    children:\n      _inner:\n        value: "v"\n',
    ],
    ['the instance itself', 'type: "instance"\nname: "I"\nid: ""\n'],
  ])('%s', (_label: string, yaml: string) => {
    expect(() => CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(yaml)).toThrow(/empty string is not a URI/);
  });

  // The JSON reader is the one production documents arrive through, and it read the empty string as
  // an absent key: the document came back with null in its place and nothing said so.
  test('the JSON reader refuses it too', () => {
    const instance = {
      '@id': 'https://repo.metadatacenter.org/template-instances/i1',
      '@context': {},
      'schema:name': 'I',
      'schema:description': '',
      'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
      address: { '@context': {}, '@id': '', street: { '@value': 'x' } },
    };
    expect(() => CedarReaders.json().getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(instance))).toThrow(
      /empty string is not a URI/,
    );
  });
});

describe('YAML instance edge cases', () => {
  const reader = CedarReaders.yaml().getStrict().getTemplateInstanceReader();
  const writer = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();

  test('malformed and null documents produce an empty usable instance', () => {
    expect(Object.keys(reader.readFromString(':\n  - [').instance.dataContainer.values)).toEqual([]);
    expect(Object.keys(reader.readFromObject(null as unknown as JsonNode).instance.dataContainer.values)).toEqual([]);
  });

  test('parses scalar, empty, list, typed, nested, link, and controlled values', () => {
    const values = reader.readFromString(edgeCaseYaml).instance.dataContainer.values;

    expect(values._scalar).toBeInstanceOf(InstanceDataStringAtom);
    expect(values._empty).toBeInstanceOf(InstanceDataEmptyNode);
    expect(Array.isArray(values._list)).toBe(true);
    if (!Array.isArray(values._list)) {
      throw new Error('Expected _list to be parsed as an array');
    }
    expect(values._list[0]).toBeInstanceOf(InstanceDataStringAtom);
    expect(values._list[1]).toBeInstanceOf(InstanceDataTypedAtom);
    expect(values._list[2]).toBeInstanceOf(InstanceDataEmptyNode);
    expect(values._nested).toBeInstanceOf(InstanceDataContainer);
    expect(values._link).toBeInstanceOf(InstanceDataLinkAtom);
    expect(values._term).toBeInstanceOf(InstanceDataControlledAtom);
    expect(values._unknown).toBeInstanceOf(InstanceDataEmptyNode);
  });

  test('accepts both nested and direct attribute-value spellings while ignoring primitives and lists', () => {
    const values = reader.readFromString(edgeCaseYaml).instance.dataContainer.values;
    expect(values._attributes).toBeInstanceOf(InstanceDataAttributeValueField);
    expect(values._directAttributes).toBeInstanceOf(InstanceDataAttributeValueField);
    expect(Object.hasOwn(values, '_ignoredPrimitive')).toBe(false);
    expect(Object.hasOwn(values, '_ignoredList')).toBe(false);

    const nested = values._attributes as InstanceDataAttributeValueField;
    const direct = values._directAttributes as InstanceDataAttributeValueField;
    expect((nested.values.first as InstanceDataStringAtom).value).toBe('one');
    expect((direct.values.value as InstanceDataStringAtom).value).toBe('direct');
  });

  test('writes every supported atom and omits empty or unsupported values', () => {
    const instance = reader.readFromString(edgeCaseYaml).instance;
    const unsupportedAttributes = new InstanceDataAttributeValueField('_unsupportedAttributes');
    unsupportedAttributes.addValue('link', new InstanceDataLinkAtom('https://example.org/not-a-string-attribute'));
    instance.dataContainer.setValue('_unsupportedAttributes', unsupportedAttributes);

    const expanded = writer.getYamlAsJsonNode(instance);
    const compact = writer.getYamlAsJsonNode(instance, true);
    const children = expanded.children as JsonNode;

    expect(children._scalar).toEqual({ value: 'plain text' });
    expect(children._empty).toBeUndefined();
    expect(children._nullLiteral).toBeUndefined();
    expect(children._nullTyped).toBeUndefined();
    expect(children._dateTyped).toEqual({ datatype: 'xsd:date', value: '2026-08-11' });
    expect(children._numericSpellings).toEqual([
      { datatype: 'xsd:decimal', value: '12.5' },
      { datatype: 'xsd:long', value: '9007199254740992' },
      { datatype: 'xsd:int', value: '010' },
    ]);
    expect(children._list).toEqual([{ value: 'first' }, { datatype: 'xsd:integer', value: '2' }]);
    expect((children._nested as JsonNode).id).toBe('https://example.org/e1');
    expect(children._emptyNested).toBeUndefined();
    expect(children._elements).toEqual([{ type: 'element-instance' }, { children: { _inside: { value: 'second' } } }]);
    // The compact form does not name the instance it describes; a nested element occurrence keeps its
    // own identifier, which is data rather than something a repository assigns.
    expect(compact.id).toBeUndefined();
    expect(((compact.children as JsonNode)._nested as JsonNode).id).toBe('https://example.org/e1');
    expect(expanded._attributes).toEqual({ first: { value: 'one' } });
    expect(expanded._nullAttributes).toBeUndefined();
    expect(expanded._unsupportedAttributes).toBeUndefined();
  });

  test('never writes nulls, empty mappings, or empty lists', () => {
    const output = writer.getYamlAsJsonNode(reader.readFromString(edgeCaseYaml).instance);

    const assertCanonical = (value: unknown, path: string): void => {
      if (value === null) {
        throw new Error(`Unexpected null at ${path}`);
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          throw new Error(`Unexpected empty list at ${path}`);
        }
        value.forEach((entry, index) => assertCanonical(entry, `${path}[${index}]`));
      } else if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (Object.keys(record).length === 0) {
          throw new Error(`Unexpected empty mapping at ${path}`);
        }
        Object.entries(record).forEach(([key, entry]) => assertCanonical(entry, `${path}.${key}`));
      }
    };

    assertCanonical(output, '$');
  });

  test('an empty repeated element stub survives write, read, and write', () => {
    const repeatedElements = `type: "instance"
name: "Repeated elements"
children:
  _elements:
    - type: "element-instance"
    - children:
        _inside:
          value: "second"
`;
    const once = writer.getAsYamlString(reader.readFromString(repeatedElements).instance);
    const twice = writer.getAsYamlString(reader.readFromString(once).instance);

    expect(twice).toBe(once);
    expect(once).toContain('type: "element-instance"');
  });

  test('an empty repeated element keeps the identifier it arrived with', () => {
    const identifiedStub = `type: "instance"
name: "Repeated elements"
children:
  _elements:
    - type: "element-instance"
      id: "https://example.org/occurrence-1"
    - type: "element-instance"
`;
    const once = writer.getAsYamlString(reader.readFromString(identifiedStub).instance);
    const twice = writer.getAsYamlString(reader.readFromString(once).instance);

    expect(once).toContain('id: "https://example.org/occurrence-1"');
    expect(twice).toBe(once);
  });

  test('compact YAML drops the instance identifier and keeps its children through a round trip', () => {
    const once = writer.getAsYamlString(reader.readFromString(edgeCaseYaml).instance, true);
    const twice = writer.getAsYamlString(reader.readFromString(once).instance, true);

    expect(twice).toBe(once);
    expect(once).not.toContain('id: "https://example.org/instances/edge-cases"');
    expect(once).toContain('id: "https://example.org/e1"');
  });

  test('writes CEE editable attribute-value fields under their field names', () => {
    const instance = reader.readFromString('type: "instance"\nname: "Editable attributes"\n').instance;
    instance.dataContainer.setValue('My AV Field 1', [
      new InstanceDataAttributeValueFieldName('A11'),
      new InstanceDataAttributeValueFieldName('A12'),
    ]);
    instance.dataContainer.setValue('A11', new InstanceDataStringAtom('V11'));
    instance.dataContainer.setValue('A12', new InstanceDataStringAtom('V12'));
    instance.dataContainer.setValue('My AV Field 2', [
      new InstanceDataAttributeValueFieldName('A21'),
      new InstanceDataAttributeValueFieldName('A22'),
    ]);
    instance.dataContainer.setValue('A21', new InstanceDataStringAtom('V21'));
    instance.dataContainer.setValue('A22', new InstanceDataStringAtom('V22'));

    const output = writer.getYamlAsJsonNode(instance);

    expect(output.children).toBeUndefined();
    expect(output['My AV Field 1']).toEqual({ A11: { value: 'V11' }, A12: { value: 'V12' } });
    expect(output['My AV Field 2']).toEqual({ A21: { value: 'V21' }, A22: { value: 'V22' } });
    expect(writer.getAsYamlString(reader.readFromObject(output).instance)).toBe(writer.getAsYamlString(instance));
  });
});
