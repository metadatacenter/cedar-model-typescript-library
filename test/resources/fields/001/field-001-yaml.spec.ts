import { CedarWriters, JSONFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateFieldWriter - field-001', () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('fields/001', 'field-001.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    const expectedSerialization = `
type: templateField
id: https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf
name: #001 Text Field
description: Text field help text
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
label: Text field preferred
altLabel:
  - alt label1
  - alt label 2
  - alt label 3
inputType: textfield
valueRecommendationEnabled: true
datatype: xsd:string
default: default value
minLength: 10
maxLength: 100
regex: regex
createdOn: 2024-03-12T10:03:57-07:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-12T10:05:02-07:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
annotations:
  - name: https://datacite.com/doi
    type: id
    value: https://doi.org/10.82658/8vc1-abcd
  - name: foo
    type: value
    value: bar
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
