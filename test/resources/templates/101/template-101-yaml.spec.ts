import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-101', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/101', 'template-101.json');
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
id: https://repo.metadatacenter.org/templates/d4660935-6488-46ea-9074-68815f88b271
name: #101 Template with one elements
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-12T12:21:43-07:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-12T12:24:23-07:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - key: #002 Element with three fields
    type: templateElement
    id: https://repo.metadatacenter.org/template-elements/bdb047d1-0713-4ee9-9cf6-c09bb48022f5
    name: #002 Element with three fields
    status: bibo:draft
    version: 0.0.1
    modelVersion: 1.6.0
    createdOn: 2024-03-12T12:24:23-07:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-12T12:24:23-07:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    children:
      - key: Text field
        type: templateField
        id: https://repo.metadatacenter.org/template-fields/fae6da00-d104-4787-bf62-1506a79ce4f8
        name: Text field
        description: Help Text
        modelVersion: 1.6.0
        inputType: textfield
        datatype: xsd:string
        createdOn: 2024-03-12T12:23:36-07:00
        createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
        lastUpdatedOn: 2024-03-12T12:23:36-07:00
        modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
      - key: Email
        type: templateField
        id: https://repo.metadatacenter.org/template-fields/d1da1935-5bb8-4800-92f3-bd1020e551d0
        name: Email
        description: Help Text
        modelVersion: 1.6.0
        inputType: email
        datatype: xsd:string
        createdOn: 2024-03-12T12:23:36-07:00
        createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
        lastUpdatedOn: 2024-03-12T12:23:36-07:00
        modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
      - key: Numeric
        type: templateField
        id: https://repo.metadatacenter.org/template-fields/c200faae-8a7c-40a1-88ea-5d385230f242
        name: Numeric
        description: Help Text
        modelVersion: 1.6.0
        inputType: numeric
        datatype: xsd:decimal
        createdOn: 2024-03-12T12:23:36-07:00
        createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
        lastUpdatedOn: 2024-03-12T12:23:36-07:00
        modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
