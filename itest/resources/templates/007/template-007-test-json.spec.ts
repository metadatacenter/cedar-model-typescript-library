import {
  CedarJSONWriters,
  CedarModel,
  CedarWriters,
  ComparisonError,
  ComparisonErrorType,
  JsonPath,
  JsonSchema,
  JSONTemplateReader,
  JSONTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/json/JSONTemplateReaderResult';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(7);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with type specs for the instance', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJSONWriters = CedarWriters.json().getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);

    // TestUtil.p(jsonTemplateReaderResult.template.asCedarNode());
    // TestUtil.raw(jsonTemplateReaderResult.template);

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const uiPagesMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredTextfieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Text field',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldUnexpected);

    const languageTextfieldUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'Text field', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextfieldUnexpected);
  });
});
