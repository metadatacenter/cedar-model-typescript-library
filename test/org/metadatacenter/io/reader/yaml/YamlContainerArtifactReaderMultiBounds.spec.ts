import { CedarReaders, CedarWriters, JsonNode, Template } from '../../../../../../src';

/**
 * The lower bound a child carries after a trip through YAML.
 *
 * The YAML form leaves out a lower bound equal to the one the model supplies, so that a template
 * which omitted it does not come back stating it. Inverting that omission is the reader's job: a
 * child marked `multiple` with no bound beside it means the default, and a reader that reported
 * nothing there made the same template disagree with itself depending on which format it was read
 * from. The disagreement was invisible to a writer, which applies the default on the way out.
 *
 * An omitted bound in JSON is a different statement - that there is no floor at all - and stays
 * one. Nothing the libraries write omits it, so only a hand-edited template can say it.
 */
const textField = (): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/TemplateField',
  '@context': {},
  type: 'object',
  _ui: { inputType: 'textfield' },
  _valueConstraints: { requiredValue: false },
  properties: { '@value': { type: ['string', 'null'] } },
  required: ['@value'],
  'schema:name': 'Aliases',
  'schema:description': '',
  'schema:schemaVersion': '1.6.0',
});

const templateWith = (bounds?: { minItems?: number; maxItems?: number }): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/Template',
  '@id': 'https://example.org/templates/bounds',
  '@context': {},
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  _ui: { order: ['Aliases'], propertyLabels: { Aliases: 'Aliases' }, propertyDescriptions: { Aliases: '' } },
  required: [],
  properties: {
    '@context': { properties: { Aliases: { enum: ['https://example.org/Aliases'] } } },
    Aliases: { type: 'array', ...(bounds ?? {}), items: textField() },
  },
  'schema:name': 'Bounds',
  'schema:description': '',
  'schema:schemaVersion': '1.6.0',
});

const boundsFromJson = (source: JsonNode) => boundsOf(CedarReaders.json().getStrict().getTemplateReader().readFromObject(source).template);

const boundsFromYamlOf = (source: JsonNode) => {
  const template = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source).template;
  const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
  return boundsOf(CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template);
};

const boundsOf = (template: Template) => {
  const info = template.getChildInfo('Aliases')!;
  return {
    minItems: (info as unknown as { minItems: number | null }).minItems,
    maxItems: (info as unknown as { maxItems: number | null }).maxItems,
  };
};

describe('the lower bound of a child the template marks multiple', () => {
  test('a bound the template states survives both formats', () => {
    expect(boundsFromJson(templateWith({ minItems: 2, maxItems: 4 }))).toEqual({ minItems: 2, maxItems: 4 });
    expect(boundsFromYamlOf(templateWith({ minItems: 2, maxItems: 4 }))).toEqual({ minItems: 2, maxItems: 4 });
  });

  test('a bound equal to the default is left out of the YAML and read back all the same', () => {
    expect(boundsFromJson(templateWith({ minItems: 1, maxItems: 3 }))).toEqual({ minItems: 1, maxItems: 3 });
    expect(boundsFromYamlOf(templateWith({ minItems: 1, maxItems: 3 }))).toEqual({ minItems: 1, maxItems: 3 });
  });

  test('a template that states no floor at all keeps saying so', () => {
    // Only a hand-edited document reaches this: every writer states the number.
    expect(boundsFromJson(templateWith()).minItems).toBeNull();
  });
});
