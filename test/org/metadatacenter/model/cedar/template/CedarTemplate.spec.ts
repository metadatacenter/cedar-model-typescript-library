import { Template } from '../../../../../../src/org/metadatacenter/model/cedar/template/Template';
import { CedarWriters } from '../../../../../../src/org/metadatacenter/io/writer/CedarWriters';
import { JSONTemplateWriter } from '../../../../../../src/org/metadatacenter/io/writer/JSONTemplateWriter';

describe('CedarTemplate', () => {
  test('creates empty with null values', () => {
    const cedarTemplate = Template.buildEmptyWithNullValues();
    expect(cedarTemplate).not.toBeNull();

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const stringified = JSON.stringify(writer.getAsJsonNode(cedarTemplate), null, 2);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBeNull();
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/Template');
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

  test('creates empty with default values', () => {
    const cedarTemplate = Template.buildEmptyWithDefaultValues();
    expect(cedarTemplate).not.toBeNull();

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const stringified = writer.getAsJsonString(cedarTemplate);
    const backparsed = JSON.parse(stringified);

    expect(backparsed['@id']).toBeNull();
    expect(backparsed['@type']).toBe('https://schema.metadatacenter.org/core/Template');
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

    expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
    expect(backparsed['additionalProperties']).toBe(false);

    expect(backparsed['pav:version']).toBe('0.0.1');
    expect(backparsed['bibo:status']).toBe('bibo:draft');
    expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');
  });

  test('creates empty with default values', () => {
    const cedarTemplate = Template.buildEmptyWithDefaultValues();
    expect(cedarTemplate).not.toBeNull();

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();
    expect(writer.getAsJsonString(cedarTemplate)).not.toBeNull();
  });
});
