import {
  CedarModel,
  CedarWriters,
  ComparisonError,
  JsonPath,
  JsonSchema,
  JSONTemplateReader,
  JSONTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/json/JSONTemplateReaderResult';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(31);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with one element with three fields', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));
    // TestUtil.p(jsonTemplateReaderResult.template);
    // TestUtil.p(compareResult);

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const uiPagesMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const textFieldLanguageUnexpected = new ComparisonError(
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
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(textFieldLanguageUnexpected);

    const emailLanguageUnexpected = new ComparisonError(
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
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(emailLanguageUnexpected);
  });
});
