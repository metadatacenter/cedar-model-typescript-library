import { CedarBuilders, CedarWriters, JsonNode, JsonTemplateFieldReader } from '../../../../../../src';

/**
 * Whether a field repeats, and how often, is what a template or element says of its child, so a field
 * written on its own has neither. The meta-schema writes an attribute-value field on its own as an
 * array of its attribute names, which states a minimum of zero and nothing more, and the bounds that
 * array states are no field's. Any other field written on its own is an object, as the Java reader and
 * the validator require.
 */
describe('a field written on its own', () => {
  const writer = CedarWriters.json().getStrict();

  test('is an attribute-value field in the array the meta-schema requires, with no bound of its own', () => {
    const field = CedarBuilders.attributeValueFieldBuilder()
      .withSchemaName('Attrs')
      .withAtId('https://repo.metadatacenter.org/template-fields/a1')
      .build();
    const json = writer.getFieldWriterForField(field).getAsJsonNode(field) as JsonNode;
    expect(json['type']).toBe('array');
    expect(json['minItems']).toBe(0);
    expect(Object.hasOwn(json, 'maxItems')).toBe(false);
    expect(JsonTemplateFieldReader.getStrict().readFromObject(json).field.schema_name).toBe('Attrs');
  });

  test('of any other type is refused when written as an array', () => {
    const field = CedarBuilders.textFieldBuilder()
      .withSchemaName('T')
      .withAtId('https://repo.metadatacenter.org/template-fields/t1')
      .build();
    const wrapped = { type: 'array', minItems: 1, items: writer.getFieldWriterForField(field).getAsJsonNode(field) } as unknown as JsonNode;
    expect(() => JsonTemplateFieldReader.getStrict().readFromObject(wrapped)).toThrow(/A field written on its own does not repeat/);
  });
});
