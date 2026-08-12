import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoBuilder,
  JsonTemplateElementWriter,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';

/**
 * PFAS external-authority field.
 *
 * The field, its impl, and its JSON and YAML readers and writers already
 * existed and were registered in the readers, the writers and `index.ts` —
 * only the `CedarBuilders` facade method was missing, so the type could be
 * read and written but never authored. These tests pin the facade entry and
 * the `ext-pfas` input type that CEE matches on.
 */
describe('ExtPfasFieldBuilder', () => {
  test('is reachable from the CedarBuilders facade', () => {
    expect(typeof CedarBuilders.extPfasFieldBuilder).toBe('function');
    expect(CedarBuilders.extPfasFieldBuilder()).not.toBeNull();
  });

  test('creates a field whose input type is ext-pfas', () => {
    const field = CedarBuilders.extPfasFieldBuilder()
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('PFAS field title')
      .withDescription('PFAS field description')
      .withSchemaName('Schema name of this PFAS field')
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const backparsed = JSON.parse(writers.getFieldWriterForField(field).getAsJsonString(field));

    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['_ui']['inputType']).toBe('ext-pfas');
    expect(backparsed['schema:name']).toBe('Schema name of this PFAS field');
  });

  test('deploys into an element as a single-instance child', () => {
    const field = CedarBuilders.extPfasFieldBuilder().withTitle('PFAS field').build();

    const deployment = (field.createDeploymentBuilder('pfas_field') as ChildDeploymentInfoBuilder)
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const element: TemplateElement = (CedarBuilders.templateElementBuilder() as TemplateElementBuilder).addChild(field, deployment).build();

    const writer: JsonTemplateElementWriter = CedarWriters.json().getStrict().getTemplateElementWriter();
    const backparsed = JSON.parse(JSON.stringify(writer.getAsJsonNode(element), null, 2));

    expect(backparsed['properties']['pfas_field']['type']).toBe('object');
    expect(backparsed['properties']['pfas_field']['items']).toBeUndefined();
  });

  test('deploys into an element as a multi-instance child', () => {
    const field = CedarBuilders.extPfasFieldBuilder().withTitle('PFAS field').build();

    const deployment = (field.createDeploymentBuilder('pfas_field') as ChildDeploymentInfoBuilder)
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .withMultiInstance(true)
      .withMinItems(2)
      .withMaxItems(10)
      .build();

    const element: TemplateElement = (CedarBuilders.templateElementBuilder() as TemplateElementBuilder).addChild(field, deployment).build();

    const writer: JsonTemplateElementWriter = CedarWriters.json().getStrict().getTemplateElementWriter();
    const backparsed = JSON.parse(JSON.stringify(writer.getAsJsonNode(element), null, 2));

    expect(backparsed['properties']['pfas_field']['type']).toBe('array');
    expect(backparsed['properties']['pfas_field']['minItems']).toBe(2);
    expect(backparsed['properties']['pfas_field']['maxItems']).toBe(10);
  });
});
