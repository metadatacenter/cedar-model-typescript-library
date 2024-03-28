import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-015', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/015', 'template-015.json');
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
id: https://repo.metadatacenter.org/templates/eafa53b5-220f-4480-ab5f-518e9136b88c
name: #015 Complex number
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-06T17:49:03-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-06T17:49:03-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Complex number
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/005c1ca8-0c7f-4114-b647-df9d3af0e35d
    name: Complex number
    description: Help Text
    modelVersion: 1.6.0
    altLabel:
      - Alt label 1
      - Alt label 2
    inputType: numeric
    required: true
    datatype: xsd:decimal
    minValue: 32
    maxValue: 1024
    decimalPlace: 3
    unit: um.
    createdOn: 2024-03-06T17:49:03-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-06T17:49:03-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
