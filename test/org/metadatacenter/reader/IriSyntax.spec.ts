import { CedarBuilders, CedarReaders, CedarWriters, Iri, IriSyntax } from '../../../../src';

/**
 * IriSyntax answers as the readers do: a value it calls valid is read as a link's default, and one it
 * calls invalid is refused there.
 */
const values = [
  'https://example.org/item',
  'urn:example:item',
  'https://例え.jp/項目',
  'relative/path',
  'not an iri',
  'https://exa mple.org/x',
  'https://example.org/%ZZ',
  'https://example.org/<x>',
  'https://example.org/\\x',
  '\nhttps://example.org/x',
  'https://example.org/a#b#c',
  'https://example.org/ x',
  'https://example.org/\ud800',
];

describe('IriSyntax', () => {
  const link = CedarBuilders.linkFieldBuilder()
    .withSchemaName('link')
    .withSchemaDescription('link')
    .withDefaultValue(new Iri('https://example.org/placeholder'))
    .build();
  const source = CedarWriters.json().getStrict().getFieldWriterForField(link).getAsJsonNode(link) as any;

  test.each(values)('answers for %j as the reader of a link default does', (value) => {
    const document = { ...source, _valueConstraints: { ...source._valueConstraints, defaultValue: value } };
    let read = true;
    try {
      CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(document);
    } catch {
      read = false;
    }
    expect(IriSyntax.isValid(value)).toBe(read);
  });

  test('calls an empty string absence rather than an IRI', () => {
    expect(IriSyntax.isValid('')).toBe(false);
  });
});
