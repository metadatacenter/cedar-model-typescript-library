import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/JsonPath';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { CedarWriters, JSONElementReader, JSONElementWriter } from '../../../../src';

describe('JSONElementReader - element-003', () => {
  test('reads an element with three fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('elements/003', 'element-003.json');
    const reader: JSONElementReader = JSONElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(templateSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONElementWriter = writers.getJSONElementWriter();

    const compareResult: ParsingResult = JSONElementReader.getRoundTripComparisonResult(jsonElementReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(2);

    const languageTextfieldUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(
        JsonSchema.properties,
        '#002 Element with three fields',
        JsonSchema.properties,
        'Text field',
        JsonSchema.properties,
        JsonSchema.atLanguage,
      ),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageTextfieldUnexpected);

    const languageEmailUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(
        JsonSchema.properties,
        '#002 Element with three fields',
        JsonSchema.properties,
        'Email',
        JsonSchema.properties,
        JsonSchema.atLanguage,
      ),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(languageEmailUnexpected);
  });
});
