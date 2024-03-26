import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { CedarWriters, ComparisonError, JSONElementReader, JsonPath, JSONTemplateElementWriter } from '../../../../src';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONElementReader - element-002', () => {
  test('reads an element with three fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('elements/002', 'element-002.json');
    const reader: JSONElementReader = JSONElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(templateSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateElementWriter = writers.getJSONTemplateElementWriter();

    const compareResult: ParsingResult = JSONElementReader.getRoundTripComparisonResult(jsonElementReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(2);

    const languageTextfieldUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'Text field', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextfieldUnexpected);

    const languageEmailUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'Email', JsonSchema.properties, JsonSchema.atLanguage),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageEmailUnexpected);
  });
});
