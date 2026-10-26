import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  TemporalField,
  TemporalGranularity,
  TemporalType,
  YamlTemplateFieldReader,
} from '../../../../../../../../src';

// A temporal field may state that its values carry a time zone, state that they do not, or state
// nothing, as some stored fields do. Each form keeps the three apart, so a field read from either form
// is written back as it was stated.

const built = (timezoneEnabled?: boolean): TemporalField => {
  const builder = CedarBuilders.temporalFieldBuilder()
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withTitle('Collected at')
    .withDescription('d')
    .withSchemaName('Collected at')
    .withSchemaDescription('d')
    .withTemporalGranularity(TemporalGranularity.MINUTE)
    .withTemporalType(TemporalType.TIME);
  return (timezoneEnabled === undefined ? builder : builder.withTimezoneEnabled(timezoneEnabled)).build();
};

const jsonOf = (field: TemporalField) => JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonString(field));
const yamlOf = (field: TemporalField, compact: boolean) =>
  CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field, compact);
const fromJson = (json: unknown) =>
  CedarReaders.json().getStrict().getTemplateFieldReader().readFromString(JSON.stringify(json)).field as TemporalField;
const fromYaml = (yaml: string, compact: boolean) =>
  (compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict()).readFromString(yaml)
    .field as TemporalField;

describe('a temporal field that states nothing about a time zone', () => {
  const stored = jsonOf(built(false));
  delete stored._ui.timezoneEnabled;
  const field = fromJson(stored);

  it('reads from JSON as stating nothing, and writes nothing back', () => {
    expect(field.timezoneEnabled).toBeNull();
    expect(jsonOf(field)._ui).not.toHaveProperty('timezoneEnabled');
  });

  it.each([false, true])('writes nothing to YAML (compact %s), and reads back as stating nothing', (compact) => {
    const yaml = yamlOf(field, compact);
    expect(yaml).not.toContain('inputTimeZone');
    const back = fromYaml(yaml, compact);
    expect(back.timezoneEnabled).toBeNull();
    expect(jsonOf(back)._ui).not.toHaveProperty('timezoneEnabled');
  });
});

describe.each([false, true])('a temporal field that states whether its values carry a time zone: %s', (timezoneEnabled) => {
  const field = built(timezoneEnabled);

  it.each([false, true])('states it in YAML (compact %s), and reads back as it was stated', (compact) => {
    const yaml = yamlOf(field, compact);
    expect(yaml).toContain(`inputTimeZone: ${timezoneEnabled}`);
    const back = fromYaml(yaml, compact);
    expect(back.timezoneEnabled).toBe(timezoneEnabled);
    expect(jsonOf(back)._ui.timezoneEnabled).toBe(timezoneEnabled);
  });

  it('reads from JSON as it was stated', () => {
    expect(fromJson(jsonOf(field)).timezoneEnabled).toBe(timezoneEnabled);
  });
});
