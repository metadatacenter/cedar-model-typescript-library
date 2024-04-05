import {
  BiboStatus,
  CedarBuilders,
  CedarJsonWriters,
  CedarWriters,
  IsoDate,
  JsonTemplateElementWriter,
  SchemaVersion,
  TemplateElement,
  TemplateElementBuilder,
  TextField,
  TextFieldBuilder,
} from '../../../../../../src';

describe('TemplateElement', () => {
  test('creates element with one field', () => {
    const now = IsoDate.now();
    const textFieldBuilder: TextFieldBuilder = CedarBuilders.textFieldBuilder();
    const textField: TextField = textFieldBuilder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Text field title')
      .withDescription('Text field description')
      .withSchemaName('Schema name of this text field')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withBiboStatus('bibo:published')
      .withPreferredLabel('Preferred label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2', 'Alt label 3'])
      .withDefaultValue('default')
      .withMinLength(10)
      .withMaxLength(100)
      .withRegex('regex')
      .withValueRecommendationEnabled(true)
      .build();

    const textFieldDeploymentBuilder = CedarBuilders.childDeploymentBuilder(textField, '_text_field')
      .withIri('https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde')
      .withLabel('Text field property label')
      .withDescription('Text field property description')
      .withMultiInstance(true)
      .withMinItems(0)
      .withMaxItems(123)
      .withRequiredValue(true)
      .withHidden(true);

    const textFieldDeployment = textFieldDeploymentBuilder.build();

    const templateElementBuilder: TemplateElementBuilder = CedarBuilders.templateElementBuilder();
    const templateElement: TemplateElement = templateElementBuilder
      .withAtId('https://repo.metadatacenter.org/template-elements/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withTitle('Template element title')
      .withDescription('Template element description')
      .withSchemaName('Schema name of this template element')
      .withSchemaDescription('Schema description of the template element')
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now.getValue())
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withBiboStatus(BiboStatus.PUBLISHED)
      .addChild(textField, textFieldDeployment)
      .build();

    //TestUtil.p(template);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();

    const stringified = JSON.stringify(writer.getAsJsonNode(templateElement), null, 2);
    const backparsed = JSON.parse(stringified);
    // TestUtil.p(backparsed);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-elements/f38b5ef4-a078-4d82-90c0-a9a721ad5999');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateElement');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Template element title');
    expect(backparsed['description']).toBe('Template element description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['order']).toStrictEqual(['_text_field']);
    expect(backparsed['_ui']['propertyLabels']).toStrictEqual({
      _text_field: 'Text field property label',
    });
    expect(backparsed['_ui']['propertyDescriptions']).toStrictEqual({
      _text_field: 'Text field property description',
    });

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['properties']['_text_field']).not.toBeNull();
    expect(backparsed['properties']['_text_field']['type']).toBe('array');
    expect(backparsed['properties']['_text_field']['minItems']).toBe(0);
    expect(backparsed['properties']['_text_field']['maxItems']).toBe(123);
    expect(backparsed['properties']['_text_field']['items']).not.toBeNull();

    expect(backparsed['properties']['_text_field']['items']['_ui']['inputType']).toBe('textfield');
    expect(backparsed['properties']['_text_field']['items']['_ui']['hidden']).toBe(true);
    expect(backparsed['properties']['_text_field']['items']['_ui']['valueRecommendationEnabled']).toBe(true);

    expect(backparsed['properties']['_text_field']['items']['_valueConstraints']['requiredValue']).toBe(true);
    expect(backparsed['properties']['_text_field']['items']['_valueConstraints']['defaultValue']).toBe('default');
    expect(backparsed['properties']['_text_field']['items']['_valueConstraints']['minLength']).toBe(10);
    expect(backparsed['properties']['_text_field']['items']['_valueConstraints']['maxLength']).toBe(100);
    expect(backparsed['properties']['_text_field']['items']['_valueConstraints']['regex']).toBe('regex');

    expect(backparsed['properties']['_text_field']['items']['@id']).toBe(
      'https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf',
    );
    expect(backparsed['required']).toStrictEqual(['@context', '@id', '_text_field']);

    expect(backparsed['schema:name']).toBe('Schema name of this template element');
    expect(backparsed['schema:description']).toBe('Schema description of the template element');

    expect(backparsed['pav:createdOn']).toBe('2024-03-12T10:03:57-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('0.0.2');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');
  });
});
