import { CedarWriters, CedarYAMLWriters, JSONTemplateElementReader } from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.element(3);

describe('YAMLTemplateElementWriter' + testResource.toString(), () => {
  test('read a JSON element, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const referenceYaml = TestUtil.readReferenceYaml(testResource);
    const reader: JSONTemplateElementReader = JSONTemplateElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYAMLWriters = CedarWriters.yaml().getStrict();
    const yamlWriter = writers.getYAMLTemplateElementWriter();

    const stringified = yamlWriter.getAsYamlString(jsonElementReaderResult.element);
    // console.log(stringified);
    expect(stringified).toEqual(referenceYaml);
  });
});
