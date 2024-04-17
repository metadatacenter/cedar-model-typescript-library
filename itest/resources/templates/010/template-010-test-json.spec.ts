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

const testResource: TestResource = TestResource.template(10);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with 3 date and time fields', () => {
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

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
    //
    // const uiPagesMissing = new ComparisonError(
    //   'oco02',
    //   ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
    //   new JsonPath(CedarModel.ui, CedarModel.pages),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);
    //
    // const requiredSimpleDateUnexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
    //   undefined,
    //   'Simple date',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredSimpleDateUnexpected);
    //
    // const requiredSimpleTimeUnexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 12),
    //   undefined,
    //   'Simple time',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredSimpleTimeUnexpected);
    //
    // const requiredComplexDateTimeUnexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 13),
    //   undefined,
    //   'Complex datetime',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredComplexDateTimeUnexpected);
    //
    // const languageSimpleDateUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'Simple date', JsonSchema.properties, JsonSchema.atLanguage),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageSimpleDateUnexpected);
    //
    // const languageSimpleTimeUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'Simple time', JsonSchema.properties, JsonSchema.atLanguage),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageSimpleTimeUnexpected);
    //
    // const languageComplexDateTimeSimpleTimeUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'Complex datetime', JsonSchema.items, JsonSchema.properties, JsonSchema.atLanguage),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageComplexDateTimeSimpleTimeUnexpected);
  });
});
