import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { TestUtil } from '../../../TestUtil';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';

describe('JSONTemplateReader - template-005', () => {
  test('reads multi-instance text fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates', 'template-005.json');
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    // TestUtil.p(parsingResult);
    // TestUtil.raw(jsonTemplateReaderResult.template.childrenInfo.get('Textfield'));
    // TestUtil.raw(jsonTemplateReaderResult.template.children);
    expect(parsingResult.wasSuccessful()).toBe(true);

    // TestUtil.p(jsonTemplateReaderResult.template.asCedarNode());
    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult);

    // TestUtil.p(compareResult);

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
      'Textfield',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldUnexpected);

    const atLanguageUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Textfield', JsonSchema.items, JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(atLanguageUnexpected);
  });
});
