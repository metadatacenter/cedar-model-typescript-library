import {
  CedarBuilders,
  CedarWriters,
  JsonTemplateFieldReader,
  NumberType,
  NumericField,
  TemporalField,
  TemporalGranularity,
  TemporalType,
  YamlTemplateFieldReader,
} from '../../../../src';

const base = (builder: any) =>
  builder
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withTitle('Declared default')
    .withDescription('Exercises declared defaults')
    .withSchemaName('Declared default')
    .withSchemaDescription('Exercises declared defaults');

const jsonWriterFor = (field: NumericField | TemporalField) => CedarWriters.json().getStrict().getFieldWriterForField(field);
const yamlWriterFor = (field: NumericField | TemporalField) => CedarWriters.yaml().getStrict().getFieldWriterForField(field);

describe('numeric and temporal declared defaults', () => {
  test.each<[string, NumberType, number]>([
    ['decimal', NumberType.DECIMAL, 42.5],
    ['int', NumberType.INT, 2147483647],
    ['long', NumberType.LONG, Number.MAX_SAFE_INTEGER],
    ['byte', NumberType.BYTE, -128],
    ['short', NumberType.SHORT, 32767],
    ['float', NumberType.FLOAT, 3.4e38],
    ['double', NumberType.DOUBLE, 1e300],
  ])('%s default is valid and round-trips in JSON and YAML', (_label, numberType, defaultValue) => {
    const original = base(CedarBuilders.numericFieldBuilder())
      .withNumberType(numberType)
      .withDefaultValue(defaultValue)
      .build() as NumericField;

    const fromJson = JsonTemplateFieldReader.getStrict().readFromString(jsonWriterFor(original).getAsJsonString(original))
      .field as NumericField;
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlWriterFor(original).getAsYamlString(original))
      .field as NumericField;
    expect(fromJson.valueConstraints.defaultValue).toBe(defaultValue);
    expect(fromYaml.valueConstraints.defaultValue).toBe(defaultValue);
  });

  test.each<[string, NumberType, number]>([
    ['fractional int', NumberType.INT, 1.5],
    ['int overflow', NumberType.INT, 2147483648],
    ['unsafe long', NumberType.LONG, Number.MAX_SAFE_INTEGER + 1],
    ['byte overflow', NumberType.BYTE, 128],
    ['short underflow', NumberType.SHORT, -32769],
    ['float overflow', NumberType.FLOAT, 3.5e38],
    ['float underflow', NumberType.FLOAT, 1e-46],
  ])('%s default is rejected', (_label, numberType, defaultValue) => {
    expect(() => base(CedarBuilders.numericFieldBuilder()).withNumberType(numberType).withDefaultValue(defaultValue).build()).toThrow(
      /numeric default/i,
    );
  });

  test('numeric default must satisfy the field bounds', () => {
    expect(() =>
      base(CedarBuilders.numericFieldBuilder())
        .withNumberType(NumberType.DECIMAL)
        .withMinValue(10)
        .withMaxValue(20)
        .withDefaultValue(9)
        .build(),
    ).toThrow(/below minValue/);
  });

  test('numeric default round-trips through canonical JSON', () => {
    const original = base(CedarBuilders.numericFieldBuilder())
      .withNumberType(NumberType.DOUBLE)
      .withDefaultValue(42.5)
      .build() as NumericField;

    const once = jsonWriterFor(original).getAsJsonString(original);
    expect(JSON.parse(once)._valueConstraints.defaultValue).toBe('42.5');

    const read = JsonTemplateFieldReader.getStrict().readFromString(once).field as NumericField;
    expect(read.valueConstraints.defaultValue).toBe(42.5);
    expect(JSON.parse(jsonWriterFor(read).getAsJsonString(read))).toEqual(JSON.parse(once));
  });

  test('numeric default round-trips through YAML as a numeric scalar', () => {
    const original = base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.INT).withDefaultValue(-17).build() as NumericField;

    const once = yamlWriterFor(original).getAsYamlString(original);
    expect(once).toContain('default: -17');

    const read = YamlTemplateFieldReader.getStrict().readFromString(once).field as NumericField;
    expect(read.valueConstraints.defaultValue).toBe(-17);
    expect(yamlWriterFor(read).getAsYamlString(read)).toBe(once);
  });

  test('legacy bare-number JSON is accepted and rewritten canonically', () => {
    const original = base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.INT).build() as NumericField;
    const node = JSON.parse(jsonWriterFor(original).getAsJsonString(original));
    node._valueConstraints.defaultValue = 7;

    const read = JsonTemplateFieldReader.getStrict().readFromString(JSON.stringify(node)).field as NumericField;
    expect(read.valueConstraints.defaultValue).toBe(7);
    expect(JSON.parse(jsonWriterFor(read).getAsJsonString(read))._valueConstraints.defaultValue).toBe('7');
  });

  test('numeric strings from YAML and JSON converge on the same model', () => {
    const original = base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).build() as NumericField;
    const jsonNode = JSON.parse(jsonWriterFor(original).getAsJsonString(original));
    jsonNode._valueConstraints.defaultValue = '1.25e2';
    const yaml = yamlWriterFor(original).getAsYamlString(original) + 'default: "1.25e2"\n';

    const fromJson = JsonTemplateFieldReader.getStrict().readFromString(JSON.stringify(jsonNode)).field as NumericField;
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yaml).field as NumericField;
    expect(fromJson.valueConstraints.defaultValue).toBe(125);
    expect(fromYaml.valueConstraints.defaultValue).toBe(125);
  });

  test.each(['not-a-number', 'Infinity'])('invalid numeric default %s is rejected', (defaultValue) => {
    const original = base(CedarBuilders.numericFieldBuilder()).build() as NumericField;
    const node = JSON.parse(jsonWriterFor(original).getAsJsonString(original));
    node._valueConstraints.defaultValue = defaultValue;
    expect(() => JsonTemplateFieldReader.getStrict().readFromString(JSON.stringify(node))).toThrow(/numeric default/i);
  });

  test('temporal default round-trips through JSON and YAML', () => {
    const value = '2026-08-20T14:30:00-07:00';
    const original = base(CedarBuilders.temporalFieldBuilder())
      .withTemporalType(TemporalType.DATETIME)
      .withTemporalGranularity(TemporalGranularity.SECOND)
      .withDefaultValue(value)
      .build() as TemporalField;

    const jsonOnce = jsonWriterFor(original).getAsJsonString(original);
    const fromJson = JsonTemplateFieldReader.getStrict().readFromString(jsonOnce).field as TemporalField;
    expect(fromJson.valueConstraints.defaultValue).toBe(value);
    expect(JSON.parse(jsonWriterFor(fromJson).getAsJsonString(fromJson))).toEqual(JSON.parse(jsonOnce));

    const yamlOnce = yamlWriterFor(original).getAsYamlString(original);
    expect(yamlOnce).toContain(`default: "${value}"`);
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlOnce).field as TemporalField;
    expect(fromYaml.valueConstraints.defaultValue).toBe(value);
    expect(yamlWriterFor(fromYaml).getAsYamlString(fromYaml)).toBe(yamlOnce);
  });

  test.each<[string, TemporalType, TemporalGranularity, string]>([
    ['date/year', TemporalType.DATE, TemporalGranularity.YEAR, '2026'],
    ['date/month', TemporalType.DATE, TemporalGranularity.MONTH, '2026-08'],
    ['date/day', TemporalType.DATE, TemporalGranularity.DAY, '2024-02-29'],
    ['time/hour', TemporalType.TIME, TemporalGranularity.HOUR, '14'],
    ['time/minute', TemporalType.TIME, TemporalGranularity.MINUTE, '14:30Z'],
    ['time/second', TemporalType.TIME, TemporalGranularity.SECOND, '14:30:45-07:00'],
    ['time/decimalSecond', TemporalType.TIME, TemporalGranularity.DECIMAL_SECOND, '14:30:45.125'],
    ['dateTime/day', TemporalType.DATETIME, TemporalGranularity.DAY, '2026-08-20'],
    ['dateTime/hour', TemporalType.DATETIME, TemporalGranularity.HOUR, '2026-08-20T14'],
    ['dateTime/minute', TemporalType.DATETIME, TemporalGranularity.MINUTE, '2026-08-20T14:30Z'],
    ['dateTime/second', TemporalType.DATETIME, TemporalGranularity.SECOND, '2026-08-20T14:30:45-07:00'],
    ['dateTime/decimalSecond', TemporalType.DATETIME, TemporalGranularity.DECIMAL_SECOND, '2026-08-20T14:30:45.125'],
  ])('%s default is valid and round-trips in JSON and YAML', (_label, temporalType, granularity, defaultValue) => {
    const original = base(CedarBuilders.temporalFieldBuilder())
      .withTemporalType(temporalType)
      .withTemporalGranularity(granularity)
      .withDefaultValue(defaultValue)
      .build() as TemporalField;

    const fromJson = JsonTemplateFieldReader.getStrict().readFromString(jsonWriterFor(original).getAsJsonString(original))
      .field as TemporalField;
    const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlWriterFor(original).getAsYamlString(original))
      .field as TemporalField;
    expect(fromJson.valueConstraints.defaultValue).toBe(defaultValue);
    expect(fromYaml.valueConstraints.defaultValue).toBe(defaultValue);
  });

  test.each<[string, TemporalType, TemporalGranularity, string]>([
    ['time supplied for date', TemporalType.DATE, TemporalGranularity.DAY, '14:30:45'],
    ['date supplied for time', TemporalType.TIME, TemporalGranularity.SECOND, '2026-08-20'],
    ['date supplied for second-granularity dateTime', TemporalType.DATETIME, TemporalGranularity.SECOND, '2026-08-20'],
    ['invalid calendar date', TemporalType.DATE, TemporalGranularity.DAY, '2026-02-30'],
    ['invalid clock time', TemporalType.TIME, TemporalGranularity.MINUTE, '25:00'],
    ['date with time granularity', TemporalType.DATE, TemporalGranularity.HOUR, '2026-08-20'],
    ['dateTime with year granularity', TemporalType.DATETIME, TemporalGranularity.YEAR, '2026'],
  ])('%s default is rejected', (_label, temporalType, granularity, defaultValue) => {
    expect(() =>
      base(CedarBuilders.temporalFieldBuilder())
        .withTemporalType(temporalType)
        .withTemporalGranularity(granularity)
        .withDefaultValue(defaultValue)
        .build(),
    ).toThrow(/temporal/i);
  });

  test('JSON to YAML to JSON preserves both default types', () => {
    const fields: Array<NumericField | TemporalField> = [
      base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).withDefaultValue(0.125).build() as NumericField,
      base(CedarBuilders.temporalFieldBuilder())
        .withTemporalType(TemporalType.DATE)
        .withTemporalGranularity(TemporalGranularity.DAY)
        .withDefaultValue('2026-08-20')
        .build() as TemporalField,
    ];

    for (const field of fields) {
      const fromJson = JsonTemplateFieldReader.getStrict().readFromString(jsonWriterFor(field).getAsJsonString(field)).field as
        NumericField | TemporalField;
      const fromYaml = YamlTemplateFieldReader.getStrict().readFromString(yamlWriterFor(fromJson).getAsYamlString(fromJson)).field as
        NumericField | TemporalField;
      const originalNode = JSON.parse(jsonWriterFor(field).getAsJsonString(field));
      const roundTrippedNode = JSON.parse(jsonWriterFor(fromYaml).getAsJsonString(fromYaml));
      expect(roundTrippedNode._valueConstraints).toEqual(originalNode._valueConstraints);
      expect(roundTrippedNode._ui).toEqual(originalNode._ui);
    }
  });
});
