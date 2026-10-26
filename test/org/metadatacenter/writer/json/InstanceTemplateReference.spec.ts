import {
  CedarArtifactId,
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  InstanceDataStringAtom,
  JsonNode,
  TemplateInstance,
} from '../../../../../src';

/**
 * A written instance names the template it is based on.
 *
 * An instance has no `schema:isBasedOn` only when its template has never been saved, and such an
 * instance says nothing of what it is an instance of. Java's JSON reader refuses a document without
 * one, and the Java library cannot build such an instance. The YAML writer already refused to write
 * one, and the JSON writer now refuses it with the same words. The JSON readers still read a document
 * without one, as a draft extracted without its envelope is, and report it.
 */
const TEMPLATE = 'https://repo.metadatacenter.org/templates/t1';
const REFUSAL = 'A template instance must name the template it is based on.';
const WRITERS = { strict: CedarWriters.json().getStrict(), 'February 2024': CedarWriters.json().getFebruary2024() };
const READERS = { strict: CedarReaders.json().getStrict(), 'February 2024': CedarReaders.json().getFebruary2024() };

const built = (template: string | null): TemplateInstance => {
  const builder = CedarBuilders.templateInstanceBuilder().withSchemaName('I').withDataValue('_note', new InstanceDataStringAtom('a value'));
  if (template !== null) {
    builder.withSchemaIsBasedOn(template);
  }
  return builder.build();
};

describe.each(Object.keys(WRITERS) as (keyof typeof WRITERS)[])('the %s JSON instance writer', (behavior) => {
  const writer = WRITERS[behavior].getTemplateInstanceWriter();

  test('writes the template an instance names', () => {
    expect(writer.getAsJsonNode(built(TEMPLATE))['schema:isBasedOn']).toBe(TEMPLATE);
    expect(JSON.parse(writer.getAsJsonString(built(TEMPLATE)))['schema:isBasedOn']).toBe(TEMPLATE);
  });

  test('refuses a built instance that names no template, as the YAML writer does', () => {
    for (const unnamed of [built(null), built(''), TemplateInstance.buildEmptyWithNullValues()]) {
      expect(unnamed.schema_isBasedOn).toBe(CedarArtifactId.NULL);
      expect(() => writer.getAsJsonNode(unnamed)).toThrow(REFUSAL);
      expect(() => writer.getAsJsonString(unnamed)).toThrow(REFUSAL);
    }
    const unsaved = built(null);
    expect(() => CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getAsYamlString(unsaved)).toThrow(REFUSAL);
  });

  test('refuses an instance read from a document that names no template', () => {
    const document = writer.getAsJsonNode(built(TEMPLATE));
    for (const reader of Object.values(READERS)) {
      const absent: JsonNode = { ...document };
      delete absent['schema:isBasedOn'];
      const nulled: JsonNode = { ...document, 'schema:isBasedOn': null };
      for (const source of [absent, nulled]) {
        const read = reader.getTemplateInstanceReader().readFromObject(source);
        expect(read.parsingResult.wasSuccessful()).toBe(true);
        expect(read.instance.schema_isBasedOn).toBe(CedarArtifactId.NULL);
        expect(() => writer.getAsJsonNode(read.instance)).toThrow(REFUSAL);
      }
    }
    // A compatibility reader takes a legacy empty string as no template.
    const empty = READERS['February 2024'].getTemplateInstanceReader().readFromObject({ ...document, 'schema:isBasedOn': '' });
    expect(empty.instance.schema_isBasedOn).toBe(CedarArtifactId.NULL);
    expect(() => writer.getAsJsonNode(empty.instance)).toThrow(REFUSAL);
  });
});
