import { CedarBuilders, CedarReaders, CedarWriters, InstanceDataStringAtom, JsonNode } from '../../../../../src';

/**
 * Which of the two identifiers the emitted document carries at its root.
 *
 * A `TemplateInstance` holds the artifact's identifier as `at_id`, and its data container holds a
 * copy: reading a stored instance fills both, so the two agree and nothing distinguishes them. A
 * built instance is where they part, because `withAtId` sets the artifact's and nothing sets the
 * container's — and the root of the document is the artifact, so `at_id` is what belongs there.
 *
 * This is pinned because it broke: an element occurrence now always carries `@id`, null where it has
 * none, and the pass that writes it walked the root container too, overwriting the artifact's
 * identifier with the container's empty copy. An instance a host had loaded to edit survived — the
 * reader had filled both — while one assembled through the builder came back out with `@id: null`,
 * which a host reads as "not yet created".
 */
const instance = (id: string | null) => {
  const builder = CedarBuilders.templateInstanceBuilder()
    .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/t1')
    .withDataValue('_note', new InstanceDataStringAtom('a value'));
  if (id !== null) {
    builder.withAtId(id);
  }
  return builder.build();
};

const written = (id: string | null): JsonNode =>
  CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instance(id));

describe('the identifier a written instance carries at its root', () => {
  const IRI = 'https://repo.metadatacenter.org/template-instances/edit-abc-123';

  test('is the artifact identifier a builder was given', () => {
    expect(written(IRI)['@id']).toBe(IRI);
  });

  test('is null when the artifact has none, and the key is present either way', () => {
    const document = written(null);

    expect('@id' in document).toBe(true);
    expect(document['@id']).toBeNull();
  });

  test('survives a read, which fills the container copy as well', () => {
    const read = CedarReaders.json().getStrict().getTemplateInstanceReader().readFromObject(written(IRI)).instance;

    expect(read.at_id?.getValue()).toBe(IRI);
    expect(read.dataContainer.id).toBe(IRI);
    expect(CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(read)['@id']).toBe(IRI);
  });
});
