import { CedarBuilders, CedarWriters, ISODate, EmailField, EmailFieldBuilder, SchemaVersion } from '../../../../../../../../src';

describe('EmailFieldBuilder', () => {
  test('creates email field with builder', () => {
    const builder: EmailFieldBuilder = CedarBuilders.emailFieldBuilder();
    const now = ISODate.now();
    const field: EmailField = builder
      .withAtId('https://repo.metadatacenter.org/template-fields/email-field-id')
      .withTitle('Email field title')
      .withDescription('Email field description')
      .withSchemaVersion(SchemaVersion.CURRENT)
      .withCreatedOn('2024-03-12T10:03:57-07:00')
      .withCreatedBy('https://metadatacenter.org/users/creator-id')
      .withLastUpdatedOn(now)
      .withModifiedBy('https://metadatacenter.org/users/modifier-id')
      .withVersion('1.0.0')
      .withBiboStatus('bibo:published')
      .withSchemaName('Email Schema Name')
      .withSchemaDescription('Description of the Email Schema')
      .withPreferredLabel('Email Field')
      .withAlternateLabels(['Email', 'Contact Email'])
      .build();

    const writers: CedarWriters = CedarWriters.getStrict();
    const jsonWriter = writers.getJSONFieldWriterForField(field);

    const stringified = jsonWriter.getAsJsonString(field);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBe('https://repo.metadatacenter.org/template-fields/email-field-id');
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBe('Email field title');
    expect(backparsed['description']).toBe('Email field description');

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['_ui']['inputType']).toBe('email');

    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBe('Email Schema Name');
    expect(backparsed['schema:description']).toBe('Description of the Email Schema');

    expect(backparsed['pav:createdOn']).toBe('2024-03-12T10:03:57-07:00');
    expect(backparsed['pav:createdBy']).toBe('https://metadatacenter.org/users/creator-id');
    expect(backparsed['pav:lastUpdatedOn']).toBe(now.getValue());
    expect(backparsed['oslc:modifiedBy']).toBe('https://metadatacenter.org/users/modifier-id');

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('1.0.0');
    expect(backparsed['bibo:status']).toBe('bibo:published');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

    expect(backparsed['skos:prefLabel']).toBe('Email Field');
    expect(backparsed['skos:altLabel']).toStrictEqual(['Email', 'Contact Email']);

    expect(backparsed['_valueConstraints']).toBeDefined();
    expect(backparsed['_valueConstraints']['requiredValue']).toBe(false);
  });
});
