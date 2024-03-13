import { CedarTextField } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/textfield/CedarTextField';
import { CedarWriters, JSONFieldWriter } from '../../../../../../src';

describe('CedarField', () => {
  test('creates empty field null values', () => {
    const cedarTextField = CedarTextField.buildEmptyWithNullValues();
    expect(cedarTextField).not.toBeNull();

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONFieldWriter = writers.getJSONFieldWriterForType(cedarTextField.cedarFieldType);

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

    expect(backparsed['schema:schemaVersion']).toBeNull();
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBeUndefined();
    expect(backparsed['bibo:status']).toBeUndefined();
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');
  });
});
