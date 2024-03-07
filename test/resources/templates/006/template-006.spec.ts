import { JSONTemplateReader } from '../../../../src/org/metadatacenter/io/reader/JSONTemplateReader';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/JSONTemplateReaderResult';
import { CedarWriters } from '../../../../src/org/metadatacenter/io/writer/CedarWriters';
import { JSONTemplateWriter } from '../../../../src/org/metadatacenter/model/cedar/template/JSONTemplateWriter';

describe('JSONTemplateReader - template-006', () => {
  test('reads template with one link field', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/006', 'template-006.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const uiPagesMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredLinkfieldUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Linkfield',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredLinkfieldUnexpected);

    const skosNotationLinkfieldUnexpected = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, 'Linkfield', JsonSchema.properties, CedarModel.skosNotation),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(skosNotationLinkfieldUnexpected);
  });
});
