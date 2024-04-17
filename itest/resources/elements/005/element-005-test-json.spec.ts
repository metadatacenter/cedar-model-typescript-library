import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateElementReader,
  JsonTemplateElementReaderResult,
  JsonTemplateElementWriter,
  RoundTrip,
} from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.element(5);

describe('JSONElementReader' + testResource.toString(), () => {
  test('reads element with recommendedValue', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
    const jsonElementReaderResult: JsonTemplateElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult: JsonArtifactParsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonElementReaderResult, writer);

    // TestUtil.p(writer.getAsJsonNode(jsonElementReaderResult.element));
    // TestUtil.p(jsonElementReaderResult.element);
    // TestUtil.p(compareResult);

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
  });
});
