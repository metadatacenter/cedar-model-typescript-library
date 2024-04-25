import {
  CedarWriters,
  CedarYamlWriters,
  ComparisonError,
  ComparisonErrorType,
  JsonArtifactParsingResult,
  JsonPath,
  JsonSchema,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  YamlTemplateElementWriter,
} from '../../../src';
import { TestResource } from '../../TestResource';
import { TestUtil } from '../../TestUtil';

const testResource: TestResource = TestResource.element(1);

describe('YamlTemplateElementWriter' + testResource.toString(), () => {
  it(`should correctly read the JSON element, and create the same YAML output as the reference: ${testResource}`, async () => {
    const comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    try {
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
      const referenceYaml: string = TestUtil.readReferenceYaml(testResource);
      const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
      const jsonElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);
      expect(jsonElementReaderResult).not.toBeNull();
      const parsingResult: JsonArtifactParsingResult = jsonElementReaderResult.parsingResult;
      expect(parsingResult.wasSuccessful()).toBe(false);

      const requiredEnum = new ComparisonError(
        'jtr06',
        ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
        new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'Attribute-Value', JsonSchema.enum, 0),
      );
      expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(requiredEnum);

      const writers: CedarYamlWriters = CedarWriters.yaml().getStrict();
      const yamlWriter: YamlTemplateElementWriter = writers.getTemplateElementWriter();

      const stringified = yamlWriter.getAsYamlString(jsonElementReaderResult.element);
      // console.log(stringified);
      expect(stringified.trim()).toEqual(referenceYaml.trim());
    } catch (error) {
      TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
      console.error(`Failed to process element file: ${testResource}`, error);
      throw error;
    }
  });
});
