import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoBuilder,
  IsoDate,
  JsonTemplateElementWriter,
  LinkField,
  LinkFieldBuilder,
  SchemaVersion,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';

describe('LinkFieldBuilder', () => {
  test('creates link field with builder', () => {
    const builder: LinkFieldBuilder = CedarBuilders.linkFieldBuilder();
    const now = IsoDate.now();
    const field: LinkField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Link field title')
      .withDescription('Link field description')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('1.0.0')
      .withStatus('bibo:published')
      .withSchemaName('Link Schema Name')
      .withSchemaDescription('Description of the Link Schema')
      .withPreferredLabel('Link Field')
      .withAlternateLabels(['Link', 'Link 2'])
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Link field title');
    expect(backparsed['description']).toBe('Link field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('link');

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Link Schema Name');
    expect(backparsed['schema:description']).toBe('Description of the Link Schema');

    expect(backparsed['pav:createdOn']).toBe('2024-03-12T10:03:57-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('1.0.0');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

    expect(backparsed['skos:prefLabel']).toBe('Link Field');
    expect(backparsed['skos:altLabel']).toStrictEqual(['Link', 'Link 2']);

    expect(backparsed['_valueConstraints']).toBeDefined();
    expect(backparsed['_valueConstraints']['requiredValue']).toBe(false);
  });

  test('creates element with one link field, single-instance', () => {
    const linkFieldBuilder: LinkFieldBuilder = CedarBuilders.linkFieldBuilder();
    const linkField: LinkField = linkFieldBuilder.withTitle('Text area').build();

    const linkFieldDeploymentBuilder: ChildDeploymentInfoBuilder = linkField.createDeploymentBuilder('link_field');

    const linkFieldDeployment = linkFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(linkField, linkFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['link_field']).not.toBeNull();
    expect(backparsed['properties']['link_field']['type']).toBe('object');
    expect(backparsed['properties']['link_field']['items']).toBeUndefined();
  });

  test('creates element with one link field, multi-instance', () => {
    const linkFieldBuilder: LinkFieldBuilder = CedarBuilders.linkFieldBuilder();
    const linkField: LinkField = linkFieldBuilder.withTitle('Text field').build();

    const linkFieldDeploymentBuilder: ChildDeploymentInfoBuilder = linkField.createDeploymentBuilder('link_field');

    const linkFieldDeployment = linkFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .withMultiInstance(true)
      .withMinItems(2)
      .withMaxItems(10)
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(linkField, linkFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['link_field']).not.toBeNull();
    expect(backparsed['properties']['link_field']['type']).toBe('array');
    expect(backparsed['properties']['link_field']['minItems']).toBe(2);
    expect(backparsed['properties']['link_field']['maxItems']).toBe(10);
    expect(backparsed['properties']['link_field']['items']).not.toBeNull();
  });
});
