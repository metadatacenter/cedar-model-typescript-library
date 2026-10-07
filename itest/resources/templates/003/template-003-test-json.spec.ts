import { ComparisonError, ComparisonErrorType, JsonPath, JsonTemplateReader } from '../../../../src';
import { CedarModel } from '../../../../src/org/metadatacenter/model/cedar/constants/CedarModel';
import { JsonSchema } from '../../../../src/org/metadatacenter/model/cedar/constants/JsonSchema';
import { TestUtil } from '../../../TestUtil';
import { TestResource } from '../../../TestResource';

const testResource: TestResource = TestResource.template(3);

describe('JsonTemplateReader' + testResource.toString(), () => {
  test('reads very simple template as object, with various mismatches', () => {
    const artifactSource = TestUtil.readReferenceJson(testResource);
    const reader: JsonTemplateReader = JsonTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;

    expect(parsingResult.wasSuccessful()).toBe(false);
    // Six, not nine: a child the template does not label is no longer an error, nor is one the
    // context does not map. The two orphan `propertyLabels`/`propertyDescriptions` keys are still
    // dropped, as the entries they stood for name nothing this template holds.
    expect(parsingResult.getBlueprintComparisonErrorCount()).toBe(6);

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

    // TextfieldChild has no mapping in the context, which reads as a child with no property IRI.
    expect(parsingResult.getBlueprintComparisonErrors().filter((e) => e.errorLocation === 'jtr06')).toEqual([]);

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
