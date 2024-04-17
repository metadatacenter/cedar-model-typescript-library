import {
  CedarWriters,
  CedarYamlWriters,
  ComparisonResult,
  JsonArtifactParsingResult,
  JsonTemplateFieldReader,
  JsonTemplateFieldReaderResult,
  YamlTemplateFieldWriter,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { fieldTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('YAMLTemplateFieldWriter-references', () => {
  // Generate a test for each file
  fieldTestNumbers.forEach((fieldTestNumber) => {
    it(`should correctly read the JSON, and create the same YAML as output as the reference: ${fieldTestNumber}`, async () => {
      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const comparisonResult: ComparisonResult = new ComparisonResult();
      const leftYAMLObject = {};
      const rightYAMLObject = {};
      try {
        const testResource: TestResource = TestResource.field(fieldTestNumber);
        const artifactSource: string = TestUtil.readTestJson(testResource);
        const referenceYaml: string = TestUtil.readReferenceYaml(testResource);
        const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
        const jsonFieldReaderResult: JsonTemplateFieldReaderResult = reader.readFromString(artifactSource);
        expect(jsonFieldReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonFieldReaderResult.parsingResult;
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
        const yamlWriter: YamlTemplateFieldWriter = writers.getFieldWriterForField(jsonFieldReaderResult.field);

        const stringified: string = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
        // console.log(stringified);
        expect(stringified).toEqual(referenceYaml);
      } catch (error) {
        console.log('Left yaml object');
        TestUtil.p(leftYAMLObject);
        console.log('Right yaml object');
        TestUtil.p(rightYAMLObject);
        TestUtil.p(comparisonResult.getComparisonErrors());
        console.error(`Failed to process file: ${fieldTestNumber}`, error);
        throw error;
      }
    });
  });
});
