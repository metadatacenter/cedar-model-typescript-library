import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/reader/JSONTemplateReaderResult';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONTemplateReader - template-011', () => {
  test('reads template with multi-field with prefLabel and altLabel', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/011', 'template-011.json');
    const jsonTemplateReaderResult: JSONTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult);

    // TestUtil.p(compareResult);
    // TestUtil.p(jsonTemplateReaderResult.template.asCedarTemplateJSONObject());

    expect(compareResult.wasSuccessful()).toBe(false);
    // expect(compareResult.getBlueprintComparisonErrorCount()).toBe(1);

    const uiPagesMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const languageTextField1Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'TextField1', JsonSchema.items, JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextField1Unexpected);

    const requiredTextField1Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'TextField1',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextField1Unexpected);
  });
});
