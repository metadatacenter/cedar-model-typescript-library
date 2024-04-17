import { CedarJsonWriters, CedarWriters, JsonArtifactParsingResult, JsonTemplateFieldReader, RoundTrip } from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.field(5);

describe('JSONFieldReader' + testResource.toString(), () => {
  test('reads a text field with a lot of features', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateFieldReader = JsonTemplateFieldReader.getStrict();
    const jsonFieldReaderResult = reader.readFromString(artifactSource);
    expect(jsonFieldReaderResult).not.toBeNull();
    const parsingResult = jsonFieldReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer = writers.getFieldWriterForField(jsonFieldReaderResult.field);

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonFieldReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));
    // TestUtil.p(jsonFieldReaderResult.field);

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
  });
});
