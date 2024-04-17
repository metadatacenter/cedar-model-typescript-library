import { CedarJsonWriters, CedarWriters, JsonTemplateReader, JsonTemplateWriter, RoundTrip } from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { JsonTemplateReaderResult } from '../../../../src';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(31);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with one element with three fields', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateWriter = writers.getTemplateWriter();

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));
    // TestUtil.p(jsonTemplateReaderResult.template);
    // TestUtil.p(compareResult);

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);

    // const uiPagesMissing = new ComparisonError(
    //   'oco02',
    //   ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
    //   new JsonPath(CedarModel.ui, CedarModel.pages),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);
    //
    // const textFieldLanguageUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(
    //     JsonSchema.properties,
    //     '#002 Element with three fields',
    //     JsonSchema.properties,
    //     'Text field',
    //     JsonSchema.properties,
    //     JsonSchema.atLanguage,
    //   ),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(textFieldLanguageUnexpected);
    //
    // const emailLanguageUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(
    //     JsonSchema.properties,
    //     '#002 Element with three fields',
    //     JsonSchema.properties,
    //     'Email',
    //     JsonSchema.properties,
    //     JsonSchema.atLanguage,
    //   ),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(emailLanguageUnexpected);
  });
});
