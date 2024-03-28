import { CedarWriters, JSONFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateFieldWriter - field-004', () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('fields/004', 'field-004.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    const expectedSerialization = `
type: templateField
id: https://repo.metadatacenter.org/template-fields/de2525eb-3b58-4aaf-9f99-5bd140145303
identifier: subject_identifier_scheme
name: Subject Identifier Scheme
description: The name of the scheme or authority used for the Subject Identifier.
status: bibo:draft
version: 0.9.1
modelVersion: 1.6.0
label: Subject Identifier Scheme
inputType: textfield
datatype: xsd:string
createdOn: 2022-10-13T12:44:16-07:00
createdBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014
lastUpdatedOn: 2022-10-13T12:44:16-07:00
modifiedBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014
derivedFrom: ""
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
