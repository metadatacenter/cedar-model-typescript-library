import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-014', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/014', 'template-014.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter: YAMLTemplateWriter = writers.getYAMLTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
    // console.log(stringified);
    const expectedSerialization = `
type: template
id: https://repo.metadatacenter.org/templates/e08e0c7a-5a0d-46d7-8430-6ced51296e95
name: #014 Template with various numbers
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-06T16:54:29-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-06T16:54:29-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Decimal
    type: templateField
    id: tmp-1709772870674-279341
    name: Decimal
    description: Help Text
    modelVersion: 1.6.0
    inputType: numeric
    datatype: xsd:decimal
  - key: Long
    type: templateField
    id: tmp-1709772896270-304937
    name: Long
    description: Help Text
    modelVersion: 1.6.0
    inputType: numeric
    datatype: xsd:long
  - key: Integer
    type: templateField
    id: tmp-1709772919935-328601
    name: Integer
    description: Help Text
    modelVersion: 1.6.0
    inputType: numeric
    datatype: xsd:int
  - key: Double
    type: templateField
    id: tmp-1709772946038-354705
    name: Double
    description: Help Text
    modelVersion: 1.6.0
    inputType: numeric
    datatype: xsd:double
  - key: Float
    type: templateField
    id: tmp-1709772964268-372935
    name: Float
    description: Help Text
    modelVersion: 1.6.0
    inputType: numeric
    datatype: xsd:float
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
