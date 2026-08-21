import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateReader,
  JsonTemplateReaderResult,
  JsonTemplateWriter,
  RoundTrip,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { templateTestNumbers } from './generatedTestCases';
import { TestResource } from '../TestResource';
import { JSON_TEMPLATE_ROUND_TRIP_DIVERGENCES, diagnosticsFor } from './compatibilityExpectations';

// Every historical case runs. Sources that differ from today's canonical writer are declared in
// compatibilityExpectations.ts with their exact parse and round-trip diagnostic counts, so a repaired
// case fails until its now-stale declaration is removed.
describe('JsonTemplateWriter-references', () => {
  TestUtil.testNumbers(templateTestNumbers, [], []).forEach((templateTestNumber) => {
    it(`has the declared JSON round-trip behavior for template ${templateTestNumber}`, async () => {
      let compareResult: JsonArtifactParsingResult | null = null;
      try {
        const testResource: TestResource = TestResource.template(templateTestNumber);

        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
        const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);
        expect(jsonTemplateReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
        expect({
          errors: parsingResult.getBlueprintComparisonErrorCount(),
          warnings: parsingResult.getBlueprintComparisonWarningCount(),
        }).toStrictEqual(diagnosticsFor(JSON_TEMPLATE_ROUND_TRIP_DIVERGENCES, templateTestNumber));

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateWriter = writers.getTemplateWriter();

        compareResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

        // console.log(writer.getAsJsonString(jsonTemplateReaderResult.template));
        // TestUtil.p(compareResult);
        // console.log(compareResult.getBlueprintComparisonErrorCount());

        const expected = JSON_TEMPLATE_ROUND_TRIP_DIVERGENCES[String(templateTestNumber)];
        expect(compareResult.getBlueprintComparisonErrorCount()).toBe(expected?.roundTripErrors ?? 0);
        expect(compareResult.getBlueprintComparisonWarningCount()).toBe(expected?.roundTripWarnings ?? 0);
      } catch (error) {
        TestUtil.p(compareResult);
        console.error(`Failed to process template file: ${templateTestNumber}`, error);
        throw error;
      }
    });
  });
});
