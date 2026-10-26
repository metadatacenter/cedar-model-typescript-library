import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  JsonNode,
  YamlTemplateElementReader,
  YamlTemplateFieldReader,
  YamlTemplateReader,
} from '../../../../src';

/**
 * A template, element or field built through the library's builders cannot be given a name that is
 * not empty but is made only of whitespace, as the Java library's builders cannot. Whitespace is what
 * Java's `String.isBlank` counts, so the no-break spaces and the zero-width space are not whitespace.
 * The readers accept such a name, as the meta-schema does, and an empty or absent name builds as it
 * always has. Instances are not schema artifacts, and their builder takes any name.
 */
describe('a whitespace-only name', () => {
  /** Every builder that builds a template, an element or a field, by the name the facade gives it. */
  const BUILDERS: string[] = Object.getOwnPropertyNames(CedarBuilders).filter(
    (name) => name.endsWith('Builder') && name !== 'templateInstanceBuilder',
  );
  type Builder = { withSchemaName(name: string | null): { build(): { schema_name: string | null } } };
  const build = (builder: string, name: string | null) =>
    (CedarBuilders as unknown as Record<string, () => Builder>)[builder]().withSchemaName(name).build();
  const kindOf = (builder: string) =>
    builder === 'templateBuilder' ? 'template' : builder === 'templateElementBuilder' ? 'element' : 'field';
  const article = (kind: string) => (kind === 'element' ? 'an' : 'a');

  const BLANK = [' ', '   ', '\t', '\n', ' \r\n ', '\u000b', '\u000c', '\u001c', '\u001f', ' ', ' ', ' ', ' ', ' ', '　'];
  const NOT_BLANK = [' ', ' ', ' ', '​', '﻿', '\u0085', ' a ', 'Study'];

  test('the facade offers the builders this covers', () => {
    expect(BUILDERS).toEqual(
      expect.arrayContaining(['templateBuilder', 'templateElementBuilder', 'textFieldBuilder', 'imageFieldBuilder']),
    );
    expect(BUILDERS).toHaveLength(27);
  });

  test.each(BUILDERS)('%s refuses one', (builder) => {
    const kind = kindOf(builder);
    for (const name of BLANK) {
      expect(() => build(builder, name)).toThrow(
        `The name ${JSON.stringify(name)} is made only of whitespace, so ${article(kind)} ${kind} cannot be built with it.`,
      );
    }
  });

  test.each(BUILDERS)('%s builds a name Java does not count as blank, and an empty or absent one', (builder) => {
    for (const name of NOT_BLANK) {
      expect(build(builder, name).schema_name).toBe(name);
    }
    expect(build(builder, '').schema_name).toBe('');
    expect(build(builder, null).schema_name).toBeNull();
  });

  test("an instance's builder takes one", () => {
    const instance = CedarBuilders.templateInstanceBuilder()
      .withSchemaName(' ')
      .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/t1')
      .build();
    expect(instance.schema_name).toBe(' ');
  });

  describe('is read', () => {
    const text = () =>
      CedarBuilders.textFieldBuilder().withSchemaName('F').withAtId('https://repo.metadatacenter.org/template-fields/f1').build();
    const element = () => {
      const field = text();
      return CedarBuilders.templateElementBuilder()
        .withSchemaName('E')
        .withAtId('https://repo.metadatacenter.org/template-elements/e1')
        .addChild(field, field.createDeploymentBuilder('F').build())
        .build();
    };
    const template = () => {
      const holder = element();
      return CedarBuilders.templateBuilder()
        .withSchemaName('T')
        .withAtId('https://repo.metadatacenter.org/templates/t1')
        .addChild(holder, holder.createDeploymentBuilder('E').build())
        .build();
    };
    const json = CedarWriters.json().getStrict();
    const yaml = CedarWriters.yaml().getStrict();
    const plain = (node: unknown): JsonNode => JSON.parse(JSON.stringify(node));

    test.each([
      ['strict', CedarReaders.json().getStrict()],
      ['February 2024', CedarReaders.json().getFebruary2024()],
    ])('by the %s JSON reader, for a template, an element and a field', (_behavior, readers) => {
      for (const name of BLANK) {
        const field = plain(json.getFieldWriterForField(text()).getAsJsonNode(text()));
        field['schema:name'] = name;
        expect(readers.getTemplateFieldReader().readFromObject(field).field.schema_name).toBe(name);
        const holder = plain(json.getTemplateElementWriter().getAsJsonNode(element()));
        holder['schema:name'] = name;
        expect(readers.getTemplateElementReader().readFromObject(holder).element.schema_name).toBe(name);
        const outer = plain(json.getTemplateWriter().getAsJsonNode(template()));
        outer['schema:name'] = name;
        expect(readers.getTemplateReader().readFromObject(outer).template.schema_name).toBe(name);
      }
    });

    test('by the YAML reader, for a template, an element and a field', () => {
      const named = (document: string, was: string, name: string): string => {
        const line = `name: "${was}"`;
        expect(document.split('\n').filter((candidate) => candidate === line)).toHaveLength(1);
        return document.replace(line, `name: ${JSON.stringify(name)}`);
      };
      for (const name of BLANK) {
        const field = named(yaml.getFieldWriterForField(text()).getAsYamlString(text(), false), 'F', name);
        expect(YamlTemplateFieldReader.getStrict().readFromString(field).field.schema_name).toBe(name);
        const holder = named(yaml.getTemplateElementWriter().getAsYamlString(element(), false), 'E', name);
        expect(YamlTemplateElementReader.getStrict().readFromString(holder).element.schema_name).toBe(name);
        const outer = named(yaml.getTemplateWriter().getAsYamlString(template(), false), 'T', name);
        expect(YamlTemplateReader.getStrict().readFromString(outer).template.schema_name).toBe(name);
      }
    });
  });
});
