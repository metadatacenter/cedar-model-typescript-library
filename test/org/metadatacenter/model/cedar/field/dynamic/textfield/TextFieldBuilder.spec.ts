import {
  CedarBuilders,
  CedarJSONWriters,
  CedarWriters,
  ISODate,
  SchemaVersion,
  TextField,
  TextFieldBuilder,
} from '../../../../../../../../src';

describe('TextFieldBuilder', () => {
  test('creates text field with builder', () => {
    const builder: TextFieldBuilder = CedarBuilders.textFieldBuilder();
    const now = ISODate.now();
    const field: TextField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf')
      .withTitle('Text field title')
      .withDescription('Text field description')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c99')
      .withVersion('0.0.2')
      .withBiboStatus('bibo:published')
      .withSchemaName('Schema nam of this template')
      .withSchemaDescription('Schema description of the template')
      .withPreferredLabel('Preferred label')
      .withAlternateLabels(['Alt label 1', 'Alt label 2', 'Alt label 3'])
      .withDefaultValue('default')
      .withMinLength(10)
      .withMaxLength(100)
      .withRegex('regex')
      .withValueRecommendationEnabled(true)
      .build();

    const writers: CedarJSONWriters = CedarWriters.json().getStrict();
    const jsonWriter = writers.getJSONFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Text field title');
    expect(backparsed['description']).toBe('Text field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('textfield');
    expect(backparsed['_ui']['valueRecommendationEnabled']).toBe(true);

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Schema nam of this template');
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
    expect(backparsed['_valueConstraints']['regex']).toBe('regex');
    expect(backparsed['_valueConstraints']['defaultValue']).toBe('default');
    expect(backparsed['_valueConstraints']['minLength']).toBe(10);
    expect(backparsed['_valueConstraints']['maxLength']).toBe(100);
  });
});
