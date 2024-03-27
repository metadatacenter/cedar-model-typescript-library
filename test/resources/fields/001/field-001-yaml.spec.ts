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
    expect(stringified.length).toBe(803);
  });
});
