import {
  CedarWriters,
  CedarYamlWriters,
  JsonArtifactParsingResult,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  YamlTemplateElementWriter,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { elementTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLTemplateElementWriter-references', () => {
  TestUtil.testNumbers(elementTestNumbers, [1], []).forEach((elementTestNumber) => {
    it(`should correctly read the JSON element, and create the same YAML output as the reference: ${elementTestNumber}`, async () => {
      try {
        const testResource: TestResource = TestResource.element(elementTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
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
        expect(stringified.trim()).toEqual(referenceYaml.trim());
      } catch (error) {
        console.error(`Failed to process element file: ${elementTestNumber}`, error);
        throw error;
      }
    });
  });
});
