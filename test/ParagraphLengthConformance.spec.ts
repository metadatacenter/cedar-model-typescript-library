import { parse } from 'yaml';
import { CedarBuilders, CedarReaders, CedarWriters, JsonNode, YamlTemplateReader } from '../src';
import { fieldCases } from '../itest/FieldConcordanceFixture';

// The paragraph rows of the Java field matrix, which records what Java's builders, readers and
// writers make of each pair of character limits. The matrix holds this library's readers and writers
// to Java's JSON and YAML for each row. What it does not check is this library's builder.
const limit = (value: unknown): number | null => (typeof value === 'number' ? value : null);
const cases = fieldCases
  .filter((row) => row.type === 'textarea' && row.feature.startsWith('length-'))
  .map((row) => {
    const valueConstraints = JsonNode.getEmpty();
    Object.assign(valueConstraints, row.json._valueConstraints);
    return { valueConstraints, minLength: limit(valueConstraints.minLength), maxLength: limit(valueConstraints.maxLength) };
  });
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();

test('the Java field matrix holds a paragraph row for each pair of limits', () => {
  expect(cases.map((entry) => [entry.minLength, entry.maxLength])).toEqual([
    [null, null],
    [0, 0],
    [20, null],
    [null, 500],
    [20, 500],
  ]);
});

for (const entry of cases) {
  test(`the builder writes the value constraints Java writes for limits ${entry.minLength}..${entry.maxLength}`, () => {
    const paragraph = CedarBuilders.textAreaBuilder().withMinLength(entry.minLength).withMaxLength(entry.maxLength).build();
    expect(paragraph.valueConstraints.minLength).toBe(entry.minLength);
    expect(paragraph.valueConstraints.maxLength).toBe(entry.maxLength);
    expect(jsonWriters.getFieldWriterForField(paragraph).getAsJsonNode(paragraph)._valueConstraints).toEqual(
      entry.valueConstraints,
    );
  });
}

test('limits can be cleared without mutating a previously built paragraph', () => {
  const builder = CedarBuilders.textAreaBuilder().withMinLength(20).withMaxLength(500);
  const bounded = builder.build();
  const unbounded = builder.withMinLength(null).withMaxLength(null).build();
  expect(bounded.valueConstraints).toMatchObject({ minLength: 20, maxLength: 500 });
  expect(unbounded.valueConstraints).toMatchObject({ minLength: null, maxLength: null });
  const json = jsonWriters.getFieldWriterForField(unbounded).getAsJsonNode(unbounded);
  expect(json._valueConstraints).not.toHaveProperty('minLength');
  expect(json._valueConstraints).not.toHaveProperty('maxLength');
  for (const compact of [false, true]) {
    const yaml = parse(yamlWriters.getFieldWriterForField(unbounded).getAsYamlString(unbounded, compact));
    expect(yaml).not.toHaveProperty('minLength');
    expect(yaml).not.toHaveProperty('maxLength');
  }
  expect(builder).not.toHaveProperty('withRegex');
});

test('nested repeated paragraphs keep character limits separate from occurrence limits', () => {
  const paragraph = CedarBuilders.textAreaBuilder().withSchemaName('Paragraph').withMinLength(20).withMaxLength(500).build();
  const element = CedarBuilders.templateElementBuilder()
    .withSchemaName('Section')
    .addChild(paragraph, paragraph.createDeploymentBuilder('Paragraph').withMultiInstance(true).withMinItems(1).withMaxItems(3).build())
    .build();
  const template = CedarBuilders.templateBuilder()
    .withSchemaName('Template')
    .addChild(element, element.createDeploymentBuilder('Section').withMultiInstance(true).withMinItems(0).withMaxItems(2).build())
    .build();
  const writer = jsonWriters.getTemplateWriter();
  const expected = JSON.parse(writer.getAsJsonString(template));
  expect(expected.properties.Section.maxItems).toBe(2);
  const child = expected.properties.Section.items.properties.Paragraph;
  expect(child.maxItems).toBe(3);
  expect(child.items._valueConstraints).toMatchObject({ minLength: 20, maxLength: 500 });
  const jsonRestored = CedarReaders.json().getStrict().getTemplateReader().readFromObject(expected).template;
  expect(writer.getAsJsonNode(jsonRestored)).toEqual(expected);
  for (const compact of [false, true]) {
    const yaml = yamlWriters.getTemplateWriter().getAsYamlString(template, compact);
    const reader = compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict();
    const restored = reader.readFromString(yaml).template;
    const restoredChild = JSON.parse(writer.getAsJsonString(restored)).properties.Section.items.properties.Paragraph;
    expect(restoredChild.maxItems).toBe(3);
    expect(restoredChild.items._valueConstraints).toMatchObject({ minLength: 20, maxLength: 500 });
  }
});
