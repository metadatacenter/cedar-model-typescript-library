import {
  CedarReaders,
  CedarWriters,
  InstanceDataAttributeValueField,
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
children:
  _scalar: "plain text"
  _empty:
  _list:
    - "first"
    - value: "2"
      datatype: "xsd:integer"
    -
  _nested:
    id: "https://example.org/e1"
    children:
      _inside: "nested text"
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
`;

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
    expect(children._list).toEqual([{ value: 'first' }, { datatype: 'xsd:integer', value: '2' }]);
    expect((children._nested as JsonNode).id).toBe('https://example.org/e1');
    expect(((compact.children as JsonNode)._nested as JsonNode).id).toBeUndefined();
    expect(expanded._attributes).toEqual({ first: { value: 'one' } });
    expect(expanded._unsupportedAttributes).toBeUndefined();
  });
});
