import { CedarWriters, JSONFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateFieldWriter - field-002', () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('fields/002', 'field-002.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    expect(stringified.length).toBe(522);
    expect(stringified).toContain('type: templateField');
    expect(stringified).toContain('id: https://repo.metadatacenter.org/template-fields/a12db879-311a-41d6-91de-595ac45e835a');
    expect(stringified).toContain('name: #002 TextArea name');
    expect(stringified).toContain('description: TextArea help');
    expect(stringified).toContain('status: bibo:draft');
    expect(stringified).toContain('version: 0.0.1');
    expect(stringified).toContain('modelVersion: 1.6.0');
    expect(stringified).toContain('label: TextArea preferred');
    expect(stringified).toContain('inputType: textarea');
    expect(stringified).toContain('datatype: xsd:string');
    expect(stringified).toContain('createdOn: 2024-03-13T18:32:24-07:00');
    expect(stringified).toContain('createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(stringified).toContain('lastUpdatedOn: 2024-03-13T18:32:24-07:00');
    expect(stringified).toContain('modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
  });
});
