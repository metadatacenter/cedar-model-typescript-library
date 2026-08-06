import {
  ComparisonErrorType,
  ComparisonResult,
  JsonArtifactParsingResult,
  JsonNode,
  JsonObjectComparator,
  JsonPath,
  JsonSchema,
  YamlObjectComparator,
} from '../../../../../../../src';
import { JsonReaderBehavior } from '../../../../../../../src/org/metadatacenter/behavior/JsonReaderBehavior';

const comparable = (value: unknown): JsonNode => value as JsonNode;

describe('JSON object comparison edge cases', () => {
  test('reports ordered-array length, nested-value, and value differences', () => {
    const result = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      result,
      comparable([1, { nested: 'left' }, 3]),
      comparable([1, { nested: 'right' }, 4, 5]),
      new JsonPath('items'),
      JsonReaderBehavior.STRICT,
    );
    JsonObjectComparator.compareBothWays(result, comparable([1, 2]), comparable([1]), new JsonPath('shorter'), JsonReaderBehavior.STRICT);

    expect(result.getBlueprintComparisonErrors().map((error) => error.errorLocation)).toEqual(
      expect.arrayContaining(['ocl01', 'ocl02', 'ocl03', 'oco03']),
    );
  });

  test('treats a required list as a set while reporting missing and unexpected values', () => {
    const result = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      result,
      comparable(['alpha', 'beta']),
      comparable(['beta', 'gamma']),
      new JsonPath(JsonSchema.required),
      JsonReaderBehavior.STRICT,
    );

    expect(result.getBlueprintComparisonErrors().map((error) => error.errorLocation)).toEqual(['oca01', 'oca02']);
  });

  test('reports object shape differences but permits explicitly accepted keys', () => {
    const result = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      result,
      comparable({ nested: { value: 1 }, missing: true, changed: 'left' }),
      comparable({ nested: { value: 2 }, unexpected: true, changed: 'right', accepted: true }),
      new JsonPath(),
      JsonReaderBehavior.STRICT,
      ['accepted'],
    );

    expect(result.getBlueprintComparisonErrors().map((error) => error.errorLocation)).toEqual(
      expect.arrayContaining(['oco01', 'oco02', 'oco03']),
    );
    expect(result.getBlueprintComparisonErrors().some((error) => error.errorPath.toString() === '/accepted/')).toBe(false);
  });

  test('downgrades known production variations only under the tolerant behavior', () => {
    const result = new JsonArtifactParsingResult();
    JsonObjectComparator.compareBothWays(
      result,
      comparable({ additionalProperties: false }),
      comparable({ additionalProperties: true, legacyPrefix: 'https://example.org/' }),
      new JsonPath(JsonSchema.atContext),
      JsonReaderBehavior.FEBRUARY_2024,
    );

    expect(result.wasSuccessful()).toBe(true);
    expect(result.adheresToBlueprint()).toBe(false);
    expect(result.getBlueprintComparisonWarningCount()).toBe(2);
  });

  test('one-sided comparison reports ordered, set-like, and object differences', () => {
    const result = new JsonArtifactParsingResult();
    JsonObjectComparator.compareToLeft(
      result,
      comparable([1, { nested: 'left' }, 3]),
      comparable([2, { nested: 'right' }]),
      new JsonPath('items'),
      JsonReaderBehavior.STRICT,
    );
    JsonObjectComparator.compareToLeft(
      result,
      comparable(['required']),
      comparable([]),
      new JsonPath(JsonSchema.required),
      JsonReaderBehavior.STRICT,
    );
    JsonObjectComparator.compareToLeft(
      result,
      comparable({ missing: true, nested: { value: 'left' } }),
      comparable({ nested: { value: 'right' } }),
      new JsonPath(),
      JsonReaderBehavior.STRICT,
    );

    expect(result.getBlueprintComparisonErrors().map((error) => error.errorLocation)).toEqual(
      expect.arrayContaining(['oll01', 'oll02', 'ola01', 'olo01', 'olo02']),
    );
  });

  test('primitive comparison distinguishes equality from a mismatch', () => {
    const result = new JsonArtifactParsingResult();
    JsonObjectComparator.comparePrimitive(result, 'same', 'same', new JsonPath('equal'));
    JsonObjectComparator.comparePrimitive(result, 'expected', 'actual', new JsonPath('different'));

    expect(result.getBlueprintComparisonErrorCount()).toBe(1);
    expect(result.getBlueprintComparisonErrors()[0].errorType).toBe(ComparisonErrorType.VALUE_MISMATCH);
  });
});

describe('YAML object comparison edge cases', () => {
  test('reports array length, nested-value, and value differences', () => {
    const result = new ComparisonResult();
    YamlObjectComparator.compareBothWays(
      result,
      comparable([1, { nested: 'left' }, 3]),
      comparable([1, { nested: 'right' }, 4, 5]),
      new JsonPath(),
    );
    YamlObjectComparator.compareBothWays(result, comparable([1, 2]), comparable([1]), new JsonPath('shorter'));

    expect(result.getComparisonErrors().map((error) => error.errorLocation)).toEqual(
      expect.arrayContaining(['ocl01', 'ocl02', 'ocl03', 'oco03']),
    );
  });

  test('reports missing, unexpected, nested, and changed object properties', () => {
    const result = YamlObjectComparator.compare(
      comparable({ nested: { value: 1 }, missing: true, changed: 'left' }),
      comparable({ nested: { value: 2 }, unexpected: true, changed: 'right' }),
    );

    expect(result.areEqual()).toBe(false);
    expect(result.getComparisonErrors().map((error) => error.errorLocation)).toEqual(expect.arrayContaining(['oco01', 'oco02', 'oco03']));
  });
});
