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

// Templates 4, 9 and 37 are skipped because their sources are invalid where this library is not: each
// carries a page or section break whose `_ui` omits `_content`, which the CEDAR meta-schema requires of
// every static field. The writer supplies the key, so the output no longer matches the source it was
// read from — and the source, put through the canonical validator, is rejected while the output passes.
describe('JsonTemplateWriter-references', () => {
  TestUtil.testNumbers(templateTestNumbers, [3, 4, 9, 22, 29, 35, 37], []).forEach((templateTestNumber) => {
    it(`should correctly read the JSON template, and create the same JSON output as the reference: ${templateTestNumber}`, async () => {
      let compareResult: JsonArtifactParsingResult | null = null;
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

        compareResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

        // console.log(writer.getAsJsonString(jsonTemplateReaderResult.template));
        // TestUtil.p(compareResult);
        // console.log(compareResult.getBlueprintComparisonErrorCount());

        expect(compareResult.wasSuccessful()).toBe(true);
        expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
      } catch (error) {
        TestUtil.p(compareResult);
        console.error(`Failed to process template file: ${templateTestNumber}`, error);
        throw error;
      }
    });
  });
});
