import { BiboStatus, CedarBuilders, CedarJsonWriters, CedarWriters, PavVersion, SchemaVersion, TextField } from '../../../../../../src';

describe('TemplateField', () => {
  test('creates empty field null values', () => {
    const cedarTextField: TextField = CedarBuilders.textFieldBuilder().build();
    expect(cedarTextField).not.toBeNull();

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer = writers.getFieldWriterForType(cedarTextField.cedarFieldType);

    const stringified = writer.getAsJsonString(cedarTextField);

    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBeNull();
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/TemplateField');
    expect(backparsed['type']).toBe('object');
    expect(backparsed['title']).toBeNull();
    expect(backparsed['description']).toBeNull();

    expect(backparsed['_ui']).not.toBeNull();
    expect(backparsed['properties']).not.toBeNull();
    expect(backparsed['required']).not.toBeNull();

    expect(backparsed['schema:name']).toBeNull();
    expect(backparsed['schema:description']).toBeNull();

    expect(backparsed['pav:createdOn']).toBeNull();
    expect(backparsed['pav:createdBy']).toBeNull();
    expect(backparsed['pav:lastUpdatedOn']).toBeNull();
    expect(backparsed['oslc:modifiedBy']).toBeNull();

    expect(backparsed['schema:schemaVersion']).toBe(SchemaVersion.CURRENT.getValue());
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe(PavVersion.DEFAULT.getValue());
    expect(backparsed['bibo:status']).toBe(BiboStatus.DRAFT.getJsonValue());
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');
  });
});
