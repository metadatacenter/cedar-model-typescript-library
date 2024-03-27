import { CedarWriters, JSONFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateFieldWriter - field-001', () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('fields/001', 'field-001.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    expect(stringified.length).toBe(836);
    // TODO: YAML: Discuss annotations serialization syntax vs java library
    // TODO: YAML: discuss type serialization
    expect(stringified).toContain('type: templateField');
    expect(stringified).toContain('id: https://repo.metadatacenter.org/template-fields/f38b5ef4-a078-4d82-90c0-a9a721ad5ecf');
    expect(stringified).toContain('name: #001 Text Field');
    expect(stringified).toContain('description: Text field help text');
    expect(stringified).toContain('status: bibo:draft');
    expect(stringified).toContain('version: 0.0.1');
    expect(stringified).toContain('modelVersion: 1.6.0');
    expect(stringified).toContain('label: Text field preferred');
    expect(stringified).toContain('altLabel:');
    expect(stringified).toContain('  - alt label1');
    expect(stringified).toContain('  - alt label 2');
    expect(stringified).toContain('  - alt label 3');
    expect(stringified).toContain('inputType: textfield');
    expect(stringified).toContain('valueRecommendationEnabled: true');
    expect(stringified).toContain('datatype: xsd:string');
    expect(stringified).toContain('default: default value');
    expect(stringified).toContain('minLength: 10');
    expect(stringified).toContain('maxLength: 100');
    expect(stringified).toContain('regex: regex');
    expect(stringified).toContain('createdOn: 2024-03-12T10:03:57-07:00');
    expect(stringified).toContain('createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(stringified).toContain('lastUpdatedOn: 2024-03-12T10:05:02-07:00');
    expect(stringified).toContain('modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95');
    expect(stringified).toContain('annotations:');
    expect(stringified).toContain('  - name: https://datacite.com/doi');
    expect(stringified).toContain('    type: id');
    expect(stringified).toContain('    value: https://doi.org/10.82658/8vc1-abcd');
    expect(stringified).toContain('  - name: foo');
    expect(stringified).toContain('    type: value');
    expect(stringified).toContain('    value: bar');
  });
});
