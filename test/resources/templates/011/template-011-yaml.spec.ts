import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-011', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/011', 'template-011.json');
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
id: https://repo.metadatacenter.org/templates/71ab8aa7-84fb-4f42-a863-25ae82146fca
name: #11 Template with multi field with pref and alt labels
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-06T12:46:44-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-06T12:46:44-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: TextField1
    multiple: true
    minItems: 0
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/372bc0d4-3ca4-46b6-b09b-04d4df12a0e1
    name: TextField1
    description: Help Text
    modelVersion: 1.6.0
    label: TextField 1 preferred label
    altLabel:
      - TextField1 Alt1
      - TextField1 Alt2
    inputType: textfield
    datatype: xsd:string
    createdOn: 2024-03-06T12:46:44-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-06T12:46:44-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
