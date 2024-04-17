import {
  CedarWriters,
  CedarYamlWriters,
  ComparisonResult,
  JsonArtifactParsingResult,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  YamlTemplateElementWriter,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { elementTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLTemplateElementWriter-references', () => {
  // Generate a test for each file
  elementTestNumbers.forEach((elementTestNumber) => {
    it(`should correctly read the JSON, and create the same YAML as output as the reference: ${elementTestNumber}`, async () => {
      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const comparisonResult: ComparisonResult = new ComparisonResult();
      const leftYAMLObject = {};
      const rightYAMLObject = {};
      try {
        const testResource: TestResource = TestResource.element(elementTestNumber);
        const artifactSource: string = TestUtil.readTestJson(testResource);
        const referenceYaml: string = TestUtil.readReferenceYaml(testResource);
        const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
        const jsonElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);
        expect(jsonElementReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonElementReaderResult.parsingResult;
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
        const yamlWriter: YamlTemplateElementWriter = writers.getTemplateElementWriter();

        const stringified = yamlWriter.getAsYamlString(jsonElementReaderResult.element);
        // console.log(stringified);
        expect(stringified).toEqual(referenceYaml);
      } catch (error) {
        console.log('Left yaml object');
        TestUtil.p(leftYAMLObject);
        console.log('Right yaml object');
        TestUtil.p(rightYAMLObject);
        TestUtil.p(comparisonResult.getComparisonErrors());
        console.error(`Failed to process file: ${elementTestNumber}`, error);
        throw error;
      }
    });
  });
});
