import { CedarBuilders, CedarReaders, CedarWriters, JsonNode } from '../../../../../../src';
import { SchemaVersion } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/SchemaVersion';

/**
 * The model version names the model a rendering conforms to, so the writer states it rather than
 * carrying forward whatever the document it read happened to say. Preserving a stored one
 * republished an assertion about a model this library no longer emits, and the meta-schemas admit
 * exactly one — so a stale value survived a round trip only to be refused on write.
 *
 * The YAML writer has always stamped it. These pin the JSON writers to the same rule.
 */
const STALE = '1.5.0';
const CURRENT = SchemaVersion.CURRENT.getValue();

const readers = CedarReaders.json().getStrict();
const writers = CedarWriters.json().getStrict();

const templateJson = (): JsonNode => {
  const field = CedarBuilders.textFieldBuilder().build();
  const template = CedarBuilders.templateBuilder()
    .withSchemaName('Template')
    .addChild(field, field.createDeploymentBuilder('field').build())
    .build();
  return writers.getTemplateWriter().getAsJsonNode(template);
};

describe('JSON writers and the model version', () => {
  it('states the current model version for a template that stored another', () => {
    const source = { ...templateJson(), 'schema:schemaVersion': STALE };
    const template = readers.getTemplateReader().readFromObject(source).template;
    expect(writers.getTemplateWriter().getAsJsonNode(template)['schema:schemaVersion']).toBe(CURRENT);
  });

  it('states it for a field a container holds', () => {
    const source = templateJson();
    ((source['properties'] as JsonNode)['field'] as JsonNode)['schema:schemaVersion'] = STALE;
    const template = readers.getTemplateReader().readFromObject(source).template;
    const written = writers.getTemplateWriter().getAsJsonNode(template);
    const field = (written['properties'] as JsonNode)['field'] as JsonNode;
    expect(field['schema:schemaVersion']).toBe(CURRENT);
  });

  it('states it for a field written on its own', () => {
    const standalone = (templateJson()['properties'] as JsonNode)['field'] as JsonNode;
    const source = { ...standalone, 'schema:schemaVersion': STALE };
    const field = readers.getTemplateFieldReader().readFromObject(source).field;
    expect(writers.getFieldWriterForField(field).getAsJsonNode(field)['schema:schemaVersion']).toBe(CURRENT);
  });
});
