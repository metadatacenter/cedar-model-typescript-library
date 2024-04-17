import {
  CedarJsonWriters,
  CedarWriters,
  JsonTemplateReader,
  JsonTemplateReaderResult,
  JsonTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { JsonArtifactParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/JsonArtifactParsingResult';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(18);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with checkbox with four values, option 2 and 3 checked', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateWriter = writers.getTemplateWriter();

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));
    //
    // TestUtil.p(jsonTemplateReaderResult.template);
    // TestUtil.p(jsonTemplateReaderResult.template.getChildInfo('My checkbox 1'));

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);

    // const uiPagesMissing = new ComparisonError(
    //   'oco02',
    //   ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
    //   new JsonPath(CedarModel.ui, CedarModel.pages),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);
    //
    // const requiredCheckbox1Unexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
    //   undefined,
    //   'My checkbox 1',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredCheckbox1Unexpected);
    //
    // const requiredCheckbox2Unexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 12),
    //   undefined,
    //   'My checkbox 2',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredCheckbox2Unexpected);
    //
    // const languageCheckbox1Unexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'My checkbox 1', JsonSchema.items, JsonSchema.properties, JsonSchema.atLanguage),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageCheckbox1Unexpected);
    //
    // const languageCheckbox2Unexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'My checkbox 2', JsonSchema.items, JsonSchema.properties, JsonSchema.atLanguage),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageCheckbox2Unexpected);
  });
});
