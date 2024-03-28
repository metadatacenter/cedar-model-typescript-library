import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-021', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/021', 'template-021.json');
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
id: https://repo.metadatacenter.org/templates/af8dff49-a061-491a-8304-2bc7a5308bb3
name: #021 Template with MultipleChoice
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-07T13:51:41-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-07T13:57:16-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Multiple choice with default
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/beda1f11-147e-4e3b-b544-6fe823952382
    name: Multiple choice with default
    description: Help Text
    modelVersion: 1.6.0
    inputType: radio
    datatype: xsd:string
    values:
      - label: Option 1
      - label: Option 2
        selected: true
      - label: Option 3
      - label: Option 4
      - label: Option 5
    createdOn: 2024-03-07T13:57:16-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-07T13:57:16-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - key: Multiple choice without default
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/8a0f2936-94c9-4cab-9a55-05afb4538c0f
    name: Multiple choice without default
    description: Help Text
    modelVersion: 1.6.0
    inputType: radio
    datatype: xsd:string
    required: true
    values:
      - label: Option 1
      - label: Option2
    createdOn: 2024-03-07T13:57:16-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-07T13:57:16-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
