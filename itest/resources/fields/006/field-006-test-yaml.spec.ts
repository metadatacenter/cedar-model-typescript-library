import { CedarWriters, CedarYamlWriters, JsonTemplateFieldReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.field(6);

describe('YAMLTemplateFieldWriter' + testResource.toString(), () => {
  test('read a JSON field, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const referenceYaml = TestUtil.readReferenceYaml(testResource);
    const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter = writers.getFieldWriterForField(jsonFieldReaderResult.field);

    const stringified = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
    // console.log(stringified);
    expect(stringified).toEqual(referenceYaml);
  });
});
