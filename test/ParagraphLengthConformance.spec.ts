import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { CedarBuilders, CedarReaders, CedarWriters, TextArea, YamlTemplateFieldReader, YamlTemplateReader } from '../src';

// Produced by Java's real builders/readers/writers; regenerate with
// itest/scripts/GenerateParagraphLengthFixtures.java, never with the TS implementation.
const cases = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../itest/resources/concordance/java-paragraph-lengths.json'), 'utf8'),
) as Array<{ minLength: number | null; maxLength: number | null; json: any; yaml: any; compactYaml: any }>;
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();

for (const entry of cases) {
  describe(`Java paragraph bounds ${entry.minLength}..${entry.maxLength}`, () => {
    test('the builder writes the same value constraints as Java', () => {
      const paragraph = CedarBuilders.textAreaBuilder()
        .withMinLength(entry.minLength)
        .withMaxLength(entry.maxLength)
        .withDefaultValue(entry.json._valueConstraints.defaultValue ?? null)
        .build();
      expect(paragraph.valueConstraints.minLength).toBe(entry.minLength);
      expect(paragraph.valueConstraints.maxLength).toBe(entry.maxLength);
      expect(jsonWriters.getFieldWriterForField(paragraph).getAsJsonNode(paragraph)._valueConstraints).toEqual(
        entry.json._valueConstraints,
      );
    });

    test('JSON from Java survives a TypeScript round trip', () => {
      const paragraph = CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(entry.json).field as TextArea;
      expect(paragraph.valueConstraints.minLength).toBe(entry.minLength);
      expect(paragraph.valueConstraints.maxLength).toBe(entry.maxLength);
      expect(jsonWriters.getFieldWriterForField(paragraph).getAsJsonNode(paragraph)).toEqual(entry.json);
      for (const compact of [false, true]) {
        expect(parse(yamlWriters.getFieldWriterForField(paragraph).getAsYamlString(paragraph, compact))).toEqual(
          compact ? entry.compactYaml : entry.yaml,
        );
      }
    });

    test.each([false, true])('Java YAML survives a round trip (compact=%s)', (compact) => {
      const expected = compact ? entry.compactYaml : entry.yaml;
      const reader = compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict();
      const paragraph = reader.readFromString(stringify(expected)).field as TextArea;
      expect(paragraph.valueConstraints.minLength).toBe(entry.minLength);
      expect(paragraph.valueConstraints.maxLength).toBe(entry.maxLength);
      expect(parse(yamlWriters.getFieldWriterForField(paragraph).getAsYamlString(paragraph, compact))).toEqual(expected);
      if (!compact) expect(jsonWriters.getFieldWriterForField(paragraph).getAsJsonNode(paragraph)).toEqual(entry.json);
    });
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
