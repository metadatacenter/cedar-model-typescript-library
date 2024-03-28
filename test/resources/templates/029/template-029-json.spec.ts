import { CedarWriters, JSONTemplateReader, JSONTemplateWriter, RoundTrip } from '../../../../src';
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

    const writers: CedarWriters = CedarWriters.getFebruary2024();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    // console.log(jsonTemplateReaderResult.templateSourceObject);

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult.getBlueprintComparisonErrors());
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(504);
    expect(compareResult.getBlueprintComparisonWarningCount()).toBe(982);
  });
});
