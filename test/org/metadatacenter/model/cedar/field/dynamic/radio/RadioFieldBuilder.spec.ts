import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  IsoDate,
  JsonTemplateElementWriter,
  RadioField,
  RadioFieldBuilder,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';

describe('RadioFieldBuilder', () => {
  test('creates radio field with builder', () => {
    const builder: RadioFieldBuilder = CedarBuilders.radioFieldBuilder();
    const now = IsoDate.now();
    const field: RadioField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('List field title')
      .withDescription('List field description')
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('1.0.0')
      .withStatus('bibo:published')
      .withSchemaName('List Schema Name')
      .withSchemaDescription('Description of the List Schema')
      .withPreferredLabel('List Field')
      .withAlternateLabels(['List', 'List 2'])
      .addRadioOption('option 1', true)
      .addRadioOption('option 2')
      .addRadioOption('option 3', true)
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('List field title');
    expect(backparsed['description']).toBe('List field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('radio');

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('List Schema Name');
    expect(backparsed['schema:description']).toBe('Description of the List Schema');

    expect(backparsed['pav:createdOn']).toBe('2024-03-12T10:03:57-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('1.0.0');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

    expect(backparsed['skos:prefLabel']).toBe('List Field');
    expect(backparsed['skos:altLabel']).toStrictEqual(['List', 'List 2']);

    expect(backparsed['_valueConstraints']).toBeDefined();
    expect(backparsed['_valueConstraints']['multipleChoice']).toBe(false);
    expect(backparsed['_valueConstraints']['literals']).toBeDefined();

    expect(backparsed['_valueConstraints']['literals']).toStrictEqual([
      { label: 'option 1' },
      { label: 'option 2' },
      { label: 'option 3', selectedByDefault: true },
    ]);
  });

  test('creates element with one radio field', () => {
    const radioFieldBuilder: RadioFieldBuilder = CedarBuilders.radioFieldBuilder();
    const radioField: RadioField = radioFieldBuilder.withTitle('Radio field').build();

    const radioFieldDeploymentBuilder = radioField.createDeploymentBuilder('radio_field');

    const radioFieldDeployment = radioFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(radioField, radioFieldDeployment).build();

    // TestUtil.p(templateElement);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['radio_field']).not.toBeNull();
    expect(backparsed['properties']['radio_field']['type']).toBe('object');
    expect(backparsed['properties']['radio_field']['items']).toBeUndefined();
  });
});
