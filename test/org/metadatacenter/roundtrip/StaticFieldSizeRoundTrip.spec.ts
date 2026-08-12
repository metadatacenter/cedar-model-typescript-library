import { CedarArtifactType, CedarReaders, CedarWriters, JsonAbstractArtifactReader } from '../../../../src';

/**
 * `_ui._size` has to survive a document it was not built from.
 *
 * The other specs here build a field with a builder, write it, and read it
 * back. That is a real round trip and it cannot catch this class of bug: a
 * builder can only be asked for properties the model already has, so a property
 * the model does not know about produces an *absent* assertion rather than a
 * failing one. `_ui._size` was read, modelled and written for a YouTube field
 * and silently dropped for an image, and every builder spec passed throughout.
 *
 * The corpus could not catch it either. `_ui._size` on a YouTube field appears
 * in `template-009`, which both this library and the Java one have in their test
 * resources — which is exactly why the cross-library comparison caught Java
 * dropping it there. No test artifact anywhere carries an image *with* a size,
 * so nothing ever asked this question of the image reader.
 *
 * So this starts from source JSON rather than from a builder, and asserts on the
 * key rather than on a getter. Both field types are covered, because the
 * asymmetry between them is the whole story and either one could regress.
 */

const staticField = (inputType: 'image' | 'youtube', content: string, width: number, height: number) => ({
  '@id': 'https://repo.metadatacenter.org/template-fields/8c70d2a8-6571-44b5-9028-7cee1222ab11',
  '@type': 'https://schema.metadatacenter.org/core/StaticTemplateField',
  '@context': {
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    pav: 'http://purl.org/pav/',
    bibo: 'http://purl.org/ontology/bibo/',
    oslc: 'http://open-services.net/ns/core#',
    schema: 'http://schema.org/',
    'schema:name': { '@type': 'xsd:string' },
    'schema:description': { '@type': 'xsd:string' },
    'pav:createdOn': { '@type': 'xsd:dateTime' },
    'pav:createdBy': { '@type': '@id' },
    'pav:lastUpdatedOn': { '@type': 'xsd:dateTime' },
    'oslc:modifiedBy': { '@type': '@id' },
  },
  type: 'object',
  title: `${inputType} field schema`,
  description: `${inputType} field schema`,
  _ui: { inputType, _content: content, _size: { width, height } },
  'schema:name': `A ${inputType}`,
  'schema:description': '',
  'pav:createdOn': '2026-08-06T18:42:20-07:00',
  'pav:createdBy': 'https://metadatacenter.org/users/ab2a9696-291f-4705-b5e6-6c262266c506',
  'pav:lastUpdatedOn': '2026-08-06T18:42:20-07:00',
  'oslc:modifiedBy': 'https://metadatacenter.org/users/ab2a9696-291f-4705-b5e6-6c262266c506',
  'schema:schemaVersion': '1.6.0',
  additionalProperties: false,
  $schema: 'http://json-schema.org/draft-04/schema#',
});

/** Read the document the way a consumer does, write it back, return the result. */
const roundTrip = (source: object): Record<string, never> => {
  const sourceString = JSON.stringify(source);
  const cedarArtifactType: CedarArtifactType = CedarReaders.json().detectArtifactType(sourceString);
  const reader: JsonAbstractArtifactReader = CedarReaders.json().getStrict().getReaderForArtifactType(cedarArtifactType);
  const artifact = reader.readFromString(sourceString).artifact;
  const writer = CedarWriters.json().getStrict().getWriterForArtifact(artifact);
  return JSON.parse(writer.getAsJsonString(artifact));
};

describe('_ui._size on a static field', () => {
  test('survives a round trip on an image', () => {
    const written = roundTrip(staticField('image', 'https://cedar.metadatacenter.org/img/cedar-logo.png', 300, 200));
    expect(written['_ui']).toBeDefined();
    expect(written['_ui']['_size']).toBeDefined();
    expect(written['_ui']['_size']['width']).toBe(300);
    expect(written['_ui']['_size']['height']).toBe(200);
  });

  test('survives a round trip on a video', () => {
    const written = roundTrip(staticField('youtube', 'dQw4w9WgXcQ', 400, 300));
    expect(written['_ui']).toBeDefined();
    expect(written['_ui']['_size']).toBeDefined();
    expect(written['_ui']['_size']['width']).toBe(400);
    expect(written['_ui']['_size']['height']).toBe(300);
  });

  /** A field with no size must not gain an empty `_size`, which would be the opposite fault. */
  test('is absent from the output when the source has none', () => {
    const source = staticField('image', 'https://cedar.metadatacenter.org/img/cedar-logo.png', 300, 200);
    delete (source._ui as { _size?: unknown })._size;
    expect(roundTrip(source)['_ui']['_size']).toBeUndefined();
  });
});
