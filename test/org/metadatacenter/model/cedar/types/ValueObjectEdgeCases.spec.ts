import { AdditionalProperties } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/AdditionalProperties';
import { AnnotationAtValue } from '../../../../../../src/org/metadatacenter/model/cedar/annotation/AnnotationAtValue';
import { Annotations } from '../../../../../../src/org/metadatacenter/model/cedar/annotation/Annotations';
import { ArtifactSchema } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/ArtifactSchema';
import { CedarArtifactType } from '../../../../../../src/org/metadatacenter/model/cedar/types/cedar-types/CedarArtifactType';
import { ComparisonError } from '../../../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonError';
import { ComparisonErrorType } from '../../../../../../src/org/metadatacenter/model/cedar/util/compare/ComparisonErrorType';
import { IsoDate } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/IsoDate';
import { JavascriptType } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/JavascriptType';
import { JsonPath } from '../../../../../../src/org/metadatacenter/model/cedar/util/path/JsonPath';
import { Language } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/Language';
import { YamlArtifactParsingResult } from '../../../../../../src/org/metadatacenter/model/cedar/util/compare/YamlArtifactParsingResult';
import { YamlArtifactType } from '../../../../../../src/org/metadatacenter/model/cedar/types/wrapped-types/YamlArtifactType';
import { YamlComparisonErrorType } from '../../../../../../src/org/metadatacenter/model/cedar/util/compare/YamlComparisonErrorType';

describe('value object edge cases', () => {
  test('closed value sets distinguish recognized values from unknown values', () => {
    expect(AdditionalProperties.forValue('false')).toBe(AdditionalProperties.FALSE);
    expect(AdditionalProperties.forValue('unexpected')).toBe(AdditionalProperties.NULL);
    expect(JavascriptType.forValue('array')).toBe(JavascriptType.ARRAY);
    expect(JavascriptType.forValue('unexpected')).toBe(JavascriptType.NULL);
    expect(ComparisonErrorType.forValue('valueMismatch')).toBe(ComparisonErrorType.VALUE_MISMATCH);
    expect(ComparisonErrorType.forValue('unexpected')).toBe(ComparisonErrorType.NULL);
    expect(YamlComparisonErrorType.forValue('valueMismatch')).toBe(YamlComparisonErrorType.VALUE_MISMATCH);
    expect(YamlComparisonErrorType.forValue('unexpected')).toBe(YamlComparisonErrorType.NULL);
  });

  test('open schema and language values preserve useful custom values', () => {
    expect(ArtifactSchema.forValue(null).getValue()).toBe('http://json-schema.org/draft-04/schema#');
    expect(ArtifactSchema.forValue('https://example.org/schema').getValue()).toBe('https://example.org/schema');
    expect(Language.forValue(null)).toBe(Language.NULL);
    expect(Language.forValue('')).toBe(Language.NULL);
    expect(Language.forValue('en').getValue()).toBe('en');
  });

  test('YAML artifact categories map to their public artifact types', () => {
    expect(CedarArtifactType.forYamlArtifactType(YamlArtifactType.TEXTFIELD)).toBe(CedarArtifactType.TEMPLATE_FIELD);
    expect(CedarArtifactType.forYamlArtifactType(YamlArtifactType.IMAGE)).toBe(CedarArtifactType.STATIC_TEMPLATE_FIELD);
    expect(CedarArtifactType.forYamlArtifactType(YamlArtifactType.TEMPLATE_INSTANCE)).toBe(CedarArtifactType.TEMPLATE_INSTANCE);
    expect(CedarArtifactType.forYamlArtifactType(YamlArtifactType.NULL)).toBe(CedarArtifactType.NULL);
  });

  test('ISO dates preserve positive offsets, accept zone-less input, and represent null', () => {
    expect(IsoDate.NULL.getValue()).toBeNull();
    expect(IsoDate.forValue('2024-03-12T10:03:57+02:30').getValue()).toBe('2024-03-12T10:03:57+02:30');
    expect(IsoDate.forValue('2024-03-12T10:03:57').getValue()).toBe('2024-03-12T10:03:57Z');

    const offset = jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-90);
    expect(IsoDate.getCurrentGMTOffset()).toBe('+01:30');
    offset.mockRestore();
  });

  test('annotations return stored values and a clear result for unknown names', () => {
    const annotations = new Annotations();
    const annotation = new AnnotationAtValue('study', 'CEDAR');
    annotations.add(annotation);

    expect(annotations.get('study')).toBe(annotation);
    expect(annotations.get('missing')).toBeNull();
  });

  test('YAML parsing results distinguish warnings, errors, and merged results', () => {
    const warning = new ComparisonError('warning', YamlComparisonErrorType.VALUE_MISMATCH, new JsonPath('warning'));
    const error = new ComparisonError('error', YamlComparisonErrorType.VALUE_MISMATCH, new JsonPath('error'));
    const result = new YamlArtifactParsingResult();

    expect(result.wasSuccessful()).toBe(true);
    expect(result.adheresToBlueprint()).toBe(true);
    result.addBlueprintComparisonWarning(warning);
    expect(result.wasSuccessful()).toBe(true);
    expect(result.adheresToBlueprint()).toBe(false);

    const failed = new YamlArtifactParsingResult();
    failed.addBlueprintComparisonError(error);
    result.merge(failed);
    expect(result.wasSuccessful()).toBe(false);
    expect(result.adheresToBlueprint()).toBe(false);
    expect(result.getBlueprintComparisonErrorCount()).toBe(1);
    expect(result.getBlueprintComparisonWarningCount()).toBe(1);
  });
});
