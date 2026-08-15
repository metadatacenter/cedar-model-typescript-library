import { CedarBuilders, CedarWriters, YamlTemplateElementReader, YamlTemplateFieldReader } from '../../../../../src';
import { StaticImageFieldImpl } from '../../../../../src/org/metadatacenter/model/cedar/field/static/image/StaticImageFieldImpl';

/**
 * Two things a parent holds about the artifacts inside it, and where each is written.
 *
 * An element's preferred and alternative labels belong to the element itself, and the JSON writer has
 * always written both. The YAML writer wrote neither, so an element's question text survived a JSON
 * round trip and vanished on a YAML one — five elements of `template-029` lost theirs, which is how it
 * was found.
 *
 * A static field's display size belongs to the parent instead. The specification puts `width` and
 * `height` in the child's `configuration` alongside the rest of what the parent decides, and among the
 * field's own keys only when the field is written on its own, with no parent to hold them. This library
 * wrote them among the field's keys either way.
 */
const elementWith = (prefLabel: string | null, altLabels: string[]) => {
  const element = CedarBuilders.templateElementBuilder()
    .withAtId('https://repo.metadatacenter.org/template-elements/00000000-0000-0000-0000-000000000000')
    .withTitle('Sample')
    .withDescription('d')
    .withSchemaName('Sample')
    .withSchemaDescription('d')
    .build();
  element.skos_prefLabel = prefLabel;
  element.skos_altLabel = altLabels;
  return element;
};

const image = () =>
  CedarBuilders.imageFieldBuilder()
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withTitle('Diagram')
    .withDescription('d')
    .withSchemaName('Diagram')
    .withSchemaDescription('d')
    .withContent('https://example.org/diagram.png')
    .withWidth(300)
    .withHeight(120)
    .build();

const yamlWriters = () => CedarWriters.yaml().getStrict();

describe("an element's labels", () => {
  test('are written and read back', () => {
    const yaml = yamlWriters()
      .getTemplateElementWriter()
      .getAsYamlString(elementWith('Which sample?', ['Sample?', 'The sample']));
    expect(yaml).toContain('prefLabel: "Which sample?"');
    expect(yaml).toContain('altLabels:');

    const read = YamlTemplateElementReader.getStrict().readFromString(yaml).element;
    expect(read.skos_prefLabel).toBe('Which sample?');
    expect(read.skos_altLabel).toStrictEqual(['Sample?', 'The sample']);
  });

  test('are absent from the YAML when the element carries none', () => {
    const yaml = yamlWriters().getTemplateElementWriter().getAsYamlString(elementWith(null, []));
    expect(yaml).not.toContain('prefLabel');
    expect(yaml).not.toContain('altLabels');
  });

  test('survive a template that holds the element', () => {
    const template = CedarBuilders.templateBuilder()
      .withAtId('https://repo.metadatacenter.org/templates/00000000-0000-0000-0000-000000000000')
      .withTitle('T')
      .withDescription('d')
      .withSchemaName('T')
      .withSchemaDescription('d')
      .addChild(elementWith('Which sample?', []), elementWith('Which sample?', []).createDeploymentBuilder('sample').build())
      .build();
    expect(yamlWriters().getTemplateWriter().getAsYamlString(template)).toContain('prefLabel: "Which sample?"');
  });
});

describe("a static field's display size", () => {
  test('is written by the parent, into the child configuration', () => {
    const field = image();
    const element = CedarBuilders.templateElementBuilder()
      .withAtId('https://repo.metadatacenter.org/template-elements/00000000-0000-0000-0000-000000000000')
      .withTitle('E')
      .withDescription('d')
      .withSchemaName('E')
      .withSchemaDescription('d')
      .addChild(field, field.createDeploymentBuilder('diagram').build())
      .build();

    const yaml = yamlWriters().getTemplateElementWriter().getAsYamlString(element);
    expect(yaml).toContain('configuration:\n      width: 300\n      height: 120');

    const readField = imageChildOf(yaml);
    expect(readField.width).toBe(300);
    expect(readField.height).toBe(120);
  });

  test("is written among the field's own keys when the field has no parent", () => {
    const yaml = yamlWriters().getFieldWriterForField(image()).getAsYamlString(image());
    expect(yaml).toContain('width: 300');
    expect(yaml).toContain('height: 120');
    expect(yaml).not.toContain('configuration:');

    const read = YamlTemplateFieldReader.getStrict().readFromString(yaml).field;
    if (!(read instanceof StaticImageFieldImpl)) {
      throw new Error(`an image field read back as ${read.constructor.name}`);
    }
    expect(read.width).toBe(300);
    expect(read.height).toBe(120);
  });
});

/** The image child of an element written as YAML, read back. */
function imageChildOf(yaml: string): StaticImageFieldImpl {
  const field = YamlTemplateElementReader.getStrict().readFromString(yaml).element.getChild('diagram');
  if (!(field instanceof StaticImageFieldImpl)) {
    throw new Error(`an image field read back as ${field?.constructor?.name}`);
  }
  return field;
}
