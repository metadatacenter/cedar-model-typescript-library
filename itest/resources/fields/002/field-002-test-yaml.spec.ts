import { CedarWriters, JSONFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.field(2);

describe('YAMLTemplateFieldWriter' + testResource.toString(), () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const referenceYaml = TestUtil.readReferenceYaml(testResource);
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter = writers.getYAMLFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    expect(stringified).toEqual(referenceYaml);
  });
});
