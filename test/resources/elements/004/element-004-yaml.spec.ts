import { CedarWriters, JSONElementReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateElementWriter - element-004', () => {
  test('read a JSON element, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('elements/004', 'element-004.json');
    const reader: JSONElementReader = JSONElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLTemplateElementWriter();

    const stringified = yamlWriter.getAsYamlString(jsonElementReaderResult.element);
    // console.log(stringified);
    const expectedSerialization = `
type: templateElement
id: https://repo.metadatacenter.net/template-elements/59157574-4b8a-4f45-8ee1-9081c3ab24c8
name: BioSample Descriptor
description: BioSample Descriptor
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2016-09-13T10:27:40-07:00
createdBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
lastUpdatedOn: 2016-09-13T10:32:26-07:00
modifiedBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
children:
  - key: title
    type: templateField
    id: https://repo.metadatacenter.net/template-fields/34f6c221-667d-4255-93a8-dcabe46939d8
    name: Title
    modelVersion: 1.6.0
    inputType: textfield
    datatype: xsd:string
    createdOn: 2016-09-13T10:32:26-07:00
    createdBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
    lastUpdatedOn: 2016-09-13T10:32:26-07:00
    modifiedBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
  - key: description
    type: templateField
    id: https://repo.metadatacenter.net/template-fields/fb9e046f-e9ac-4e54-bc78-2603c9338152
    name: Description
    modelVersion: 1.6.0
    inputType: textfield
    datatype: xsd:string
    createdOn: 2016-09-13T10:32:26-07:00
    createdBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
    lastUpdatedOn: 2016-09-13T10:32:26-07:00
    modifiedBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
  - key: externalLink
    type: templateField
    id: https://repo.metadatacenter.net/template-fields/47d7a72d-e578-4106-8e9b-40a5a6f3ef84
    name: External Link
    modelVersion: 1.6.0
    inputType: textfield
    datatype: xsd:string
    createdOn: 2016-09-13T10:32:26-07:00
    createdBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
    lastUpdatedOn: 2016-09-13T10:32:26-07:00
    modifiedBy: https://repo.metadatacenter.net/users/6d21a887-b704-49a9-922a-aa71632f3232
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
