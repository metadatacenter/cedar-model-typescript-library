import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-008', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/008', 'template-008.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter: YAMLTemplateWriter = writers.getYAMLTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
    console.log(stringified);
    const expectedSerialization = `
type: template
id: https://repo.metadatacenter.org/templates/725246e2-346e-4d34-be49-43c110a30a7b
name: Template with Text Field 1
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-01T13:44:25-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-01T13:44:25-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - type: templateField
    id: https://repo.metadatacenter.org/template-fields/e8a18dda-c0ba-443a-9fb9-18fa3f08c7bc
    name: Text Field 1
    description: Help text for this field
    status: bibo:draft
    version: 0.0.1
    modelVersion: 1.6.0
    label: Preferred label value
    altLabel:
      - Alternate label 1
      - Alternate label 2
    inputType: textfield
    valueRecommendationEnabled: true
    datatype: xsd:string
    default: Default Value
    minLength: 10
    maxLength: 100
    regex: ^[A-Z][^A-Z]*$
    createdOn: 2024-03-01T13:44:25-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-01T13:44:25-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
