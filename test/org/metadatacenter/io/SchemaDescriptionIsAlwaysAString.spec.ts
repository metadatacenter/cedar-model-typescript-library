import { CedarReaders, CedarWriters, JsonNode } from '../../../../src';

/**
 * `schema:description` is a string wherever it is written.
 *
 * An artifact with no description carries an empty one. A null reached a document as
 * `"schema:description": null`, which nothing downstream accepts, and it also made the same
 * artifact read from JSON and from YAML differ, since the YAML reader has always supplied an empty
 * string. Every artifact in the shared corpus carries a description, so nothing there could show
 * this.
 */
const templateWithoutDescriptions = (): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/Template',
  '@id': 'https://example.org/templates/nameless',
  '@context': {},
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  _ui: { order: ['Alias'], propertyLabels: { Alias: 'Alias' }, propertyDescriptions: { Alias: '' } },
  required: [],
  properties: {
    '@context': { properties: { Alias: { enum: ['https://example.org/Alias'] } } },
    Alias: {
      '@type': 'https://schema.metadatacenter.org/core/TemplateField',
      '@context': {},
      type: 'object',
      _ui: { inputType: 'textfield' },
      _valueConstraints: { requiredValue: false },
      properties: { '@value': { type: ['string', 'null'] } },
      required: ['@value'],
      'schema:name': 'Alias',
      'schema:schemaVersion': '1.6.0',
    },
  },
  'schema:name': 'Nameless',
  'schema:schemaVersion': '1.6.0',
});

const writtenJson = (source: JsonNode): JsonNode => {
  const template = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source).template;
  return JSON.parse(CedarWriters.json().getStrict().getTemplateWriter().getAsJsonString(template)) as JsonNode;
};

const writtenJsonViaYaml = (source: JsonNode): JsonNode => {
  const template = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source).template;
  const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
  const fromYaml = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
  return JSON.parse(CedarWriters.json().getStrict().getTemplateWriter().getAsJsonString(fromYaml)) as JsonNode;
};

describe('an artifact with no description', () => {
  test('writes an empty description rather than a null one', () => {
    const written = writtenJson(templateWithoutDescriptions());

    expect(written['schema:description']).toBe('');
    expect((written.properties as JsonNode).Alias as JsonNode).toHaveProperty('schema:description', '');
  });

  test('says the same thing whichever format it was read from', () => {
    const direct = writtenJson(templateWithoutDescriptions());
    const throughYaml = writtenJsonViaYaml(templateWithoutDescriptions());

    expect(throughYaml['schema:description']).toEqual(direct['schema:description']);
    expect(((throughYaml.properties as JsonNode).Alias as JsonNode)['schema:description']).toEqual(
      ((direct.properties as JsonNode).Alias as JsonNode)['schema:description'],
    );
  });
});
