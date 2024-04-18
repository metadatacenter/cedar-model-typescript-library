import { templateTestNumbers } from '../resources/generatedTestCases';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import { CedarWriters, CedarYamlWriters, JsonTemplateReader, YamlTemplateWriter } from '../../src';

templateTestNumbers.forEach((templateTestNumber) => {
  //if (!skipTests.includes(templateTestNumber)) {
  //    if (templateTestNumber == 6) {
  try {
    const testResource: TestResource = TestResource.template(templateTestNumber);
    const artifactSource: string = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    // expect(jsonTemplateReaderResult).not.toBeNull();
    // const parsingResult = jsonTemplateReaderResult.parsingResult;
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
    const yamlWriter: YamlTemplateWriter = writers.getTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);

    TestUtil.writeSerializedYaml(testResource, stringified);
  } catch (error) {
    console.error(`Failed to process template file: ${templateTestNumber}`, error);
    throw error;
  }
});
