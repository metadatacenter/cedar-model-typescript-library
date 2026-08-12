import {
  CedarJsonReaders,
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoBuilder,
  JsonTemplateElementWriter,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../src';

/**
 * The boolean field type, authored through the public facade.
 *
 * `boolean` is a v1.6.0 field type — the meta-schema lists it in the field
 * `inputType` enum, and the corpus carries boolean field cases. The model could
 * already read and write the type, but `CedarBuilders` exposed no
 * `booleanFieldBuilder`, so it could not be authored — the same gap the
 * external-authority fields had. This pins that the builder is reachable, that a
 * boolean field serializes with its own inputType, and that it survives a write
 * then read (a type present in the writer map but absent from the reader map
 * would serialize and then fail to reconstruct).
 */
describe('boolean field builder', () => {
  const writeField = (field: any) => {
    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    return JSON.parse(writers.getFieldWriterForField(field).getAsJsonString(field));
  };

  const deployInto = (field: any, name: string, multi: boolean) => {
    let db = (field.createDeploymentBuilder(name) as ChildDeploymentInfoBuilder).withIri(
      'https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde',
    );
    if (multi) {
      db = db.withMultiInstance(true).withMinItems(2).withMaxItems(10);
    }
    const element: TemplateElement = (CedarBuilders.templateElementBuilder() as TemplateElementBuilder).addChild(field, db.build()).build();
    const writer: JsonTemplateElementWriter = CedarWriters.json().getStrict().getTemplateElementWriter();
    return JSON.parse(JSON.stringify(writer.getAsJsonNode(element), null, 2));
  };

  test('is reachable from the facade', () => {
    expect(CedarBuilders.booleanFieldBuilder()).not.toBeNull();
  });

  test('serializes with the boolean inputType', () => {
    const field = CedarBuilders.booleanFieldBuilder()
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('boolean title')
      .withSchemaName('Schema name of this boolean field')
      .build();

    const backparsed = writeField(field);

    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['_ui']['inputType']).toBe('boolean');
    expect(backparsed['schema:name']).toBe('Schema name of this boolean field');
  });

  test('survives a write/read round trip', () => {
    const field = CedarBuilders.booleanFieldBuilder().withTitle('round trip').withSchemaName('round trip').build();
    const elementJson = deployInto(field, 'the_field', false);

    const result = CedarJsonReaders.getStrict().getTemplateElementReader().readFromString(JSON.stringify(elementJson));

    expect(result.parsingResult.wasSuccessful()).toBe(true);

    const readBack = result.element.getField('the_field');
    expect(readBack).toBeTruthy();
    expect(readBack!.cedarFieldType.getUiInputType().getValue()).toBe('boolean');
  });
});
