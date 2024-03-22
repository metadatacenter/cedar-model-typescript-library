import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/JsonPath';
import { CedarWriters, JSONFieldReader } from '../../../../src';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/constants/CedarModel';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONFieldReader - field-003', () => {
  test('reads a text field with a lot of features', () => {
    const templateSource = TestUtil.readTestResourceAsString('fields/003', 'field-003.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(templateSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getFebruary2024();
    const writer = writers.getJSONFieldWriterForField(jsonFieldReaderResult.field);

    const compareResult: ParsingResult = JSONFieldReader.getRoundTripComparisonResult(jsonFieldReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(4);

    const skosMissing = new ComparisonError('oco02', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, new JsonPath(CedarModel.skosAltLabel));
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(skosMissing);

    const multipleChoiceMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.valueConstraints, CedarModel.multipleChoice),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(multipleChoiceMissing);

    const recommendationMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.valueRecommendationEnabled),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(recommendationMissing);

    const unexpectedRequired = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.required),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(unexpectedRequired);
  });
});
