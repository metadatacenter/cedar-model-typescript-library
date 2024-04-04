import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import {
  CedarJsonWriters,
  CedarModel,
  CedarWriters,
  ComparisonError,
  JsonPath,
  JsonSchema,
  JsonTemplateFieldReader,
  RoundTrip,
} from '../../../../src';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.field(3);

describe('JSONFieldReader' + testResource.toString(), () => {
  test('reads a text field with a lot of features', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getFebruary2024();
    const writer = writers.getFieldWriterForField(jsonFieldReaderResult.field);

    const compareResult: ParsingResult = RoundTrip.compare(jsonFieldReaderResult, writer);

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
