import { CedarModel, ComparisonError, JsonPath, JsonSchema, JSONTemplateReader } from '../../../../src';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { TestUtil } from '../../../TestUtil';

describe('JSONTemplateReader - template-003', () => {
  test('reads very simple template as object, with various mismatches', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/003', 'template-003.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;

    expect(parsingResult.wasSuccessful()).toBe(false);
    expect(parsingResult.getBlueprintComparisonErrorCount()).toBe(9);

    // TestUtil.p(parsingResult.getBlueprintComparisonErrors());

    const requiredTextfieldChild = new ComparisonError(
      'jtr02',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.required),
      'TextfieldChild',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldChild);

    const requiredTextfieldRequired = new ComparisonError(
      'jtr03',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.required),
      'TextfieldRequired',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldRequired);

    const uiPropertyLabels = new ComparisonError(
      'jtr04',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyLabels),
      'TextfieldChild',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiPropertyLabels);

    const uiPropertyDescriptions = new ComparisonError(
      'jtr05',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.propertyDescriptions),
      'TextfieldChild',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiPropertyDescriptions);

    const iriMapping = new ComparisonError(
      'jtr06',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'TextfieldChild', JsonSchema.enum, 0),
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(iriMapping);

    const uiOrderExtra = new ComparisonError(
      'jtr07',
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.order),
      null,
      'TextfieldOrder',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiOrderExtra);

    const uiOrderMissing = new ComparisonError(
      'jtr08',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(CedarModel.ui, CedarModel.order),
      'TextfieldChildExtra',
      null,
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiOrderMissing);

    const propertiesRdfsMissing = new ComparisonError(
      'olo01',
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'rdfs'),
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(propertiesRdfsMissing);

    const propertiesXsdTypeValueMismatch = new ComparisonError(
      'olo02',
      ComparisonErrorType.VALUE_MISMATCH,
      new JsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'xsd', 'type'),
      'string',
      'string--',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(propertiesXsdTypeValueMismatch);
  });
});
