import {
  CedarJsonWriters,
  CedarWriters,
  JsonTemplateReader,
  JsonTemplateReaderResult,
  JsonTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { JsonArtifactParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/JsonArtifactParsingResult';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(6);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with one link field', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult: JsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: JsonArtifactParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJsonWriters = CedarWriters.json().getStrict();
    const writer: JsonTemplateWriter = writers.getTemplateWriter();

    const compareResult: JsonArtifactParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);

    expect(compareResult.wasSuccessful()).toBe(true);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(0);
    //
    // const uiPagesMissing = new ComparisonError(
    //   'oco02',
    //   ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
    //   new JsonPath(CedarModel.ui, CedarModel.pages),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);
    //
    // const requiredLinkfieldUnexpected = new ComparisonError(
    //   'oca02',
    //   ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
    //   undefined,
    //   'Linkfield',
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredLinkfieldUnexpected);
    //
    // const skosNotationLinkfieldUnexpected = new ComparisonError(
    //   'oco01',
    //   ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
    //   new JsonPath(JsonSchema.properties, 'Linkfield', JsonSchema.properties, CedarModel.skosNotation),
    // );
    // expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(skosNotationLinkfieldUnexpected);
  });
});
