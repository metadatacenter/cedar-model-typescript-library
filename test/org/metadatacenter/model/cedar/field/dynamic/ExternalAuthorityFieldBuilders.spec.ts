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
 * External-authority fields, covered as one matrix.
 *
 * These types differ only in their `_ui.inputType` — same model shape, same
 * deployment behaviour, same verbatim-IRI serialization. Testing them as a
 * table rather than one spec per type keeps the cost of adding the next one at
 * a single row, and makes an inconsistency between them obvious.
 *
 * PubMed, RRID, NIH Grant and DOI are the four added to match the input types
 * CEE already ships lookup services for.
 */
describe('external authority field builders', () => {
  const CASES: Array<[string, () => any, string]> = [
    ['ROR', () => CedarBuilders.extRorFieldBuilder(), 'ext-ror'],
    ['ORCID', () => CedarBuilders.extOrcidFieldBuilder(), 'ext-orcid'],
    ['PFAS', () => CedarBuilders.extPfasFieldBuilder(), 'ext-pfas'],
    ['PubMed', () => CedarBuilders.extPubmedFieldBuilder(), 'ext-pubmed'],
    ['RRID', () => CedarBuilders.extRridFieldBuilder(), 'ext-rrid'],
    ['NIH Grant', () => CedarBuilders.extNihGrantIdFieldBuilder(), 'ext-nih-grant-id'],
    ['DOI', () => CedarBuilders.extDoiFieldBuilder(), 'ext-doi'],
  ];

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

  test.each(CASES)('%s builder is reachable from the facade', (_label, make) => {
    expect(make()).not.toBeNull();
  });

  test.each(CASES)('%s serializes with its own inputType', (_label, make, inputType) => {
    const field = make()
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle(`${inputType} title`)
      .withSchemaName(`Schema name of this ${inputType} field`)
      .build();

    const backparsed = writeField(field);

    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['_ui']['inputType']).toBe(inputType);
    expect(backparsed['schema:name']).toBe(`Schema name of this ${inputType} field`);
  });

  test.each(CASES)('%s deploys as a single-instance child', (_label, make) => {
    const backparsed = deployInto(make().withTitle('f').build(), 'the_field', false);
    expect(backparsed['properties']['the_field']['type']).toBe('object');
    expect(backparsed['properties']['the_field']['items']).toBeUndefined();
  });

  test.each(CASES)('%s deploys as a multi-instance child', (_label, make) => {
    const backparsed = deployInto(make().withTitle('f').build(), 'the_field', true);
    expect(backparsed['properties']['the_field']['type']).toBe('array');
    expect(backparsed['properties']['the_field']['minItems']).toBe(2);
    expect(backparsed['properties']['the_field']['maxItems']).toBe(10);
  });

  test('every external authority type has a distinct inputType', () => {
    const seen = CASES.map(([, , inputType]) => inputType);
    expect(new Set(seen).size).toBe(seen.length);
  });

  /**
   * Write an element containing the field, then read it back.
   *
   * This is the test that earns its keep: a type registered in the writer map
   * but not the reader map serializes perfectly and then fails to load. Only a
   * genuine read catches that, so this asserts on the reconstructed field's
   * own `cedarFieldType` rather than re-inspecting the JSON that was written.
   */
  test.each(CASES)('%s survives a write/read round trip', (_label, make, inputType) => {
    const field = make().withTitle('round trip').withSchemaName('round trip').build();
    const elementJson = deployInto(field, 'the_field', false);

    const result = CedarJsonReaders.getStrict().getTemplateElementReader().readFromString(JSON.stringify(elementJson));

    expect(result.parsingResult.wasSuccessful()).toBe(true);

    // A null here means the reader did not reconstruct the field at all —
    // i.e. the type is missing from the reader map.
    const readBack = result.element.getField('the_field');
    expect(readBack).toBeTruthy();
    expect(readBack!.cedarFieldType.getUiInputType().getValue()).toBe(inputType);
  });
});
