import {
  CedarArtifactId,
  CedarReaders,
  CedarWriters,
  InstanceDataAttributeValueField,
  InstanceDataAttributeValueFieldName,
  InstanceDataContainer,
  InstanceDataControlledAtom,
  InstanceDataEmptyNode,
  InstanceDataLinkAtom,
  InstanceDataLabelAtom,
  InstanceDataStringAtom,
  InstanceDataTypedAtom,
  JsonNode,
  TemplateInstance,
  YamlTemplateInstanceReader,
} from '../../../../../src';

const edgeCaseYaml = `type: "instance"
name: "Edge cases"
id: "https://example.org/instances/edge-cases"
isBasedOn: "https://example.org/templates/edge-cases"
children:
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
    - value: "first"
    - value: "2"
      datatype: "xsd:integer"
  _nested:
    id: "https://example.org/e1"
    children:
      _inside:
        value: "nested text"
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
_attributes:
  first:
    value: "one"
`;

/**
 * The empty values a document may not spell, which Java's reader and this one refuse, built in the
 * model instead. An editor can hold them, and the writer must leave each one out.
 */
const withEmptyValues = (instance: TemplateInstance): TemplateInstance => {
  const data = instance.dataContainer;
  data.setValue('_empty', new InstanceDataEmptyNode());
  data.setValue('_nullLiteral', new InstanceDataStringAtom(null));
  data.setValue('_nullTyped', new InstanceDataTypedAtom(null, 'xsd:dateTime'));
  data.setValue('_emptyNested', new InstanceDataContainer());
  const list = data.values._list;
  if (Array.isArray(list)) list.push(new InstanceDataEmptyNode());
  const nullAttributes = new InstanceDataAttributeValueField('_nullAttributes');
  nullAttributes.addValue('absent', new InstanceDataStringAtom(null));
  data.setValue('_nullAttributes', nullAttributes);
  return instance;
};

describe('an empty identifier is refused rather than dropped', () => {
  // `id: ""` is what a document writes where an identifier has not been assigned — half the element
  // occurrences in the shared corpus once did. Reading it as though the key were absent dropped the
  // node silently, which is what this used to assert; the value a document should carry there is null.
  test.each([
    ['a link value', 'type: "instance"\nname: "I"\nisBasedOn: "urn:template"\nchildren:\n  _blankLink:\n    id: ""\n'],
    [
      'an element occurrence',
      'type: "instance"\nname: "I"\nisBasedOn: "urn:template"\nchildren:\n  _nested:\n    id: ""\n    children:\n      _inner:\n        value: "v"\n',
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

  test.each([false, true])('preserves attribute-only nested elements (compact=%s)', (compact) => {
    const instance = reader.readFromString('type: instance\nname: Test\nisBasedOn: urn:template').instance;
    const element = new InstanceDataContainer();
    element.id = 'urn:element';
    const group = new InstanceDataAttributeValueField('annotations');
    group.addValue('answer', new InstanceDataStringAtom('kept'));
    element.setValue('annotations', group);
    instance.dataContainer.setValue('Element', element);
    const yaml = writer.getYamlAsJsonNode(instance, compact);
    const result = reader.readFromObject(yaml).instance.dataContainer.values.Element;
    expect(result).toBeInstanceOf(InstanceDataContainer);
    const container = result as InstanceDataContainer;
    const actualGroup = container.values.annotations as InstanceDataAttributeValueField;
    expect((actualGroup.values.answer as InstanceDataStringAtom).value).toBe('kept');
    if (!compact) expect(container.id).toBe('urn:element');
  });

  test.each(['type', 'id', 'children'])('rejects nested metadata collision %s', (key) => {
    const instance = reader.readFromString('type: instance\nname: Test\nisBasedOn: urn:template').instance;
    const element = new InstanceDataContainer();
    const group = new InstanceDataAttributeValueField(key);
    group.addValue('answer', new InstanceDataStringAtom('kept'));
    element.setValue(key, group);
    instance.dataContainer.setValue('Element', element);
    expect(() => writer.getYamlAsJsonNode(instance)).toThrow(/reserved for CEDAR instance metadata/);
  });

  test('malformed and null documents are refused without creating an empty instance', () => {
    for (const source of ['a: [unclosed', 'null', ''])
      expect(() => CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(source)).toThrow(SyntaxError);
  });

  test('parses list, typed, nested, link, and controlled values', () => {
    const values = reader.readFromString(edgeCaseYaml).instance.dataContainer.values;

    expect(Array.isArray(values._list)).toBe(true);
    if (!Array.isArray(values._list)) {
      throw new Error('Expected _list to be parsed as an array');
    }
    expect(values._list).toHaveLength(2);
    expect(values._list[0]).toBeInstanceOf(InstanceDataStringAtom);
    expect(values._list[1]).toBeInstanceOf(InstanceDataTypedAtom);
    expect(values._nested).toBeInstanceOf(InstanceDataContainer);
    expect(values._link).toBeInstanceOf(InstanceDataLinkAtom);
    expect(values._term).toBeInstanceOf(InstanceDataControlledAtom);
    expect(values._unknown).toBeInstanceOf(InstanceDataLabelAtom);
    expect((values._unknown as InstanceDataLabelAtom).label).toBe('label without an id');
  });

  test('reads attribute-value fields, and refuses a scalar or a list beside them, as Java does', () => {
    const values = reader.readFromString(edgeCaseYaml).instance.dataContainer.values;
    expect(values._attributes).toBeInstanceOf(InstanceDataAttributeValueField);
    // Only a mapping there can be an attribute-value field, so anything else is no key of the form.
    expect(() => reader.readFromString(`${edgeCaseYaml}_ignoredPrimitive: "not an attribute-value field"\n`)).toThrow(
      'Unknown key "_ignoredPrimitive" at /_ignoredPrimitive',
    );
    expect(() => reader.readFromString(`${edgeCaseYaml}_ignoredList:\n  - "not an attribute-value field"\n`)).toThrow(
      'Unknown key "_ignoredList" at /_ignoredList',
    );

    const nested = values._attributes as InstanceDataAttributeValueField;
    expect((nested.values.first as InstanceDataStringAtom).value).toBe('one');
  });

  test('writes every supported atom, including a linked attribute, and omits empty values', () => {
    const instance = withEmptyValues(reader.readFromString(edgeCaseYaml).instance);
    const linkedAttributes = new InstanceDataAttributeValueField('_linkedAttributes');
    linkedAttributes.addValue('link', new InstanceDataLinkAtom('https://example.org/linked-attribute'));
    const element = new InstanceDataContainer();
    element.setValue('_inside', new InstanceDataStringAtom('not an attribute'));
    linkedAttributes.addValue('element', element);
    instance.dataContainer.setValue('_linkedAttributes', linkedAttributes);

    const expanded = writer.getYamlAsJsonNode(instance);
    const compact = writer.getYamlAsJsonNode(instance, true);
    const children = expanded.children as JsonNode;

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
    expect(compact.id).toBe('https://example.org/instances/edge-cases');
    expect(((compact.children as JsonNode)._nested as JsonNode).id).toBeUndefined();
    expect(expanded._attributes).toEqual({ first: { value: 'one' } });
    expect(expanded._nullAttributes).toBeUndefined();
    // An attribute is a field value of any kind, as in Java, so a linked one is written rather than
    // dropped. An element is never an attribute, and is not written as one.
    expect(expanded._linkedAttributes).toEqual({ link: { id: 'https://example.org/linked-attribute' } });
  });

  test('never writes nulls, empty mappings, or empty lists', () => {
    const output = writer.getYamlAsJsonNode(withEmptyValues(reader.readFromString(edgeCaseYaml).instance));

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
isBasedOn: "urn:template"
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
    expect(once).toContain('type: element-instance');
  });

  test('an empty repeated element keeps the identifier it arrived with', () => {
    const identifiedStub = `type: "instance"
name: "Repeated elements"
isBasedOn: "urn:template"
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

  test('compact YAML keeps the root instance identifier but omits nested element identity', () => {
    const once = writer.getAsYamlString(reader.readFromString(edgeCaseYaml).instance, true);
    const twice = writer.getAsYamlString(reader.readFromString(once).instance, true);

    expect(twice).toBe(once);
    expect(once).toContain('id: "https://example.org/instances/edge-cases"');
    expect(once).not.toContain('id: "https://example.org/e1"');
    expect(once).toContain('id: "https://example.org/link"');
    expect(once).toContain('id: "https://example.org/term"');
  });

  // Java's writer refuses an instance with no name, and its reader refuses one written without it.
  // Writing `name: null` produced a document neither reader takes.
  test.each([false, true])('refuses to write an instance that has no name (compact=%s)', (compact) => {
    const instance = TemplateInstance.buildEmptyWithNullValues();
    instance.dataContainer.setValue('_note', new InstanceDataStringAtom('kept'));
    expect(() => writer.getYamlAsJsonNode(instance, compact)).toThrow(/A template instance must have a name/);
    expect(() => writer.getAsYamlString(instance, compact)).toThrow(/A template instance must have a name/);
  });

  // An empty name is no name: both readers refuse `name: ""`, so the writer refuses it as it refuses a
  // missing one. A name of nothing but white space is one both readers take, and it is written.
  test.each([false, true])('refuses to write an instance whose name is empty (compact=%s)', (compact) => {
    const instance = TemplateInstance.buildEmptyWithNullValues();
    instance.schema_isBasedOn = CedarArtifactId.forValue('https://repo.metadatacenter.org/templates/t1');
    instance.schema_name = '';
    const formReader = compact ? YamlTemplateInstanceReader.getStrictForCompact() : reader;
    const source = 'type: "instance"\nname: ""\nisBasedOn: "https://repo.metadatacenter.org/templates/t1"\n';
    expect(() => formReader.readFromString(source)).toThrow('Expected a non-empty string at /name.');
    expect(() => writer.getYamlAsJsonNode(instance, compact)).toThrow('A template instance must have a name.');
    expect(() => writer.getAsYamlString(instance, compact)).toThrow('A template instance must have a name.');
    instance.schema_name = ' ';
    const written = writer.getAsYamlString(instance, compact);
    expect(written).toContain('name: " "');
    expect(formReader.readFromString(written).instance.schema_name).toBe(' ');
  });

  // An instance whose template was never saved has no isBasedOn. Both readers refuse a document
  // without one, so the writer refuses it too, and CEE's download reports why.
  test.each([false, true])('refuses to write an instance that names no template (compact=%s)', (compact) => {
    const instance = TemplateInstance.buildEmptyWithNullValues();
    instance.schema_name = 'Unsaved';
    expect(() => writer.getYamlAsJsonNode(instance, compact)).toThrow(
      /A template instance must name the template it is based on/,
    );
    expect(() => writer.getAsYamlString(instance, compact)).toThrow(
      /A template instance must name the template it is based on/,
    );
  });

  // An attribute is a field value. The writer wrote its label, and the reader kept only its value,
  // so the label was lost on the library's own round trip; a datatype or an identifier was lost
  // before the writer saw it. Java's reader keeps all three.
  test('an attribute keeps its label, datatype and identifier across write, read and write', () => {
    const source = `type: "instance"
name: "Attributes"
isBasedOn: "https://repo.metadatacenter.org/templates/t1"
_attributes:
  labelled:
    value: "one"
    label: "One"
  typed:
    datatype: "xsd:int"
    value: "1"
  linked:
    id: "https://example.org/link"
  term:
    id: "https://example.org/term"
    label: "Term"
`;
    const instance = reader.readFromString(source).instance;
    const group = instance.dataContainer.values._attributes as InstanceDataAttributeValueField;
    expect(group.values.labelled).toBeInstanceOf(InstanceDataStringAtom);
    expect((group.values.labelled as InstanceDataStringAtom).label).toBe('One');
    expect(group.values.typed).toBeInstanceOf(InstanceDataTypedAtom);
    expect((group.values.typed as InstanceDataTypedAtom).type).toBe('xsd:int');
    expect(group.values.linked).toBeInstanceOf(InstanceDataLinkAtom);
    expect((group.values.linked as InstanceDataLinkAtom).id).toBe('https://example.org/link');
    expect(group.values.term).toBeInstanceOf(InstanceDataControlledAtom);

    const expected = {
      labelled: { value: 'one', label: 'One' },
      typed: { datatype: 'xsd:int', value: '1' },
      linked: { id: 'https://example.org/link' },
      term: { id: 'https://example.org/term', label: 'Term' },
    };
    expect(writer.getYamlAsJsonNode(instance)._attributes).toEqual(expected);
    const once = writer.getAsYamlString(instance);
    expect(writer.getAsYamlString(reader.readFromString(once).instance)).toBe(once);

    const json = CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instance) as JsonNode;
    expect(json._attributes).toEqual(['labelled', 'typed', 'linked', 'term']);
    expect(json.labelled).toEqual({ '@value': 'one', 'rdfs:label': 'One' });
    expect(json.typed).toEqual({ '@value': '1', '@type': 'xsd:int' });
    expect(json.linked).toEqual({ '@id': 'https://example.org/link' });
    expect(json.term).toEqual({ '@id': 'https://example.org/term', 'rdfs:label': 'Term' });
    const throughJson = CedarReaders.json().getStrict().getTemplateInstanceReader().readFromObject(json).instance;
    expect(writer.getYamlAsJsonNode(throughJson)._attributes).toEqual(expected);
  });

  test('writes CEE editable attribute-value fields under their field names', () => {
    const instance = reader.readFromString('type: "instance"\nname: "Editable attributes"\nisBasedOn: "urn:template"\n').instance;
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
