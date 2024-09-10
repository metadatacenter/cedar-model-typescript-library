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

describe('JsonTemplateElementWriter-references', () => {
  TestUtil.testNumbers(elementTestNumbers, [1], []).forEach((elementTestNumber) => {
    it(`should correctly read the JSON element, and create the same JSON output as the reference: ${elementTestNumber}`, async () => {
      let comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
      try {
        const testResource: TestResource = TestResource.element(elementTestNumber);
        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
        const jsonElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);
        expect(jsonElementReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonElementReaderResult.parsingResult;
        // TestUtil.p(parsingResult);
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();
        // console.log(writer.getAsJsonString(jsonElementReaderResult.element));

        comparisonResult = RoundTrip.compare(jsonElementReaderResult, writer);

        // console.log(writer.getAsJsonString(jsonElementReaderResult.element));
        // TestUtil.p(comparisonResult);
        // console.log(comparisonResult.getBlueprintComparisonErrorCount());

        expect(comparisonResult.wasSuccessful()).toBe(true);
        expect(comparisonResult.getBlueprintComparisonErrorCount()).toBe(0);
        expect(comparisonResult.getBlueprintComparisonWarningCount()).toBe(0);
      } catch (error) {
        TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
        console.error(`Failed to process element file: ${elementTestNumber}`, error);
        throw error;
      }
    });
  });
});
