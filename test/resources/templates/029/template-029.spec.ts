import { CedarWriters, JSONTemplateReader, JSONTemplateWriter } from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';

describe('JSONTemplateReader - template-029', () => {
  test('reads template witch annotations', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/029', 'template-029.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(false);
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());

    // TestUtil.p(jsonTemplateReaderResult.template);

    const writers: CedarWriters = CedarWriters.getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    // console.log(jsonTemplateReaderResult.templateSourceObject);

    const compareResult: ParsingResult = JSONTemplateReader.getRoundTripComparisonResult(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult.getBlueprintComparisonErrors());
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(615);
    expect(compareResult.getBlueprintComparisonWarningCount()).toBe(982);
  });
});
