import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { TestUtil } from '../../../TestUtil';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';

describe('JSONTemplateReader - template-004', () => {
  test('reads template with static fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/004', 'template-004.json');
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult);

    // TestUtil.p(compareResult);

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(7);

    const uiPagesMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredField1Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Field 1',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredField1Unexpected);

    const requiredField2Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 12),
      undefined,
      'Field 2',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredField2Unexpected);

    const requiredField3Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 13),
      undefined,
      'Field 3',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredField3Unexpected);

    const languageField1Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Field 1', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageField1Unexpected);

    const languageField2Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Field 2', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageField2Unexpected);

    const languageField3Unexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Field 3', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageField3Unexpected);
  });
});
