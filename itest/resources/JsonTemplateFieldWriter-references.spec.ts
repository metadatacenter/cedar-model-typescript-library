import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateFieldReader,
  JsonTemplateFieldReaderResult,
  JsonTemplateFieldWriter,
  RoundTrip,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { fieldTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';

describe('JsonTemplateFieldWriter-references', () => {
  TestUtil.testNumbers(fieldTestNumbers, [8, 12], [4]).forEach((fieldTestNumber) => {
    it(`should correctly read the JSON field, and create the same JSON output as the reference: ${fieldTestNumber}`, async () => {
      let comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
      let jsonFieldReaderResult: JsonTemplateFieldReaderResult | null = null;
      try {
        const testResource: TestResource = TestResource.field(fieldTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
        jsonFieldReaderResult = reader.readFromString(artifactSource);
        expect(jsonFieldReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonFieldReaderResult.parsingResult;
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateFieldWriter = writers.getFieldWriterForField(jsonFieldReaderResult.field);

        comparisonResult = RoundTrip.compare(jsonFieldReaderResult, writer);
        expect(comparisonResult.wasSuccessful()).toBe(true);
        expect(comparisonResult.getBlueprintComparisonErrorCount()).toBe(0);
        expect(comparisonResult.getBlueprintComparisonWarningCount()).toBe(0);
      } catch (error) {
        TestUtil.p(jsonFieldReaderResult?.parsingResult);
        TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
        console.error(`Failed to process field file: ${fieldTestNumber}`, error);
        throw error;
      }
    });
  });
});
