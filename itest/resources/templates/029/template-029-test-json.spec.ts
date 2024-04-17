import { CedarJsonWriters, CedarWriters, JsonTemplateReader, JsonTemplateWriter, RoundTrip } from '../../../../src';
import { JsonArtifactParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/JsonArtifactParsingResult';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(29);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template witch annotations', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(false);
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());

    // TestUtil.p(jsonTemplateReaderResult.template);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateWriter = writers.getTemplateWriter();

    // console.log(jsonTemplateReaderResult.templateSourceObject);

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult.getBlueprintComparisonErrors());
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(1780);
    expect(compareResult.getBlueprintComparisonWarningCount()).toBe(0);
  });
});
