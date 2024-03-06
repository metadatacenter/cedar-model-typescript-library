import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/reader/JSONTemplateReaderResult';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONTemplateReader - template-010', () => {
  test('reads template with 3 date and time fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/010', 'template-010.json');
    const jsonTemplateReaderResult: JSONTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult);

    // TestUtil.p(compareResult);
    // TestUtil.p(jsonTemplateReaderResult.template.asCedarTemplateJSONObject());

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(7);

    const uiPagesMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredSimpleDateUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Simple date',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredSimpleDateUnexpected);

    const requiredSimpleTimeUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 12),
      undefined,
      'Simple time',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredSimpleTimeUnexpected);

    const requiredComplexDateTimeUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 13),
      undefined,
      'Complex datetime',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredComplexDateTimeUnexpected);

    const languageSimpleDateUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Simple date', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageSimpleDateUnexpected);

    const languageSimpleTimeUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Simple time', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageSimpleTimeUnexpected);

    const languageComplexDateTimeSimpleTimeUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Complex datetime', JsonSchema.items, JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageComplexDateTimeSimpleTimeUnexpected);
  });
});
