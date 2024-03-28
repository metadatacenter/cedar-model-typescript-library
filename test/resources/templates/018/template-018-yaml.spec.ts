import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-018', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/018', 'template-018.json');
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
id: https://repo.metadatacenter.org/templates/cb92ca40-3717-4533-93c4-5efee2aed2fd
name: #018 Template with checkbox
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-07T13:30:30-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-07T20:58:30-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: My checkbox 1
    multiple: true
    minItems: 1
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/bc68d373-562f-4725-9e67-433999363deb
    name: My checkbox 1
    description: Help Text
    modelVersion: 1.6.0
    label: Required checkbox
    inputType: checkbox
    datatype: xsd:string
    required: true
    multipleChoice: true
    values:
      - label: Option 1
      - label: Option 2
        selected: true
      - label: Option 3
        selected: true
      - label: Option 4
    createdOn: 2024-03-07T20:58:30-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-07T20:58:30-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - key: My checkbox 2
    multiple: true
    minItems: 1
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/bd25e554-c588-48ce-824f-8383cd3eafcc
    name: My checkbox 2
    description: Help Text
    modelVersion: 1.6.0
    label: Non-required checkbox
    inputType: checkbox
    datatype: xsd:string
    multipleChoice: true
    values:
      - label: Radio 1
      - label: Radio 2
      - label: Radio 3
    createdOn: 2024-03-07T20:58:30-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-07T20:58:30-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
