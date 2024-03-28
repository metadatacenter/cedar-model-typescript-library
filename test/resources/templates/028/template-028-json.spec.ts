import { CedarModel, CedarWriters, ComparisonError, JsonPath, JSONTemplateReader, JSONTemplateWriter, RoundTrip } from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';

describe('JSONTemplateReader - template-028', () => {
  test('reads template witch annotations', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/028', 'template-028.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getFebruary2024();
    const jsonTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    // TestUtil.p(jsonTemplateReaderResult.template);

    const writers: CedarWriters = CedarWriters.getFebruary2024();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    // console.log(jsonTemplateReaderResult.templateSourceObject);

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const missingPropDesc1 = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions, 'Read & Understood'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(missingPropDesc1);

    const missingPropDesc2 = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions, 'ProjectAdminIntanceID'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(missingPropDesc2);

    const missingPropDesc3 = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions, 'ProjectAdminInstanceIDRT'),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(missingPropDesc3);
  });
});
