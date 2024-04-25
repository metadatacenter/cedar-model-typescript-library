import {
  CedarJsonWriters,
  CedarWriters,
  ComparisonError,
  ComparisonErrorType,
  JsonArtifactParsingResult,
  JsonPath,
  JsonSchema,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  JsonTemplateElementWriter,
  RoundTrip,
} from '../../../src';
import { TestResource } from '../../TestResource';
import { TestUtil } from '../../TestUtil';

const testResource: TestResource = TestResource.element(1);

describe('JsonTemplateElementWriter' + testResource.toString(), () => {
  it(`should correctly read the JSON element, and create the same JSON output as the reference: ${testResource}`, async () => {
    let comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
    try {
      const artifactSource: string = TestUtil.readReferenceJson(testResource);
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

      const writers: CedarJsonWriters = CedarWriters.json().getStrict();
      const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();

      comparisonResult = RoundTrip.compare(jsonElementReaderResult, writer);
      expect(comparisonResult.wasSuccessful()).toBe(true);
      expect(comparisonResult.getBlueprintComparisonErrorCount()).toBe(0);
      expect(comparisonResult.getBlueprintComparisonWarningCount()).toBe(0);
    } catch (error) {
      TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
      console.error(`Failed to process element file: ${testResource}`, error);
      throw error;
    }
  });
});
