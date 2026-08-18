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
import { JSON_FIELD_ROUND_TRIP_DIVERGENCES, diagnosticsFor } from './compatibilityExpectations';

describe('JsonTemplateFieldWriter-references', () => {
  TestUtil.testNumbers(fieldTestNumbers, [], []).forEach((fieldTestNumber) => {
    it(`has the declared JSON round-trip behavior for field ${fieldTestNumber}`, async () => {
      let comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
      let jsonFieldReaderResult: JsonTemplateFieldReaderResult | null = null;
      try {
        const testResource: TestResource = TestResource.field(fieldTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
        jsonFieldReaderResult = reader.readFromString(artifactSource);
        expect(jsonFieldReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonFieldReaderResult.parsingResult;
        expect({
          errors: parsingResult.getBlueprintComparisonErrorCount(),
          warnings: parsingResult.getBlueprintComparisonWarningCount(),
        }).toStrictEqual(diagnosticsFor(JSON_FIELD_ROUND_TRIP_DIVERGENCES, fieldTestNumber));

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateFieldWriter = writers.getFieldWriterForField(jsonFieldReaderResult.field);

        comparisonResult = RoundTrip.compare(jsonFieldReaderResult, writer);
        const expected = JSON_FIELD_ROUND_TRIP_DIVERGENCES[String(fieldTestNumber)];
        expect(comparisonResult.getBlueprintComparisonErrorCount()).toBe(expected?.roundTripErrors ?? 0);
        expect(comparisonResult.getBlueprintComparisonWarningCount()).toBe(expected?.roundTripWarnings ?? 0);
      } catch (error) {
        TestUtil.p(jsonFieldReaderResult?.parsingResult);
        TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
        console.error(`Failed to process field file: ${fieldTestNumber}`, error);
        throw error;
      }
    });
  });
});
