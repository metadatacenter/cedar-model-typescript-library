import { CedarBuilders, CedarReaders, CedarWriters, JsonNode } from '../../../../../../src';
import { SchemaVersion } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/SchemaVersion';

/**
 * The model version names the model a rendering conforms to, so the writer states it rather than
 * carrying forward whatever the document it read happened to say. Preserving a stored one
 * republished an assertion about a model this library no longer emits, and the meta-schemas admit
 * exactly one — so a stale value survived a round trip only to be refused on write.
 *
 * The YAML writer has always stamped it. These pin the JSON writers to the same rule. The JSON
 * readers now refuse a document that states another model version, as Java does, so the stale value
 * is set on the model a reader produced.
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
    expect(() => readers.getTemplateReader().readFromObject({ ...templateJson(), 'schema:schemaVersion': STALE })).toThrow(
      `Expecting model version ${CURRENT}, got ${STALE}`,
    );
    const template = readers.getTemplateReader().readFromObject(templateJson()).template;
    template.schema_schemaVersion = SchemaVersion.forValue(STALE);
    expect(writers.getTemplateWriter().getAsJsonNode(template)['schema:schemaVersion']).toBe(CURRENT);
  });

  it('states it for a field a container holds', () => {
    const stale = templateJson();
    ((stale['properties'] as JsonNode)['field'] as JsonNode)['schema:schemaVersion'] = STALE;
    expect(() => readers.getTemplateReader().readFromObject(stale)).toThrow(`Expecting model version ${CURRENT}, got ${STALE}`);
    const template = readers.getTemplateReader().readFromObject(templateJson()).template;
    const child = template.getChild('field');
    expect(child).not.toBeNull();
    child!.schema_schemaVersion = SchemaVersion.forValue(STALE);
    const written = writers.getTemplateWriter().getAsJsonNode(template);
    const field = (written['properties'] as JsonNode)['field'] as JsonNode;
    expect(field['schema:schemaVersion']).toBe(CURRENT);
  });

  it('states it for a field written on its own', () => {
    const standalone = (templateJson()['properties'] as JsonNode)['field'] as JsonNode;
    const source = { ...standalone, $schema: 'http://json-schema.org/draft-04/schema#' };
    expect(() => readers.getTemplateFieldReader().readFromObject({ ...source, 'schema:schemaVersion': STALE })).toThrow(
      `Expecting model version ${CURRENT}, got ${STALE}`,
    );
    const field = readers.getTemplateFieldReader().readFromObject(source).field;
    field.schema_schemaVersion = SchemaVersion.forValue(STALE);
    expect(writers.getFieldWriterForField(field).getAsJsonNode(field)['schema:schemaVersion']).toBe(CURRENT);
  });
});
