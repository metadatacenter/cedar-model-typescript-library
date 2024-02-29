import { JSONTemplateReader } from './JSONTemplateReader';
import { ComparisonError } from '../model/cedar/compare/ComparisonError';
import { CedarJsonPath } from '../model/cedar/path/CedarJsonPath';
import { JsonSchema } from '../model/cedar/constants/JsonSchema';
import { ComparisonErrorType } from '../model/cedar/compare/ComparisonErrorType';
import { CedarModel } from '../model/cedar/CedarModel';

describe('JSONTemplateReader', () => {
  test('reads empty template as string, should be not null', () => {
    const templateSourceString = '';
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSourceString);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  test('reads empty template as object, should be not null', () => {
    const templateSourceObject = {};
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateSourceObject);
    expect(jsonTemplateReaderResult).not.toBeNull();
  });

  test('reads very simple template as string, before save', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromString((global as any).templateSource001);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  test('reads very simple template as string, before save', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject001);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  test('reads very simple template as object, after save', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject002);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });

  test('reads very simple template as object, with various mismatches', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject003);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;

    expect(parsingResult.wasSuccessful()).toBe(false);
    expect(parsingResult.getBlueprintComparisonErrorCount()).toBe(7);

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
  });

  test('reads template with static fields', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject004);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });
});
