import { CedarWriters, CedarYamlWriters, JsonTemplateReader, YamlTemplateWriter } from '../../src';
import { TestUtil } from '../TestUtil';
import { templateTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLTemplateWriter-references', () => {
  TestUtil.testNumbers(templateTestNumbers, [3], [29]).forEach((templateTestNumber) => {
    it(`should correctly read the JSON template, and create the same YAML output as the reference: ${templateTestNumber}`, async () => {
      try {
        const testResource: TestResource = TestResource.template(templateTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const referenceYaml: string = TestUtil.readReferenceYaml(testResource);
        const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
        const jsonTemplateReaderResult = reader.readFromString(artifactSource);
        expect(jsonTemplateReaderResult).not.toBeNull();
        const parsingResult = jsonTemplateReaderResult.parsingResult;
        //TestUtil.p(parsingResult.getBlueprintComparisonErrors());
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
        const yamlWriter: YamlTemplateWriter = writers.getTemplateWriter();

        const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
        // console.log(stringified);
        // console.log(referenceYaml);
        expect(stringified.trim()).toEqual(referenceYaml.trim());
      } catch (error) {
        console.error(`Failed to process template file: ${templateTestNumber}`, error);
        throw error;
      }
    });
  });
});
