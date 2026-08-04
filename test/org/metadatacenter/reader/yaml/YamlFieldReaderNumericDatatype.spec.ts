import {
  CedarBuilders,
  CedarWriters,
  JsonTemplateFieldReader,
  NumberType,
  NumericField,
  YamlTemplateFieldReader,
} from '../../../../../src';

/**
 * A numeric field with no explicit datatype defaults to xsd:decimal, read from
 * YAML exactly as it does from JSON.
 *
 * The value-constraints default is xsd:decimal, and the JSON reader keeps it by
 * only assigning a type when one is stated. The YAML reader used to assign
 * unconditionally, so an unspecified datatype came back as null — the same
 * numeric field disagreed with itself across the two serializations. The Java
 * library defaults to xsd:decimal from both readers; this pins the TypeScript
 * library to the same.
 */
describe('YamlFieldReaderNumeric datatype default', () => {
  const yamlOf = (field: NumericField): string =>
    CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field);
  const jsonOf = (field: NumericField): string =>
    CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonString(field);

  const numberTypeReadFromYaml = (field: NumericField): NumberType => {
    const result = YamlTemplateFieldReader.getStrict().readFromString(yamlOf(field));
    expect(result.parsingResult.wasSuccessful()).toBe(true);
    return (result.field as NumericField).valueConstraints.numberType;
  };

  const build = (configure: (b: ReturnType<typeof CedarBuilders.numericFieldBuilder>) => void = () => {}): NumericField => {
    const builder = CedarBuilders.numericFieldBuilder()
      .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
      .withTitle('Count')
      .withDescription('a count')
      .withSchemaName('Count')
      .withSchemaDescription('a count');
    configure(builder);
    return builder.build();
  };

  test('an unspecified datatype reads back as xsd:decimal', () => {
    expect(numberTypeReadFromYaml(build()).getValue()).toBe(NumberType.DECIMAL.getValue());
  });

  test('an explicit datatype is preserved', () => {
    const field = build((b) => b.withNumberType(NumberType.INT));
    expect(numberTypeReadFromYaml(field).getValue()).toBe(NumberType.INT.getValue());
  });

  test('JSON and YAML agree on the numeric type of the same field', () => {
    const field = build();
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlOf(field));
    const fromJson = JsonTemplateFieldReader.getStrict().readFromString(jsonOf(field));
    expect(fromYaml.parsingResult.wasSuccessful()).toBe(true);
    expect(fromJson.parsingResult.wasSuccessful()).toBe(true);
    expect((fromYaml.field as NumericField).valueConstraints.numberType.getValue()).toBe(
      (fromJson.field as NumericField).valueConstraints.numberType.getValue(),
    );
  });
});
