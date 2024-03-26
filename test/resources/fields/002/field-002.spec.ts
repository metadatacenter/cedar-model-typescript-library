import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { CedarWriters, ComparisonError, JSONFieldReader, JsonPath } from '../../../../src';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONFieldReader - field-002', () => {
  test('reads a text field with a lot of features', () => {
    const templateSource = TestUtil.readTestResourceAsString('fields/002', 'field-002.json');
    const reader: JSONFieldReader = JSONFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(templateSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer = writers.getJSONFieldWriterForField(jsonFieldReaderResult.field);

    const compareResult: ParsingResult = JSONFieldReader.getRoundTripComparisonResult(jsonFieldReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(1);

    const languageTextfieldUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextfieldUnexpected);
  });
});
