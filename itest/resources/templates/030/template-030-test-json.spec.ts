import {
  CedarJSONWriters,
  CedarModel,
  CedarWriters,
  ComparisonError,
  JsonPath,
  JsonSchema,
  JSONTemplateReader,
  JSONTemplateWriter,
  RoundTrip,
} from '../../../../src';
import { ParsingResult } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { TestUtil } from '../../../TestUtil';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(30);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template witch annotations', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());

    // TestUtil.p(jsonTemplateReaderResult.template);

    const writers: CedarJSONWriters = CedarWriters.json().getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    // console.log(jsonTemplateReaderResult.templateSourceObject);

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(writer.getAsJsonNode(jsonTemplateReaderResult.template));

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(3);

    const uiPagesMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredControlled1Unexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Untitled',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredControlled1Unexpected);

    const skosNotationControlled1Unexpected = new ComparisonError(
      'oco01',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, 'Untitled', JsonSchema.properties, CedarModel.skosNotation),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(skosNotationControlled1Unexpected);
  });
});
