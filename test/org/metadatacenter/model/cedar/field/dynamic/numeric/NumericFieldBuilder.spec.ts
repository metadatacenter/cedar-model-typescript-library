import {
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  ChildDeploymentInfoBuilder,
  IsoDate,
  JsonTemplateElementWriter,
  NumberType,
  NumericField,
  NumericFieldBuilder,
  SchemaVersion,
  TemplateElement,
  TemplateElementBuilder,
} from '../../../../../../../../src';

describe('NumericFieldBuilder', () => {
  test('creates numeric field with builder', () => {
    const builder: NumericFieldBuilder = CedarBuilders.numericFieldBuilder();
    const now = IsoDate.now();
    const field: NumericField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Numeric field title')
      .withDescription('Numeric field description')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withStatus('bibo:published')
      .withSchemaName('Schema name of this template')
      .withSchemaDescription('Schema description of the template')
      .withPreferredLabel('Preferred label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2', 'Alt label 3'])
      .withNumberType(NumberType.FLOAT)
      .withMinValue(1)
      .withMaxValue(100)
      .withDecimalPlace(2)
      .withUnitOfMeasure('cm')
      .build();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Numeric field title');
    expect(backparsed['description']).toBe('Numeric field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('numeric');

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Schema name of this template');
    expect(backparsed['schema:description']).toBe('Schema description of the template');

    expect(backparsed['pav:createdOn']).toBe('2024-03-12T10:03:57-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('0.0.2');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

    expect(backparsed['skos:prefLabel']).toBe('Preferred label');
    expect(backparsed['skos:altLabel']).toStrictEqual(['Alt label 1', 'Alt label 2', 'Alt label 3']);

    expect(backparsed['_valueConstraints']['requiredValue']).toBe(false);

    expect(backparsed['_valueConstraints']['numberType']).toBe('xsd:float');
    expect(backparsed['_valueConstraints']['minValue']).toBe(1);
    expect(backparsed['_valueConstraints']['maxValue']).toBe(100);
    expect(backparsed['_valueConstraints']['decimalPlace']).toBe(2);
    expect(backparsed['_valueConstraints']['unitOfMeasure']).toBe('cm');
  });

  test('creates element with one text area, single-instance', () => {
    const numericFieldBuilder: NumericFieldBuilder = CedarBuilders.numericFieldBuilder();
    const numericField: NumericField = numericFieldBuilder.withTitle('Text area').build();

    const numericFieldDeploymentBuilder: ChildDeploymentInfoBuilder = numericField.createDeploymentBuilder('numeric_field');

    const numericFieldDeployment = numericFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(numericField, numericFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['numeric_field']).not.toBeNull();
    expect(backparsed['properties']['numeric_field']['type']).toBe('object');
    expect(backparsed['properties']['numeric_field']['items']).toBeUndefined();
  });

  test('creates element with one text area, multi-instance', () => {
    const numericFieldBuilder: NumericFieldBuilder = CedarBuilders.numericFieldBuilder();
    const numericField: NumericField = numericFieldBuilder.withTitle('Text field').build();

    const numericFieldDeploymentBuilder: ChildDeploymentInfoBuilder = numericField.createDeploymentBuilder('numeric_field');

    const numericFieldDeployment = numericFieldDeploymentBuilder
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .withMultiInstance(true)
      .withMinItems(2)
      .withMaxItems(10)
      .build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder.addChild(numericField, numericFieldDeployment).build();

    // console.log(TestUtil.d(templateElement.getChildrenInfo().children));

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
    //
    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    // console.log(stringified);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['numeric_field']).not.toBeNull();
    expect(backparsed['properties']['numeric_field']['type']).toBe('array');
    expect(backparsed['properties']['numeric_field']['minItems']).toBe(2);
    expect(backparsed['properties']['numeric_field']['maxItems']).toBe(10);
    expect(backparsed['properties']['numeric_field']['items']).not.toBeNull();
  });
});
