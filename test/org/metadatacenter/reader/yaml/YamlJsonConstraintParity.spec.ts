import {
  CedarBuilders,
  CedarWriters,
  JsonTemplateFieldReader,
  NumberType,
  TemporalGranularity,
  TemporalType,
  YamlTemplateFieldReader,
} from '../../../../../src';

/**
 * The JSON reader and the YAML reader agree on a field's value constraints.
 *
 * A field written down both ways and read back must carry the same
 * `_valueConstraints` and `_ui` — the type, bounds, defaults and validation a
 * form is built from. This is where the one reader divergence found so far lived
 * (a numeric field's datatype defaulting), and it is where any future one would:
 * a constraint the YAML reader drops or reads differently changes what a filled
 * instance is allowed to hold. Compared through the JSON writer so the two
 * readings are checked as models, not as text.
 */
const base = (b: any) =>
  b
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withTitle('F')
    .withDescription('d')
    .withSchemaName('F')
    .withSchemaDescription('d');

const jsonNode = (f: any) => JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(f).getAsJsonString(f));
const jsonText = (f: any) => CedarWriters.json().getStrict().getFieldWriterForField(f).getAsJsonString(f);
const yamlText = (f: any) => CedarWriters.yaml().getStrict().getFieldWriterForField(f).getAsYamlString(f);

const cases: Array<[string, any]> = [
  ['text default', base(CedarBuilders.textFieldBuilder()).build()],
  ['text minLength', base(CedarBuilders.textFieldBuilder()).withMinLength(3).build()],
  ['text maxLength', base(CedarBuilders.textFieldBuilder()).withMaxLength(50).build()],
  ['text regex', base(CedarBuilders.textFieldBuilder()).withRegex('[A-Z]+').build()],
  ['text default value', base(CedarBuilders.textFieldBuilder()).withDefaultValue('hi').build()],
  ['numeric default', base(CedarBuilders.numericFieldBuilder()).build()],
  ['numeric int', base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.INT).build()],
  ['numeric min', base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).withMinValue(0).build()],
  ['numeric max', base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).withMaxValue(99).build()],
  ['numeric decimals', base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).withDecimalPlaces(2).build()],
  ['numeric unit', base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).withUnitOfMeasure('kg').build()],
  ['numeric default value', base(CedarBuilders.numericFieldBuilder()).withNumberType(NumberType.DECIMAL).withDefaultValue(42.5).build()],
  [
    'temporal date',
    base(CedarBuilders.temporalFieldBuilder()).withTemporalType(TemporalType.DATE).withTemporalGranularity(TemporalGranularity.DAY).build(),
  ],
  [
    'temporal time',
    base(CedarBuilders.temporalFieldBuilder())
      .withTemporalType(TemporalType.TIME)
      .withTemporalGranularity(TemporalGranularity.MINUTE)
      .build(),
  ],
  [
    'temporal datetime with timezone',
    base(CedarBuilders.temporalFieldBuilder())
      .withTemporalType(TemporalType.DATETIME)
      .withTemporalGranularity(TemporalGranularity.SECOND)
      .withTimezoneEnabled(true)
      .withDefaultValue('2026-08-20T14:30:00-07:00')
      .build(),
  ],
];

describe('JSON and YAML readers agree on a field value constraints', () => {
  test.each(cases)('%s', (_label, field) => {
    const viaJson = jsonNode(JsonTemplateFieldReader.getStrict().readFromString(jsonText(field)).field);
    const viaYaml = jsonNode(YamlTemplateFieldReader.getStrict().readFromString(yamlText(field)).field);
    expect(viaYaml._valueConstraints).toEqual(viaJson._valueConstraints);
    expect(viaYaml._ui).toEqual(viaJson._ui);
  });
});
