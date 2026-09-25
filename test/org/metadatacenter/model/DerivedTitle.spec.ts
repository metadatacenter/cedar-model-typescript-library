import { CedarBuilders, CedarReaders, CedarWriters } from '../../../../src';
import { internalNameFor } from '../../../../src/org/metadatacenter/model/cedar/AbstractSchemaArtifact';

/**
 * A schema artifact's `title` is composed from its name, not read from the document.
 *
 * It names the JSON Schema constraining instances of the artifact and says nothing an author
 * decided: an artifact called Study has a template schema called "Study template schema" and there
 * is nothing else it could be called. The JSON reader used to keep whatever a document supplied
 * while the YAML reader composed, so one artifact was read two ways depending on the format it
 * arrived in. The Java library composes the identical string.
 *
 * `description` is not derived. An author writes it and a custom one survives every trip.
 */
describe('a schema artifact title', () => {
  const writers = CedarWriters.json().getStrict();
  const readers = CedarReaders.json().getStrict();

  it('is composed from the name, whatever the document supplies', () => {
    const field = CedarBuilders.textFieldBuilder()
      .withSchemaName('Alias')
      .withSchemaDescription('Alias help')
      .withTitle('Something an author typed')
      .build();
    const json = writers.getFieldWriterForField(field).getAsJsonNode(field);

    const read = readers.getTemplateFieldReader().readFromObject(json).field;

    expect(read.title).toBe('Alias field schema');
    expect(read.schema_description).toBe('Alias help');
  });

  it('is already on an artifact that was built rather than read', () => {
    const field = CedarBuilders.textFieldBuilder().withSchemaName('Alias').build();
    expect(field.title).toBe('Alias field schema');
  });

  it('survives a write, a read and a write unchanged', () => {
    const field = CedarBuilders.textFieldBuilder().withSchemaName('Alias').build();
    const writer = writers.getFieldWriterForField(field);
    const once = writer.getAsJsonNode(field);
    const twice = writer.getAsJsonNode(readers.getTemplateFieldReader().readFromObject(once).field);
    expect(twice).toEqual(once);
  });

  it('names the kind the artifact is', () => {
    expect(internalNameFor('Study', 'template')).toBe('Study template schema');
    expect(internalNameFor('Address', 'element')).toBe('Address element schema');
    expect(internalNameFor('Alias', 'field')).toBe('Alias field schema');
  });
});
