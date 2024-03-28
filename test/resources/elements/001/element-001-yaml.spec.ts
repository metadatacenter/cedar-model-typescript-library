import { CedarWriters, JSONElementReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateElementWriter - element-001', () => {
  test('read a JSON element, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('elements/001', 'element-001.json');
    const reader: JSONElementReader = JSONElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLTemplateElementWriter();

    const stringified = yamlWriter.getAsYamlString(jsonElementReaderResult.element);
    // console.log(stringified);
    const expectedSerialization = `
type: templateElement
id: https://repo.metadatacenter.org/template-elements/8a57aa93-3a95-41c1-97be-1cc43fba1634
name: #001 Element with attribute-value
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-08T12:32:06-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-08T12:32:06-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Attribute-Value
    multiple: true
    minItems: 0
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/162ab456-e5ec-400c-a713-c46c29adf3b8
    name: Attribute-Value
    description: Help Text
    modelVersion: 1.6.0
    inputType: attribute-value
    createdOn: 2024-03-08T12:32:06-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-08T12:32:06-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
