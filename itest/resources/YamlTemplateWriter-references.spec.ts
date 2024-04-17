import { CedarWriters, CedarYamlWriters, JsonTemplateReader, YamlTemplateWriter } from '../../src';
import { TestUtil } from '../TestUtil';
import { templateTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

const skipTests: number[] = [3, 29];

describe('YAMLTemplateWriter-references', () => {
  // Generate a test for each file
  templateTestNumbers.forEach((templateTestNumber) => {
    if (!skipTests.includes(templateTestNumber)) {
      it(`should correctly read the JSON template, and create the same YAML output as the reference: ${templateTestNumber}`, async () => {
        try {
          const testResource: TestResource = TestResource.template(templateTestNumber);
          const artifactSource: string = TestUtil.readTestJson(testResource);
          const referenceYaml: string = TestUtil.readReferenceYaml(testResource);
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
        } catch (error) {
          console.error(`Failed to process template file: ${templateTestNumber}`, error);
          throw error;
        }
      });
    }
  });
});
