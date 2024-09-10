import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateInstanceReader,
  JsonTemplateInstanceReaderResult,
  JsonTemplateReader,
  JsonTemplateReaderResult,
  JsonTemplateWriter,
  RoundTrip,
  TemplateInstance,
} from '../../src';
import { TestUtil } from '../TestUtil';
import { ceeSuiteTestMap } from './generatedTestCases';
import { TestResource } from '../TestResource';

xdescribe('JsonTemplateInstanceReaderCEE-references', () => {
  TestUtil.testMap(ceeSuiteTestMap, [], []).forEach(([ceeTestNumber, testDefinition]) => {
    it(`should correctly read the JSON template instance, and create the same JSON output as the reference: ${ceeTestNumber}`, async () => {
      const testResource: TestResource = TestResource.ceeSuite(ceeTestNumber);
      let templateSource: string = '';
      let instanceSource: string = '';
      if (testDefinition.template) {
        templateSource = TestUtil.readReferenceJson(testResource);
        console.log(templateSource);
      }
      if (testDefinition.instance) {
        instanceSource = TestUtil.readReferenceInstanceJson(testResource);
        //console.log(instanceSource);
      }

      let comparisonResult: JsonArtifactParsingResult = new JsonArtifactParsingResult();
      try {
        const templateReader: JsonTemplateReader = JsonTemplateReader.getStrict();
        const jsonTemplateReaderResult: JsonTemplateReaderResult = templateReader.readFromString(templateSource);
        expect(jsonTemplateReaderResult).not.toBeNull();
        const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
        expect(parsingResult.wasSuccessful()).toBe(true);

        const writers: CedarJsonWriters = CedarWriters.json().getStrict();
        const writer: JsonTemplateWriter = writers.getTemplateWriter();
        // console.log(writer.getAsJsonString(jsonElementReaderResult.element));

        comparisonResult = RoundTrip.compare(jsonTemplateReaderResult, writer);
        expect(comparisonResult.wasSuccessful()).toBe(true);
        expect(comparisonResult.getBlueprintComparisonErrorCount()).toBe(0);
        expect(comparisonResult.getBlueprintComparisonWarningCount()).toBe(0);

        const instanceReader: JsonTemplateInstanceReader = JsonTemplateInstanceReader.getStrict();
        const jsonTemplateInstanceReaderResult: JsonTemplateInstanceReaderResult = instanceReader.readFromString(instanceSource);
        expect(jsonTemplateInstanceReaderResult).not.toBeNull();
        const instance: TemplateInstance = jsonTemplateInstanceReaderResult.instance;
        //TestUtil.p(instance);
      } catch (error) {
        TestUtil.p(comparisonResult.getBlueprintComparisonErrors());
        console.error(`Failed to process template file: ${ceeTestNumber}`, error);
        throw error;
      }
    });
  });
});
