import { JSONTemplateReader } from './JSONTemplateReader';
import { ComparisonError } from '../model/cedar/compare/ComparisonError';
import { CedarJsonPath } from '../model/cedar/path/CedarJsonPath';
import { JsonSchema } from '../model/cedar/constants/JsonSchema';
import { ComparisonErrorType } from '../model/cedar/compare/ComparisonErrorType';
import { CedarModel } from '../model/cedar/CedarModel';
import { ParsingResult } from '../model/cedar/compare/ParsingResult';
import { ObjectComparator } from '../model/cedar/compare/ObjectComparator';
import { Node } from '../model/cedar/types/Node';

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
    // console.log(jsonTemplateReaderResult.template);
    // console.log(jsonTemplateReaderResult.template.asCedarTemplateJSONString());
    // const pr = new ParsingResult();
    // ObjectComparator.compare(
    //   pr,
    //   (global as any).templateObject002,
    //   jsonTemplateReaderResult.template.asCedarTemplateJSONObject() as Node,
    //   new CedarJsonPath(),
    // );
    // console.log(JSON.stringify(pr, null, 2));
    // console.log(JSON.stringify(parsingResult.getBlueprintComparisonErrors()));
  });

  test('reads very simple template as object, with various mismatches', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject003);
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
    // console.log(JSON.stringify(parsingResult.getBlueprintComparisonErrors(), null, 2));
  });

  test('reads template with static fields', () => {
    const jsonTemplateReaderResult = JSONTemplateReader.readFromObject((global as any).templateObject004);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);
  });
});
