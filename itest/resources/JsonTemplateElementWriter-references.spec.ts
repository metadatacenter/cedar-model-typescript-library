import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  JsonTemplateElementWriter,
  RoundTrip,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { elementTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';
import { JSON_ELEMENT_ROUND_TRIP_DIVERGENCES, diagnosticsFor } from './compatibilityExpectations';

describe('JsonTemplateElementWriter-references', () => {
  TestUtil.testNumbers(elementTestNumbers, [], []).forEach((elementTestNumber) => {
    it(`has the declared JSON round-trip behavior for element ${elementTestNumber}`, async () => {
      let comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
      try {
        const testResource: TestResource = TestResource.element(elementTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
        const jsonElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);
        expect(jsonElementReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonElementReaderResult.parsingResult;
        expect({
          errors: parsingResult.getBlueprintComparisonErrorCount(),
          warnings: parsingResult.getBlueprintComparisonWarningCount(),
        }).toStrictEqual(diagnosticsFor(JSON_ELEMENT_ROUND_TRIP_DIVERGENCES, elementTestNumber));

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
        // console.log(writer.getAsJsonString(jsonElementReaderResult.element));

        comparisonResult = RoundTrip.compare(jsonElementReaderResult, writer);

        // console.log(writer.getAsJsonString(jsonElementReaderResult.element));
        // TestUtil.p(comparisonResult);
        // console.log(comparisonResult.getBlueprintComparisonErrorCount());

        const expected = JSON_ELEMENT_ROUND_TRIP_DIVERGENCES[String(elementTestNumber)];
        expect(comparisonResult.getBlueprintComparisonErrorCount()).toBe(expected?.roundTripErrors ?? 0);
        expect(comparisonResult.getBlueprintComparisonWarningCount()).toBe(expected?.roundTripWarnings ?? 0);
      } catch (error) {
        TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
        console.error(`Failed to process element file: ${elementTestNumber}`, error);
        throw error;
      }
    });
  });
});
