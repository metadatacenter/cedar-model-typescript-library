import {
  CedarModel,
  CedarWriters,
  ComparisonError,
  JsonPath,
  JsonSchema,
  JSONTemplateReader,
  JSONTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/JSONTemplateReaderResult';

describe('JSONTemplateReader - template-012', () => {
  test('reads template with single required email field', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/012', 'template-012.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(jsonTemplateReaderResult.template.asCedarTemplateJSONObject());

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const uiPagesMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredEmailFieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Email field',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredEmailFieldUnexpected);

    const languageEmailFieldUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'Email field', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageEmailFieldUnexpected);
  });
});
