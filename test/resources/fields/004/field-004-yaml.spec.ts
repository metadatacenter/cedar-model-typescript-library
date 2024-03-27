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
    expect(stringified.length).toBe(646);
    expect(stringified).toContain('type: templateField');
    expect(stringified).toContain('id: https://repo.metadatacenter.org/template-fields/de2525eb-3b58-4aaf-9f99-5bd140145303');
    expect(stringified).toContain('identifier: subject_identifier_scheme');
    expect(stringified).toContain('name: Subject Identifier Scheme');
    expect(stringified).toContain('description: The name of the scheme or authority used for the Subject Identifier.');
    expect(stringified).toContain('status: bibo:draft');
    expect(stringified).toContain('version: 0.9.1');
    expect(stringified).toContain('modelVersion: 1.6.0');
    expect(stringified).toContain('label: Subject Identifier Scheme');
    expect(stringified).toContain('inputType: textfield');
    expect(stringified).toContain('datatype: xsd:string');
    expect(stringified).toContain('createdOn: 2022-10-13T12:44:16-07:00');
    expect(stringified).toContain('createdBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014');
    expect(stringified).toContain('lastUpdatedOn: 2022-10-13T12:44:16-07:00');
    expect(stringified).toContain('modifiedBy: https://metadatacenter.org/users/819b3cfd-49a9-4e72-b5d5-18166366f014');
    expect(stringified).toContain('derivedFrom: ""');
  });
});
