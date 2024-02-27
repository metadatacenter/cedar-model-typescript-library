import { CedarTemplate } from './CedarTemplate';

test('creates empty template', () => {
  const cedarTemplate = new CedarTemplate();
  expect(cedarTemplate).not.toBeNull();
  const stringified = JSON.stringify(cedarTemplate, null, 2);
  const backparsed = JSON.parse(stringified);

  expect(backparsed['$schema']).toBe('http://json-schema.org/draft-04/schema#');

  expect(backparsed['@id']).toBeNull();
  expect(backparsed['type']).toBe('object');
  expect(backparsed['title']).toBeNull();
  expect(backparsed['description']).toBeNull();

  expect(backparsed['schema:name']).toBeNull();
  expect(backparsed['schema:description']).toBeNull();

  expect(backparsed['pav:createdOn']).toBeNull();
  expect(backparsed['pav:createdBy']).toBeNull();
  expect(backparsed['pav:lastUpdatedOn']).toBeNull();
  expect(backparsed['oslc:modifiedBy']).toBeNull();

  expect(backparsed['schema:schemaVersion']).toBe('1.6.0');
  expect(backparsed['additionalProperties']).toBe(false);

  expect(backparsed['pav:version']).toBeNull();
  expect(backparsed['bibo:status']).toBeNull();
});
