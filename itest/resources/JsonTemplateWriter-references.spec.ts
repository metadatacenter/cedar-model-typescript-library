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

const skipTests: number[] = [3, 29];

describe('JsonTemplateWriter-references', () => {
  // Generate a test for each file
  templateTestNumbers.forEach((templateTestNumber) => {
    if (!skipTests.includes(templateTestNumber)) {
      // if (templateTestNumber == 32) {
      it(`should correctly read the JSON template, and create the same JSON output as the reference: ${templateTestNumber}`, async () => {
        try {
          const testResource: TestResource = TestResource.template(templateTestNumber);

          const artifactSource: string = TestUtil.readTestJson(testResource);
          const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
          const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);
          expect(jsonTemplateReaderResult).not.toBeNull();
          const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
          // TestUtil.p(parsingResult);
          expect(parsingResult.wasSuccessful()).toBe(true);

          const writers: CedarJsonWriters = CedarWriters.json().getStrict();
          const writer: JsonTemplateWriter = writers.getTemplateWriter();

          const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

          // TestUtil.p(jsonTemplateReaderResult.template.asCedarTemplateJSONObject());
          // TestUtil.p(compareResult);

          expect(compareResult.wasSuccessful()).toBe(true);
          expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
        } catch (error) {
          console.error(`Failed to process template file: ${templateTestNumber}`, error);
          throw error;
        }
      });
    }
  });
});
