import { CedarWriters, ComparisonError, JsonPath, JSONTemplateReader, JSONTemplateWriter } from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/JSONTemplateReaderResult';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/constants/CedarModel';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';

describe('JSONTemplateReader - template-101', () => {
  test('reads template with one element with three fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/101', 'template-101.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult, writer);

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
