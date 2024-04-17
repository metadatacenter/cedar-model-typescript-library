import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateReader,
  JsonTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(2);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads very simple template as object, after save', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    // TestUtil.p(jsonTemplateReaderResult.template);

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
    // const requiredTextfieldUnexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
    //   undefined,
    //   'Textfield',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldUnexpected);
    //
    // const languageTextfieldUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'Textfield', JsonSchema.properties, JsonSchema.atLanguage),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextfieldUnexpected);
  });
});
