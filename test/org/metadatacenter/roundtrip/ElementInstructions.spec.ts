import { CedarBuilders, CedarReaders, CedarWriters, JsonNode } from '../../../../src';

/**
 * The instructions an element shows above and below its fields.
 *
 * `templateElementUIFieldContent` declares `header` and `footer`, the metadata editor renders both
 * when the element is expanded, and a stored element carrying them is valid. Neither library kept
 * them: each read an element's `_ui` as an order, property labels and property descriptions alone,
 * so any artifact a library rewrote came back with the author's instructions deleted, in silence.
 */
const elementWith = (header: string | null, footer: string | null) => {
  const element = CedarBuilders.templateElementBuilder()
    .withAtId('https://repo.metadatacenter.org/template-elements/00000000-0000-0000-0000-000000000000')
    .withTitle('Study details')
    .withDescription('d')
    .withSchemaName('Study details')
    .withSchemaDescription('d')
    .build();
  element.header = header;
  element.footer = footer;
  return element;
};

const jsonWriters = () => CedarWriters.json().getStrict();
const yamlWriters = () => CedarWriters.yaml().getStrict();

describe("an element's header and footer", () => {
  test('are written into its own _ui, and read back', () => {
    const json = jsonWriters().getTemplateElementWriter().getAsJsonNode(elementWith('Read the protocol.', 'Ask the steward.'));
    expect(json['_ui']).toStrictEqual({
      order: [],
      propertyLabels: {},
      propertyDescriptions: {},
      header: 'Read the protocol.',
      footer: 'Ask the steward.',
    });

    const read = CedarReaders.json()
      .getStrict()
      .getTemplateElementReader()
      .readFromObject(json as JsonNode).element;
    expect(read.header).toBe('Read the protocol.');
    expect(read.footer).toBe('Ask the steward.');
  });

  test('survive a YAML round trip', () => {
    const yaml = yamlWriters().getTemplateElementWriter().getAsYamlString(elementWith('Read the protocol.', 'Ask the steward.'));
    expect(yaml).toContain('header: "Read the protocol."');
    expect(yaml).toContain('footer: "Ask the steward."');

    const read = CedarReaders.yaml().getStrict().getTemplateElementReader().readFromString(yaml).element;
    expect(read.header).toBe('Read the protocol.');
    expect(read.footer).toBe('Ask the steward.');
  });

  test('are absent from both serializations when the element carries neither', () => {
    const element = elementWith(null, null);
    expect(jsonWriters().getTemplateElementWriter().getAsJsonNode(element)['_ui']).toStrictEqual({
      order: [],
      propertyLabels: {},
      propertyDescriptions: {},
    });
    const yaml = yamlWriters().getTemplateElementWriter().getAsYamlString(element);
    expect(yaml).not.toContain('header:');
    expect(yaml).not.toContain('footer:');
  });
});
