import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/JsonPath';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { CedarWriters, JSONElementReader, JSONTemplateElementWriter } from '../../../../src';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/constants/CedarModel';

describe('JSONElementReader - element-004', () => {
  test('reads an element with three fields', () => {
    const templateSource = TestUtil.readTestResourceAsString('elements/004', 'element-004.json');
    const reader: JSONElementReader = JSONElementReader.getFebruary2024();
    const jsonElementReaderResult = reader.readFromString(templateSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getFebruary2024();
    const writer: JSONTemplateElementWriter = writers.getJSONTemplateElementWriter();

    const compareResult: ParsingResult = JSONElementReader.getRoundTripComparisonResult(jsonElementReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(4);

    const propertyDescriptionsUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(propertyDescriptionsUnexpected);

    const titleBiboUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'title', JsonSchema.atContext, 'bibo'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(titleBiboUnexpected);

    const descriptionBiboUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'description', JsonSchema.atContext, 'bibo'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(descriptionBiboUnexpected);

    const externalLinkBiboUnexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'externalLink', JsonSchema.atContext, 'bibo'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(externalLinkBiboUnexpected);
  });
});
