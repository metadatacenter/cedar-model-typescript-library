import {
  CedarBuilders,
  CedarWriters,
  JsonTemplateFieldReader,
  JsonTemplateReader,
  NumberType,
  NumericField,
  TemplateChild,
  TemporalField,
  TemporalGranularity,
  TemporalType,
  YamlTemplateFieldReader,
  YamlTemplateReader,
} from '../../../../src';
import { NumericFieldImpl } from '../../../../src/org/metadatacenter/model/cedar/field/dynamic/numeric/NumericFieldImpl';
import { TemporalFieldImpl } from '../../../../src/org/metadatacenter/model/cedar/field/dynamic/temporal/TemporalFieldImpl';
import { TextPolicy } from '../../../../src/org/metadatacenter/policy/TextPolicy';

/**
 * A numeric or temporal field's datatype is one of the constants the model defines, and it is spelled
 * as one: `xsd:` and the local name. Java's readers match the spelling to a constant ignoring case and
 * refuse any other ("No numeric datatype constant … found"), a full XSD IRI among them. These readers
 * read any spelling they did not recognize as no datatype at all, and the writers then wrote
 * `numberType: null` or `datatype: null`, which the meta-schema and both YAML readers refuse.
 */
const XSD = 'http://www.w3.org/2001/XMLSchema#';

const numeric = () =>
  CedarBuilders.numericFieldBuilder()
    .withSchemaName('Count')
    .withNumberType(NumberType.INT)
    .withAtId('https://repo.metadatacenter.org/template-fields/n1')
    .build();
const temporal = () =>
  CedarBuilders.temporalFieldBuilder()
    .withSchemaName('When')
    .withTemporalType(TemporalType.DATE)
    .withTemporalGranularity(TemporalGranularity.DAY)
    .withAtId('https://repo.metadatacenter.org/template-fields/t1')
    .build();

type Kind = 'numeric' | 'temporal';
const KINDS: Record<Kind, { build: () => NumericField | TemporalField; key: string; refusal: string }> = {
  numeric: { build: numeric, key: 'numberType', refusal: 'No numeric datatype constant' },
  temporal: { build: temporal, key: 'temporalType', refusal: 'No temporal datatype constant' },
};
const datatypeOf = (field: TemplateChild | null): string | null => {
  if (field instanceof NumericFieldImpl) return field.valueConstraints.numberType.getValue();
  if (field instanceof TemporalFieldImpl) return field.valueConstraints.temporalType.getValue();
  throw new Error('Expected a numeric or a temporal field');
};

/** The field, written as JSON with its datatype spelled as given, read back. */
const viaJson = (kind: Kind, spelling: unknown, asChild: boolean): string | null => {
  const { build, key } = KINDS[kind];
  const field = build();
  if (!asChild) {
    const json = CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonNode(field);
    (json._valueConstraints as Record<string, unknown>)[key] = spelling;
    return datatypeOf(JsonTemplateFieldReader.getStrict().readFromObject(json).field);
  }
  const template = CedarBuilders.templateBuilder().withSchemaName('T').addChild(field, field.createDeploymentBuilder('C').build()).build();
  const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  ((json.properties as Record<string, Record<string, Record<string, unknown>>>).C._valueConstraints as Record<string, unknown>)[key] =
    spelling;
  return datatypeOf(JsonTemplateReader.getStrict().readFromObject(json).template.getChild('C'));
};

/** The field, written as YAML with its datatype spelled as given, read back. */
const viaYaml = (kind: Kind, spelling: string, asChild: boolean): string | null => {
  const field = KINDS[kind].build();
  const respell = (yaml: string) => yaml.replace(/^(\s*)datatype: .*$/m, `$1datatype: ${spelling}`);
  if (!asChild) {
    const yaml = respell(CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field));
    return datatypeOf(YamlTemplateFieldReader.getStrict().readFromString(yaml).field);
  }
  const template = CedarBuilders.templateBuilder().withSchemaName('T').addChild(field, field.createDeploymentBuilder('C').build()).build();
  const yaml = respell(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template));
  return datatypeOf(YamlTemplateReader.getStrict().readFromString(yaml).template.getChild('C'));
};

describe.each([false, true])('a datatype spelling (as a child: %s)', (asChild: boolean) => {
  test.each([
    ['numeric', 'xsd:int', 'xsd:int'],
    ['numeric', 'XSD:INT', 'xsd:int'],
    ['numeric', 'xsd:Decimal', 'xsd:decimal'],
    ['temporal', 'xsd:date', 'xsd:date'],
    ['temporal', 'xsd:datetime', 'xsd:dateTime'],
    ['temporal', 'XSD:TIME', 'xsd:time'],
  ])('%s %s reads as %s, from JSON and from YAML', (kind: string, spelling: string, constant: string) => {
    expect(viaJson(kind as Kind, spelling, asChild)).toBe(constant);
    expect(viaYaml(kind as Kind, `"${spelling}"`, asChild)).toBe(constant);
  });

  test.each([
    ['numeric', `${XSD}int`],
    ['numeric', `${XSD}decimal`],
    ['numeric', 'xsd:integer'],
    ['numeric', 'decimal'],
    ['numeric', ''],
    ['temporal', `${XSD}date`],
    ['temporal', `${XSD}dateTime`],
    ['temporal', 'xsd:timestamp'],
    ['temporal', ''],
  ])('%s %s is refused, from JSON and from YAML', (kind: string, spelling: string) => {
    const refusal = `${KINDS[kind as Kind].refusal} ${spelling} found`;
    expect(() => viaJson(kind as Kind, spelling, asChild)).toThrow(refusal);
    expect(() => viaYaml(kind as Kind, `"${spelling}"`, asChild)).toThrow(refusal);
  });

  test.each(['numeric', 'temporal'])('a %s datatype that is not a string is refused', (kind: string) => {
    expect(() => viaJson(kind as Kind, 42, asChild)).toThrow(`${KINDS[kind as Kind].refusal} 42 found`);
    expect(() => viaYaml(kind as Kind, '42', asChild)).toThrow(`${KINDS[kind as Kind].refusal} 42 found`);
  });
});

describe('a field that states no datatype', () => {
  test('takes the default, from JSON and from YAML', () => {
    const json = CedarWriters.json().getStrict().getFieldWriterForField(numeric()).getAsJsonNode(numeric());
    delete (json._valueConstraints as Record<string, unknown>).numberType;
    expect(datatypeOf(JsonTemplateFieldReader.getStrict().readFromObject(json).field)).toBe('xsd:decimal');
    const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(temporal()).getAsYamlString(temporal());
    const field = YamlTemplateFieldReader.getStrict().readFromString(yaml.replace(/^datatype: .*\n/m, '')).field;
    expect(datatypeOf(field)).toBe('xsd:dateTime');
  });

  test('a JSON datatype of null takes the default, as in Java', () => {
    const json = CedarWriters.json().getStrict().getFieldWriterForField(numeric()).getAsJsonNode(numeric());
    (json._valueConstraints as Record<string, unknown>).numberType = null;
    expect(datatypeOf(JsonTemplateFieldReader.getStrict().readFromObject(json).field)).toBe('xsd:decimal');
  });
});

// What Java 17's String.equalsIgnoreCase answers for each pair, measured, so a spelling Java matches to
// a constant is matched here too, and one it refuses is refused.
describe('a spelling is compared with a constant as Java compares it', () => {
  test.each([
    ['xsd:decimal', 'XSD:DECIMAL', true],
    ['xsd:dateTime', 'xsd:datetime', true],
    ['xsd:decimal', 'xſd:decimal', true],
    ['xsd:int', 'xsd:ınt', true],
    ['𐐀', '𐐨', true],
    ['xsd:int', 'xsd:in', false],
    ['xsd:int', 'xsd:int ', false],
    ['xsd:int', 'xsd:𐐀t', false],
  ])('%s and %s: %s', (constant: string, spelling: string, equal: boolean) => {
    expect(TextPolicy.equalsIgnoreCase(constant, spelling)).toBe(equal);
  });
});
