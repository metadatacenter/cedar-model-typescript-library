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
import { JSONTemplateReaderResult } from '../../../../src/org/metadatacenter/io/reader/json/JSONTemplateReaderResult';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(14);

describe('JSONTemplateReader' + testResource.toString(), () => {
  test('reads template with different numeric fields', () => {
    const artifactSource = TestUtil.readTestJson(testResource);
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult: JSONTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult: ParsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarJSONWriters = CedarWriters.json().getStrict();
    const writer: JSONTemplateWriter = writers.getJSONTemplateWriter();

    const compareResult: ParsingResult = RoundTrip.compare(jsonTemplateReaderResult, writer);

    // TestUtil.p(compareResult);
    // TestUtil.p(jsonTemplateReaderResult.template.asCedarTemplateJSONObject());

    expect(compareResult.wasSuccessful()).toBe(false);
    expect(compareResult.getBlueprintComparisonErrorCount()).toBe(6);

    const uiPagesMissing = new ComparisonError(
      'oco02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.pages),
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(uiPagesMissing);

    const requiredDecimalFieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 11),
      undefined,
      'Decimal',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredDecimalFieldUnexpected);

    const requiredLongFieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 12),
      undefined,
      'Long',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredLongFieldUnexpected);

    const requiredIntegerFieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 13),
      undefined,
      'Integer',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredIntegerFieldUnexpected);

    const requiredDoubleFieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 14),
      undefined,
      'Double',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredDoubleFieldUnexpected);

    const requiredFloatFieldUnexpected = new ComparisonError(
      'oca02',
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.required, 15),
      undefined,
      'Float',
    );
    expect(compareResult.getBlueprintComparisonErrors()).toContainEqual(requiredFloatFieldUnexpected);
  });
});
