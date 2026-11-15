import { CedarBuilders, CedarReaders, CedarWriters, JsonNode, NumberType, NumericField } from '../../../../src';
import { NumericFieldImpl } from '../../../../src/org/metadatacenter/model/cedar/field/dynamic/numeric/NumericFieldImpl';
import { SchemaArtifactValidator } from '../../../../src/org/metadatacenter/model/cedar/validation/SchemaArtifactValidator';

/**
 * An integer datatype has no decimal places. Java's validator refuses a numeric field whose integer
 * datatype states a number of them other than zero, and Java's reader refuses the field by the same
 * rule, as a standalone field and as a child, from JSON and from YAML. The strict readers here refuse
 * it too. The compatibility reader opens it, as it opens every template in the shared corpus, and
 * leaves the verdict to the validator. The builder already refuses the shape, so each document is
 * written for an xsd:decimal field and then given the datatype under test.
 */
const REFUSAL = 'An integer datatype cannot have decimal places';
const field = (decimalPlaces: number | null): NumericField =>
  CedarBuilders.numericFieldBuilder()
    .withSchemaName('Count')
    .withDescription('A count')
    .withAtId('https://repo.metadatacenter.org/template-fields/n1')
    .withNumberType(NumberType.DECIMAL)
    .withDecimalPlaces(decimalPlaces)
    .build();
const template = (child: NumericField) =>
  CedarBuilders.templateBuilder()
    .withSchemaName('T')
    .withDescription('A template')
    .withAtId('https://repo.metadatacenter.org/templates/t1')
    .addChild(child, child.createDeploymentBuilder('C').withIri('https://schema.metadatacenter.org/properties/c1').build())
    .build();
const object = (value: unknown): JsonNode => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object');
  return value as JsonNode;
};
const withDatatype = (constraints: unknown, datatype: string): void => {
  object(constraints).numberType = datatype;
};
const fieldJson = (places: number | null, datatype: string): JsonNode => {
  const child = field(places);
  const json = CedarWriters.json().getStrict().getFieldWriterForField(child).getAsJsonNode(child);
  withDatatype(json._valueConstraints, datatype);
  return json;
};
const templateJson = (places: number | null, datatype: string): JsonNode => {
  const json = JSON.parse(
    CedarWriters.json()
      .getStrict()
      .getTemplateWriter()
      .getAsJsonString(template(field(places))),
  );
  withDatatype(object(object(json.properties).C)._valueConstraints, datatype);
  return json;
};
const respell = (yaml: string, datatype: string): string => {
  const line = /^(\s*)datatype: xsd:decimal$/m;
  if (!line.test(yaml)) throw new Error('The document states no xsd:decimal datatype');
  return yaml.replace(line, `$1datatype: ${datatype}`);
};

/** Whether a strict reader refuses by this rule; any other refusal fails the test. */
const refuses = (read: () => unknown, at: string): boolean => {
  try {
    read();
    return false;
  } catch (error) {
    expect(error instanceof Error ? error.message : String(error)).toBe(`${REFUSAL}, at ${at}.`);
    return true;
  }
};

const integral = ['xsd:byte', 'xsd:short', 'xsd:int', 'xsd:long'];
const cases: Array<[string, number | null, boolean]> = [
  ...integral.map((type): [string, number, boolean] => [type, 2, true]),
  ...integral.map((type): [string, number, boolean] => [type, 0, false]),
  ...integral.map((type): [string, null, boolean] => [type, null, false]),
  ...['xsd:decimal', 'xsd:float', 'xsd:double'].map((type): [string, number, boolean] => [type, 2, false]),
];

describe('an integer datatype that states decimal places', () => {
  test.each(cases)('%s with %s decimal places: strict JSON readers refuse it exactly when the validator does', (type, places, refused) => {
    expect(
      refuses(
        () => CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(fieldJson(places, type)),
        '/_valueConstraints/decimalPlace',
      ),
    ).toBe(refused);
    const document = templateJson(places, type);
    expect(
      refuses(
        () => CedarReaders.json().getStrict().getTemplateReader().readFromObject(document),
        '/properties/C/_valueConstraints/decimalPlace',
      ),
    ).toBe(refused);
    const findings = SchemaArtifactValidator.validate(templateJson(places, type), 'template').findings;
    expect(findings.map((finding) => `${finding.code} ${finding.path}`)).toEqual(
      refused ? ['templateConstraint /properties/C/_valueConstraints/decimalPlace'] : [],
    );
  });

  test.each(cases)('%s with %s decimal places: strict YAML readers refuse it as the JSON readers do', (type, places, refused) => {
    const child = field(places);
    for (const compact of [false, true]) {
      const readers = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
      const yamlField = respell(CedarWriters.yaml().getStrict().getFieldWriterForField(child).getAsYamlString(child, compact), type);
      const yamlTemplate = respell(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template(child), compact), type);
      expect(refuses(() => readers.getTemplateFieldReader().readFromString(yamlField), '/decimalPlaces')).toBe(refused);
      expect(refuses(() => readers.getTemplateReader().readFromString(yamlTemplate), '/children/C/decimalPlaces')).toBe(refused);
    }
  });

  test('the compatibility reader opens it, keeping the decimal places for the validator to judge', () => {
    const read = CedarReaders.json().getFebruary2024().getTemplateReader().readFromObject(templateJson(2, 'xsd:long')).template;
    const child = read.getChild('C');
    expect(child).toBeInstanceOf(NumericFieldImpl);
    if (!(child instanceof NumericFieldImpl)) return;
    expect(child.valueConstraints.numberType).toBe(NumberType.LONG);
    expect(child.valueConstraints.decimalPlaces).toBe(2);
  });
});
