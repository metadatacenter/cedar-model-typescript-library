import { JSONTemplateReader } from '../../../../src/org/metadatacenter/reader/JSONTemplateReader';
import { CedarJsonPath } from '../../../../src/org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { ComparisonError } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/CedarModel';
import { TestUtil } from '../../../TestUtil';

describe('JSONTemplateReader - template-003', () => {
  test('reads very simple template as object, with various mismatches', () => {
    const templateSource = TestUtil.readTestResourceAsString('templates/003', 'template-003.json');
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;

    expect(parsingResult.wasSuccessful()).toBe(false);
    expect(parsingResult.getBlueprintComparisonErrorCount()).toBe(9);

    const requiredTextfieldChild = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.required),
      'TextfieldChild',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldChild);

    const requiredTextfieldRequired = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.required),
      'TextfieldRequired',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(requiredTextfieldRequired);

    const uiPropertyLabels = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.propertyLabels),
      'TextfieldChild',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiPropertyLabels);

    const uiPropertyDescriptions = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.propertyDescriptions),
      'TextfieldChild',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiPropertyDescriptions);

    const iriMapping = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'TextfieldChild', JsonSchema.enum, 0),
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(iriMapping);

    const uiOrderExtra = new ComparisonError(
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.order),
      null,
      'TextfieldOrder',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiOrderExtra);

    const uiOrderMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(CedarModel.ui, CedarModel.order),
      'TextfieldChildExtra',
      null,
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(uiOrderMissing);

    const propertiesRdfsMissing = new ComparisonError(
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'rdfs'),
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(propertiesRdfsMissing);

    const propertiesXsdTypeValueMismatch = new ComparisonError(
      ComparisonErrorType.VALUE_MISMATCH,
      new CedarJsonPath(JsonSchema.properties, JsonSchema.atContext, JsonSchema.properties, 'xsd', 'type'),
      'string',
      'string--',
    );
    expect(parsingResult.getBlueprintComparisonErrors()).toContainEqual(propertiesXsdTypeValueMismatch);
  });
});
