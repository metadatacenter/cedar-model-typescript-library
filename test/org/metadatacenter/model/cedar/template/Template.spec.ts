import { TestUtil } from '../../../../../TestUtil';
import {
  BiboStatus,
  CedarBuilders,
  CedarWriters,
  ISODate,
  JSONTemplateWriter,
  SchemaVersion,
  Template,
  TemplateBuilder,
  TextField,
  TextFieldBuilder,
} from '../../../../../../src';
import { ChildDeploymentInfo } from '../../../../../../src/org/metadatacenter/model/cedar/deployment/ChildDeploymentInfo';

describe('Template', () => {
  test('creates template with one field', () => {
    const now = ISODate.now();
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

    const textFieldDeployment = new ChildDeploymentInfo('_text_field');
    textFieldDeployment.iri = 'https://schema.metadatacenter.org/properties/fac2de3a-937e-4573-810a-c1653e658cde';
    textFieldDeployment.atType = textField.cedarArtifactType;
    textFieldDeployment.uiInputType = textField.cedarFieldType.getUiInputType();
    textFieldDeployment.requiredValue = true;
    textFieldDeployment.hidden = true;
    textFieldDeployment.label = 'Text field property label';
    textFieldDeployment.description = 'Text field property description';
    textFieldDeployment.multiInstance = true;
    textFieldDeployment.minItems = 0;
    textFieldDeployment.maxItems = 123;

    const templateBuilder: TemplateBuilder = CedarBuilders.templateBuilder();
    const template: Template = templateBuilder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5999')
      .withTitle('Template title')
      .withDescription('Template description')
      .withSchemaName('Schema name of this template')
      .withSchemaDescription('Schema description of the template')
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now.getValue())
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withBiboStatus(BiboStatus.PUBLISHED)
      .addChild(textField, textFieldDeployment)
      .build();

    //TestUtil.p(template);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const stringified = JSON.stringify(writer.getAsJsonNode(template), null, 2);
    const backparsed = JSON.parse(stringified);
    // TestUtil.p(backparsed);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5999');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/Template');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Template title');
    expect(backparsed['description']).toBe('Template description');

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
    expect(backparsed['required']).toStrictEqual([
      '@context',
      '@id',
      'schema:isBasedOn',
      'schema:name',
      'schema:description',
      'pav:createdOn',
      'pav:createdBy',
      'pav:lastUpdatedOn',
      'oslc:modifiedBy',
      '_text_field',
    ]);

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
  });
});