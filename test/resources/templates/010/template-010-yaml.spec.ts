import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-010', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/010', 'template-010.json');
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
id: https://repo.metadatacenter.org/templates/d58504c7-6926-4b12-a42e-776f99c7df60
name: #010 Template with DateTime field
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-06T10:55:26-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-06T14:35:02-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: Simple date
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/d44a1d82-5457-4dce-95f9-0400c7b4cb80
    name: Simple date
    description: Help text
    modelVersion: 1.6.0
    label: Simple date preferred
    inputType: temporal
    granularity: day
    datatype: xsd:date
    createdOn: 2024-03-06T14:35:02-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-06T14:35:02-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - key: Simple time
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/40db78e1-834d-46f8-92c3-d8a57571bf0a
    name: Simple time
    description: Help Text
    modelVersion: 1.6.0
    label: Simple time preferred
    inputType: temporal
    timeZone: true
    timeFormat: 12h
    granularity: second
    datatype: xsd:time
    createdOn: 2024-03-06T14:35:02-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-06T14:35:02-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - key: Complex datetime
    multiple: true
    minItems: 1
    type: templateField
    id: https://repo.metadatacenter.org/template-fields/2d2a43fc-c599-4852-a996-333a1b998a6f
    name: Complex datetime
    description: Help Text 2
    modelVersion: 1.6.0
    label: Complex datetime preferred
    altLabel:
      - Alt label 1
      - Alt label 2
    inputType: temporal
    timeZone: true
    timeFormat: 12h
    granularity: decimalSecond
    required: true
    datatype: xsd:dateTime
    createdOn: 2024-03-06T14:35:02-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-06T14:35:02-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
