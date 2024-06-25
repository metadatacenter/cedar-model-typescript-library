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

describe('JsonTemplateWriter-references', () => {
  TestUtil.testNumbers(templateTestNumbers, [3, 29, 35], []).forEach((templateTestNumber) => {
    it(`should correctly read the JSON template, and create the same JSON output as the reference: ${templateTestNumber}`, async () => {
      try {
        const testResource: TestResource = TestResource.template(templateTestNumber);

        const artifactSource: string = TestUtil.readReferenceJson(testResource);
        const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
        const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);
        expect(jsonTemplateReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
        // TestUtil.p(parsingResult);
        //expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateWriter = writers.getTemplateWriter();

        const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

        // console.log(writer.getAsJsonString(jsonTemplateReaderResult.template));
        // TestUtil.p(compareResult);
        // console.log(compareResult.getBlueprintComparisonErrorCount());

        expect(compareResult.wasSuccessful()).toBe(true);
        expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
      } catch (error) {
        console.error(`Failed to process template file: ${templateTestNumber}`, error);
        throw error;
      }
    });
  });
});
