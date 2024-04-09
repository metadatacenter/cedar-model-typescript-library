import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoBuilder,
  IsoDate,
  JsonTemplateElementWriter,
  TemplateElement,
  TemplateElementBuilder,
  TemporalField,
  TemporalFieldBuilder,
  TemporalGranularity,
  TemporalType,
  TimeFormat,
} from '../../../../../../../../src';

describe('TemporalFieldBuilder', () => {
  test('creates temporal field with builder', () => {
    const builder: TemporalFieldBuilder = CedarBuilders.temporalFieldBuilder();
    const now = IsoDate.now();
    const field: TemporalField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Temporal field title')
      .withDescription('Temporal field description')
      .withCreatedOn('2024-03-14T10:05:00-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withStatus('bibo:published')
      .withSchemaName('Temporal Schema Name')
      .withSchemaDescription('Temporal Schema Description')
      .withPreferredLabel('Temporal Preferred Label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2'])
      .withTimezoneEnabled(true)
      .withInputTimeFormat(TimeFormat.H12)
      .withTemporalGranularity(TemporalGranularity.DECIMAL_SECOND)
      .withTemporalType(TemporalType.DATETIME)
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Temporal field title');
    expect(backparsed['description']).toBe('Temporal field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('temporal');
    expect(backparsed['_ui']['timezoneEnabled']).toBe(true);
    expect(backparsed['_ui']['inputTimeFormat']).toBe('12h');
    expect(backparsed['_ui']['temporalGranularity']).toBe('decimalSecond');

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Temporal Schema Name');
    expect(backparsed['schema:description']).toBe('Temporal Schema Description');

    expect(backparsed['pav:createdOn']).toBe('2024-03-14T10:05:00-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('0.0.2');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

    expect(backparsed['skos:prefLabel']).toBe('Temporal Preferred Label');
    expect(backparsed['skos:altLabel']).toStrictEqual(['Alt label 1', 'Alt label 2']);

    expect(backparsed['_valueConstraints']['requiredValue']).toBe(false);
    expect(backparsed['_valueConstraints']['temporalType']).toBe('xsd:dateTime');
    expect(backparsed['_valueConstraints']['defaultValue']).toBeUndefined();
  });

  test('creates element with one temporal field, single-instance', () => {
    const temporalFieldBuilder: TemporalFieldBuilder = CedarBuilders.temporalFieldBuilder();
    const temporalField: TemporalField = temporalFieldBuilder.withTitle('Text area').build();

    const temporalFieldDeploymentBuilder: ChildDeploymentInfoBuilder = temporalField.createDeploymentBuilder('temporal_field');

    const temporalFieldDeployment = temporalFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(temporalField, temporalFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['temporal_field']).not.toBeNull();
    expect(backparsed['properties']['temporal_field']['type']).toBe('object');
    expect(backparsed['properties']['temporal_field']['items']).toBeUndefined();
  });

  test('creates element with one temporal field, multi-instance', () => {
    const temporalFieldBuilder: TemporalFieldBuilder = CedarBuilders.temporalFieldBuilder();
    const temporalField: TemporalField = temporalFieldBuilder.withTitle('Text field').build();

    const temporalFieldDeploymentBuilder: ChildDeploymentInfoBuilder = temporalField.createDeploymentBuilder('temporal_field');

    const temporalFieldDeployment = temporalFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .withMultiInstance(true)
      .withMinItems(2)
      .withMaxItems(10)
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(temporalField, temporalFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['temporal_field']).not.toBeNull();
    expect(backparsed['properties']['temporal_field']['type']).toBe('array');
    expect(backparsed['properties']['temporal_field']['minItems']).toBe(2);
    expect(backparsed['properties']['temporal_field']['maxItems']).toBe(10);
    expect(backparsed['properties']['temporal_field']['items']).not.toBeNull();
  });
});
