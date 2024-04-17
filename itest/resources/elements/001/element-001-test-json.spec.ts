import {
  CedarJsonWriters,
  CedarWriters,
  JsonArtifactParsingResult,
  JsonTemplateElementReader,
  JsonTemplateElementWriter,
  RoundTrip,
} from '../../../../src';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.element(1);

describe('JSONElementReader' + testResource.toString(), () => {
  test('reads an element with attribute-value field', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonElementReaderResult, writer);
    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonElementReaderResult.element));
    // TestUtil.p(jsonElementReaderResult.element);
    // TestUtil.p(jsonElementReaderResult.element.getChildInfo('Attribute-Value'));
    // TestUtil.p(
    //   'instanceof:' + (jsonElementReaderResult.element.getChildInfo('Attribute-Value') instanceof ChildDeploymentInfoAlwaysMultiple),
    // );

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
  });
});
