import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-012', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/012', 'template-012.json');
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
id: https://repo.metadatacenter.org/templates/64817890-6984-4cea-93b0-d97d60f81232
name: #012 Template with Email field
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-06T16:14:19-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-06T16:14:19-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Email field
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/4cb127ae-2f02-4bb2-8a21-01dcde965066
    name: Email field
    description: Email field help text
    modelVersion: 1.6.0
    label: Email field preferred
    inputType: email
    datatype: xsd:string
    required: true
    createdOn: 2024-03-06T16:14:19-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-06T16:14:19-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
