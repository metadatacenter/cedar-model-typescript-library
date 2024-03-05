import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/reader/JSONTemplateReaderResult';

describe('JSONTemplateReader - template-007', () => {
  test('reads template with type specs for the instance', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates', 'template-007.json');
    const jsonTemplateReaderResult: JSONTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult);

    // TestUtil.p(compareResult);

    // TestUtil.p(jsonTemplateReaderResult.template.asCedarNode());
    // TestUtil.raw(jsonTemplateReaderResult.template);

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const uiPagesMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredTextfieldUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_INDEX_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Text field',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldUnexpected);

    const languageTextfieldUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Text field', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextfieldUnexpected);
  });
});