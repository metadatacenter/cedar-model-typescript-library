import {
  CedarWriters,
  CedarYamlWriters,
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
    it(`should correctly read the JSON field, and create the same YAML output as the reference: ${fieldTestNumber}`, async () => {
      try {
        const testResource: TestResource = TestResource.field(fieldTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const referenceYaml: string = TestUtil.readReferenceYaml(testResource);
        const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
        const jsonFieldReaderResult: JsonTemplateFieldReaderResult = reader.readFromString(artifactSource);
        expect(jsonFieldReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonFieldReaderResult.parsingResult;
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
        const yamlWriter: YamlTemplateFieldWriter = writers.getFieldWriterForField(jsonFieldReaderResult.field);

        const stringified: string = yamlWriter.getAsYamlString(jsonFieldReaderResult.field);
        expect(stringified.trim()).toEqual(referenceYaml.trim());
      } catch (error) {
        console.error(`Failed to process field file: ${fieldTestNumber}`, error);
        throw error;
      }
    });
  });
});
