import { CedarWriters, CedarYamlWriters, JsonTemplateReader, YamlTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(18);

describe('YAMLTemplateWriter' + testResource.toString(), () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const referenceYaml = TestUtil.readReferenceYaml(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter: YamlTemplateWriter = writers.getTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
    // console.log(stringified);
    expect(stringified).toEqual(referenceYaml);
  });
});
