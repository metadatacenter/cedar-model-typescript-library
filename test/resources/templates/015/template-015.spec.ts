import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/reader/JSONTemplateReaderResult';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONTemplateReader - template-015', () => {
  test('reads template with complex numeric field', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/015', 'template-015.json');
    const jsonTemplateReaderResult: JSONTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult);

    // TestUtil.p(compareResult);
    // TestUtil.p(jsonTemplateReaderResult.template.asCedarTemplateJSONObject());

    expect(compareResult.wasSuccessful()).toBe(false);
    //expect(compareResult.getBlueprintComparisonErrorCount()).toBe(6);

    const uiPagesMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredComplexNumberUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Complex number',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredComplexNumberUnexpected);
  });
});
