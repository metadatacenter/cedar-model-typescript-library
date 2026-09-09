import { CedarBuilders, CedarReaders, CedarWriters, CedarArtifactId, Language, Annotations, AnnotationAtValue } from '../src';

for (const build of [
  CedarBuilders.imageFieldBuilder,
  CedarBuilders.youtubeFieldBuilder,
  CedarBuilders.richTextFieldBuilder,
  CedarBuilders.sectionBreakFieldBuilder,
  CedarBuilders.pageBreakFieldBuilder,
]) {
  test(`${build.name} retains complete static field metadata in JSON`, () => {
    const field = build().withSchemaName('Static field').withSchemaIdentifier('identifier').build();
    field.language = Language.forValue('fr');
    field.pav_derivedFrom = CedarArtifactId.forValue('https://example.org/source');
    field.pav_previousVersion = CedarArtifactId.forValue('https://example.org/previous');
    field.annotations = new Annotations();
    field.annotations.add(new AnnotationAtValue('note', 'Preserved'));
    const writer = CedarWriters.json().getStrict().getFieldWriterForField(field);
    const json = writer.getAsJsonNode(field);
    expect(json['schema:identifier']).toBe('identifier');
    expect(json['pav:derivedFrom']).toBe('https://example.org/source');
    expect(json['pav:previousVersion']).toBe('https://example.org/previous');
    expect(json['@context']).toMatchObject({ '@language': 'fr' });
    expect(json['_annotations']).toEqual({ note: { '@value': 'Preserved' } });
    const restored = CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(json).field;
    expect(writer.getAsJsonNode(restored)).toEqual(json);
    const plain = build().withSchemaName('Plain').build();
    expect(writer.getAsJsonNode(plain)['@context']).not.toHaveProperty('@language');
  });
}
