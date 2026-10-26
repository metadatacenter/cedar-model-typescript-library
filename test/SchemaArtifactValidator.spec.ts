import { SchemaArtifactValidator } from '../src/schema';
import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  JsonSourcePolicy,
  ChildDeploymentInfoAlwaysMultipleBuilder,
} from '../src';
import { schemaFormats } from '../src/org/metadatacenter/model/cedar/validation/SchemaFormats';

const writers = CedarWriters.json().getStrict();
const source = () =>
  writers
    .getTemplateWriter()
    .getAsJsonNode(CedarBuilders.templateBuilder().withSchemaName('Study').withDescription('Schema definition').build()) as any;

test('validates a raw document without dropping retained content', () => {
  const artifact = source();
  expect(SchemaArtifactValidator.structure(artifact)).toMatchObject({ canSave: true, findings: [] });
  artifact._ui.pages = [];
  const before = JsonSourcePolicy.stringify(artifact);
  expect(SchemaArtifactValidator.structure(artifact).findings).toEqual(
    expect.arrayContaining([expect.objectContaining({ path: '/_ui/pages', code: 'schema.additionalProperties' })]),
  );
  expect(JsonSourcePolicy.stringify(artifact)).toBe(before);
});

test('checks field and element roots and refuses a mismatched requested kind', () => {
  const element = writers
    .getTemplateElementWriter()
    .getAsJsonNode(CedarBuilders.templateElementBuilder().withSchemaName('Sample').withDescription('Schema definition').build());
  const model = CedarBuilders.textFieldBuilder().withSchemaName('Value').withDescription('Schema definition').build();
  const field = writers.getFieldWriterForField(model).getAsJsonNode(model);
  expect(SchemaArtifactValidator.structure(element, 'element').canSave).toBe(true);
  expect(SchemaArtifactValidator.structure(field, 'field').canSave).toBe(true);
  expect(SchemaArtifactValidator.structure(element, 'template').canSave).toBe(false);
  expect(SchemaArtifactValidator.structure(field, 'element').canSave).toBe(false);
});

test.each([null, [], {}, { '@type': 'foreign' }])('refuses incomplete input %j', (value) => {
  expect(SchemaArtifactValidator.structure(value).canSave).toBe(false);
});

test('refuses non-JSON numbers and cycles without mutating the document', () => {
  const artifact = source();
  artifact.extra = NaN;
  expect(SchemaArtifactValidator.structure(artifact).canSave).toBe(false);
  artifact.extra = artifact;
  expect(SchemaArtifactValidator.structure(artifact).canSave).toBe(false);
});

test('checks original exact numbers without rounding the artifact', () => {
  const template = CedarBuilders.templateBuilder().withSchemaName('Study').withDescription('Schema definition').build();
  const field = CedarBuilders.numericFieldBuilder().withSchemaName('Value').withDescription('Schema definition').build();
  template.addChild(field, field.createDeploymentBuilder('Value').build());
  const artifact: any = writers.getTemplateWriter().getAsJsonNode(template);
  const text = JsonSourcePolicy.stringify(artifact).replace('"requiredValue":false', '"requiredValue":false,"maxValue":9007199254740993.1');
  const exact = JsonSourcePolicy.parse(text);
  expect(SchemaArtifactValidator.structure(exact).canSave).toBe(true);
  expect(JsonSourcePolicy.stringify(exact)).toBe(text);
});

test.each([2147483648, 9007199254740992, 1.5, -1])('refuses occurrence %s in both raw schemas and the model', (limit) => {
  const field = CedarBuilders.checkboxFieldBuilder()
    .withSchemaName('Value')
    .withDescription('Schema definition')
    .addCheckboxOption('A')
    .build();
  expect(() => (field.createDeploymentBuilder('Value') as ChildDeploymentInfoAlwaysMultipleBuilder).withMaxItems(limit).build()).toThrow();
  const template = CedarBuilders.templateBuilder().withSchemaName('Study').withDescription('Schema definition').build();
  template.addChild(
    field,
    (field.createDeploymentBuilder('Value') as ChildDeploymentInfoAlwaysMultipleBuilder).withMaxItems(2147483647).build(),
  );
  const artifact: any = writers.getTemplateWriter().getAsJsonNode(template);
  expect(SchemaArtifactValidator.structure(artifact).canSave).toBe(true);
  artifact.properties.Value.maxItems = limit;
  expect(SchemaArtifactValidator.structure(artifact).canSave).toBe(false);
  expect(() => CedarReaders.json().getStrict().getTemplateReader().readFromObject(artifact)).toThrow();
});

test('runs raw default-value checks after structural validation', () => {
  const template = CedarBuilders.templateBuilder().withSchemaName('Study').withDescription('Schema definition').build();
  const field = CedarBuilders.textFieldBuilder().withSchemaName('Value').withDescription('Schema definition').build();
  template.addChild(field, field.createDeploymentBuilder('Value').build());
  const artifact: any = writers.getTemplateWriter().getAsJsonNode(template);
  Object.assign(artifact.properties.Value._valueConstraints, { minLength: 3, defaultValue: 'a' });
  expect(SchemaArtifactValidator.structure(artifact).canSave).toBe(true);
  expect(SchemaArtifactValidator.validate(artifact).canSave).toBe(false);
});

test('formats accept the shared Java reader forms and reject malformed values', () => {
  expect(schemaFormats.uri.validate('https://example.org/x')).toBe(true);
  expect(schemaFormats.uri.validate('')).toBe(true);
  expect(schemaFormats.uri.validate('a b')).toBe(false);
  expect(schemaFormats['date-time'].validate('2026-10-22T12:34:56Z')).toBe(true);
  expect(schemaFormats['date-time'].validate('2026-10-22T12:34:56.123456789+01:00')).toBe(true);
  expect(schemaFormats['date-time'].validate('2026-10-22')).toBe(false);
});

test('a nested language error reports only the applicable field schema, not every oneOf alternative', () => {
  const template = CedarBuilders.templateBuilder().withSchemaName('Study').withDescription('Schema').build();
  const field = CedarBuilders.textFieldBuilder().withSchemaName('Value').withDescription('Schema').build();
  template.addChild(field, field.createDeploymentBuilder('Value').build());
  const artifact: any = writers.getTemplateWriter().getAsJsonNode(template);
  artifact.properties.Value['@context']['@language'] = 'a b';
  expect(SchemaArtifactValidator.structure(artifact).findings).toEqual([
    expect.objectContaining({ path: '/properties/Value/@context/@language', code: 'schema.format' }),
  ]);
});
