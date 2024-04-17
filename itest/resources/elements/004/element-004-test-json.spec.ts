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

const testResource: TestResource = TestResource.element(4);

describe('JSONElementReader' + testResource.toString(), () => {
  test('reads an element with three fields', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateElementReader = JsonTemplateElementReader.getStrict();
    const jsonElementReaderResult = reader.readFromString(artifactSource);
    expect(jsonElementReaderResult).not.toBeNull();
    const parsingResult = jsonElementReaderResult.parsingResult;
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());
    // expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateElementWriter = writers.getTemplateElementWriter();

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonElementReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonFieldReaderResult.field));

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);

    // const propertyDescriptionsUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(propertyDescriptionsUnexpected);
    //
    // const titleBiboUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'title', JsonSchema.atContext, 'bibo'),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(titleBiboUnexpected);
    //
    // const descriptionBiboUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'description', JsonSchema.atContext, 'bibo'),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(descriptionBiboUnexpected);
    //
    // const externalLinkBiboUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'externalLink', JsonSchema.atContext, 'bibo'),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(externalLinkBiboUnexpected);
  });
});
