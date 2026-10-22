import {
  CedarBuilders,
  CedarWriters,
  ChildDeploymentInfo,
  JsonNode,
  JsonPath,
  JsonTemplateFieldReader,
  JsonTemplateReader,
  TemplateChild,
  TemporalField,
  TemporalGranularity,
  TemporalType,
  TimeFormat,
  YamlTemplateFieldReader,
  YamlTemplateReader,
} from '../../../../src';
import { TemporalFieldImpl } from '../../../../src/org/metadatacenter/model/cedar/field/dynamic/temporal/TemporalFieldImpl';

/**
 * A temporal field's granularity and input time format are each one of the constants the model
 * defines, spelled exactly as the constant is. Java's readers refuse any other spelling, a case
 * variant among them. They look the spelling up among the model's values before they match it to a
 * constant. These readers read a spelling they did not know as no value, and the writers then left the
 * key out, so a field read as one thing was written back as another.
 */
const temporal = (): TemporalField =>
  CedarBuilders.temporalFieldBuilder()
    .withSchemaName('When')
    .withTemporalType(TemporalType.DATETIME)
    .withTemporalGranularity(TemporalGranularity.SECOND)
    .withInputTimeFormat(TimeFormat.H12)
    .withAtId('https://repo.metadatacenter.org/template-fields/t1')
    .build();
const inTemplate = (field: TemporalField) =>
  CedarBuilders.templateBuilder().withSchemaName('T').addChild(field, field.createDeploymentBuilder('C').build()).build();

type Key = 'granularity' | 'inputTimeFormat';
const KEYS: Record<Key, { json: string; refusal: string }> = {
  granularity: { json: 'temporalGranularity', refusal: 'No temporal granularity constant with name' },
  inputTimeFormat: { json: 'inputTimeFormat', refusal: 'No input time format constant with text' },
};
type Source = 'string' | 'object';
type Form = 'json' | 'yaml' | 'compact';

const valueOf = (key: Key, field: TemplateChild | null): string | null => {
  if (!(field instanceof TemporalFieldImpl)) throw new Error('Expected a temporal field');
  return key === 'granularity' ? field.temporalGranularity.getValue() : field.inputTimeFormat.getValue();
};
const plain = (node: unknown): JsonNode => JSON.parse(JSON.stringify(node));
/** The YAML document with `key` respelled as `value`. JSON's spelling of a scalar, a list or a mapping is also YAML's. */
const respell = (yaml: string, key: Key, value: unknown): string => {
  const respelled = yaml.replace(new RegExp(`^(\\s*)${key}: .*$`, 'm'), `$1${key}: ${JSON.stringify(value)}`);
  if (respelled === yaml) throw new Error(`The document states no ${key}`);
  return respelled;
};

/** The field, written in `form` with `key` spelled as given, read back from `source`, standalone or as a child. */
const readBack = (form: Form, key: Key, spelling: unknown, asChild: boolean, source: Source): string | null => {
  const field = temporal();
  if (form === 'json') {
    const writers = CedarWriters.json().getStrict();
    if (!asChild) {
      const json = plain(writers.getFieldWriterForField(field).getAsJsonNode(field));
      (json._ui as Record<string, unknown>)[KEYS[key].json] = spelling;
      const reader = JsonTemplateFieldReader.getStrict();
      return valueOf(key, (source === 'string' ? reader.readFromString(JSON.stringify(json)) : reader.readFromObject(json)).field);
    }
    const json = plain(writers.getTemplateWriter().getAsJsonNode(inTemplate(field)));
    ((json.properties as Record<string, Record<string, Record<string, unknown>>>).C._ui as Record<string, unknown>)[KEYS[key].json] =
      spelling;
    const reader = JsonTemplateReader.getStrict();
    const result = source === 'string' ? reader.readFromString(JSON.stringify(json)) : reader.readFromObject(json);
    return valueOf(key, result.template.getChild('C'));
  }
  const compact = form === 'compact';
  const writers = CedarWriters.yaml().getStrict();
  if (!asChild) {
    const writer = writers.getFieldWriterForField(field);
    const reader = compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict();
    if (source === 'string') {
      return valueOf(key, reader.readFromString(respell(writer.getAsYamlString(field, compact), key, spelling)).field);
    }
    const node = plain(writer.getYamlAsJsonNode(field, ChildDeploymentInfo.empty(), compact));
    node[key] = spelling as JsonNode;
    return valueOf(key, reader.readFromObject(node, ChildDeploymentInfo.empty(), new JsonPath()).field);
  }
  const template = inTemplate(field);
  const writer = writers.getTemplateWriter();
  const reader = compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict();
  if (source === 'string') {
    return valueOf(key, reader.readFromString(respell(writer.getAsYamlString(template, compact), key, spelling)).template.getChild('C'));
  }
  const node = plain(writer.getYamlAsJsonNode(template, compact));
  (node.children as JsonNode[])[0][key] = spelling as JsonNode;
  return valueOf(key, reader.readFromObject(node).template.getChild('C'));
};

const PATHS: [Form, boolean, Source][] = [];
for (const form of ['json', 'yaml', 'compact'] as Form[]) {
  for (const asChild of [false, true]) {
    for (const source of ['string', 'object'] as Source[]) {
      PATHS.push([form, asChild, source]);
    }
  }
}

describe.each(PATHS)('read as %s (as a child: %s, from a %s)', (form: Form, asChild: boolean, source: Source) => {
  test.each([
    ...TemporalGranularity.values().map((granularity) => ['granularity', granularity.getValue() as string]),
    ...TimeFormat.values().map((format) => ['inputTimeFormat', format.getValue() as string]),
  ])('a %s of %s reads as that constant', (key: string, spelling: string) => {
    expect(readBack(form, key as Key, spelling, asChild, source)).toBe(spelling);
  });

  test.each([
    ['granularity', 'Day'],
    ['granularity', 'SECOND'],
    ['granularity', 'decimalsecond'],
    ['granularity', 'week'],
    ['granularity', 'decimal_second'],
    ['granularity', ' day'],
    ['granularity', ''],
    ['granularity', 'ſecond'],
    ['inputTimeFormat', '12H'],
    ['inputTimeFormat', '24H'],
    ['inputTimeFormat', 'H12'],
    ['inputTimeFormat', '12'],
    ['inputTimeFormat', '12h '],
    ['inputTimeFormat', 'am/pm'],
    ['inputTimeFormat', ''],
  ])('a %s of "%s" is refused', (key: string, spelling: string) => {
    expect(() => readBack(form, key as Key, spelling, asChild, source)).toThrow(`${KEYS[key as Key].refusal} ${spelling} found`);
  });

  test.each([
    ['granularity', 42, '42'],
    ['granularity', true, 'true'],
    ['granularity', ['day'], '["day"]'],
    ['granularity', { day: 'day' }, '{"day":"day"}'],
    ['inputTimeFormat', 12, '12'],
    ['inputTimeFormat', ['12h'], '["12h"]'],
  ])('a %s of %j, which is not a string, is refused', (key: string, value: unknown, shown: string) => {
    expect(() => readBack(form, key as Key, value, asChild, source)).toThrow(`${KEYS[key as Key].refusal} ${shown} found`);
  });
});

describe('an input time format that is not stated', () => {
  test('is no value, from JSON and from YAML, as in Java', () => {
    const field = temporal();
    const json = plain(CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonNode(field));
    delete (json._ui as Record<string, unknown>).inputTimeFormat;
    expect(valueOf('inputTimeFormat', JsonTemplateFieldReader.getStrict().readFromObject(json).field)).toBeNull();
    const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field);
    const read = YamlTemplateFieldReader.getStrict().readFromString(yaml.replace(/^inputTimeFormat: .*\n/m, '')).field;
    expect(valueOf('inputTimeFormat', read)).toBeNull();
  });

  test('a JSON input time format of null is no value, as in Java', () => {
    const field = temporal();
    const json = plain(CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonNode(field));
    (json._ui as Record<string, unknown>).inputTimeFormat = null;
    expect(valueOf('inputTimeFormat', JsonTemplateFieldReader.getStrict().readFromObject(json).field)).toBeNull();
  });
});

test('the February 2024 JSON reader refuses an unknown spelling too', () => {
  const field = temporal();
  const json = plain(CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonNode(field));
  (json._ui as Record<string, unknown>).temporalGranularity = 'Second';
  expect(() => JsonTemplateFieldReader.getFebruary2024().readFromObject(json)).toThrow(
    'No temporal granularity constant with name Second found',
  );
  (json._ui as Record<string, unknown>).temporalGranularity = 'second';
  (json._ui as Record<string, unknown>).inputTimeFormat = '12 h';
  expect(() => JsonTemplateFieldReader.getFebruary2024().readFromObject(json)).toThrow(
    'No input time format constant with text 12 h found',
  );
});
