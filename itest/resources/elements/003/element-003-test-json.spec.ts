import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import {
  CedarJsonWriters,
  CedarWriters,
  ComparisonError,
  JsonPath,
  JsonSchema,
  JsonTemplateElementReader,
  JsonTemplateElementWriter,
  RoundTrip,
} from '../../../../src';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.element(3);

describe('JSONElementReader' + testResource.toString(), () => {
  test('reads an element with three fields', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();

    const compareResult: ParsingResult = RoundTrip.compare(jsonElementReaderResult, writer);

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
