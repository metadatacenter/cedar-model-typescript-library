import { JsonArtifactParsingResult } from './JsonArtifactParsingResult';
import { ComparisonError } from './ComparisonError';
import { Primitive } from '../../types/basic-types/Primitive';
import { JsonPath } from '../path/JsonPath';
import { ComparisonErrorType } from './ComparisonErrorType';
import { TemplateProperty } from '../../constants/TemplateProperty';
import { JsonSchema } from '../../constants/JsonSchema';
import { CedarModel } from '../../constants/CedarModel';
import { ReaderWriterBehavior } from '../../../../behavior/ReaderWriterBehavior';
import { ComparableObject } from './ComparableObject';

export class JsonObjectComparator {
  static compareBothWays(
    comparisonResult: JsonArtifactParsingResult,
    blueprintObject: ComparableObject,
    realObject: ComparableObject,
    path: JsonPath,
    behavior: ReaderWriterBehavior,
    acceptDiffKeys: string[] = [],
  ): void {
    function recurse(currentPath: JsonPath, obj1: ComparableObject, obj2: ComparableObject) {
      const isNonOrderSensitive = currentPath.getLastComponent() == JsonSchema.required;

      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // Handle arrays (lists) comparison
        if (isNonOrderSensitive) {
          // Non-order-sensitive comparison
          const obj1Elements = new Set(obj1);
          const obj2Elements = new Set(obj2);

          obj1.forEach((element, index) => {
            const newPath = currentPath.add(index);
            if (!obj2Elements.has(element)) {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('oca01', ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT, newPath, element),
              );
            }
          });

          obj2.forEach((element, index) => {
            const newPath = currentPath.add(index);
            if (!obj1Elements.has(element)) {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('oca02', ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT, newPath, undefined, element),
              );
            }
          });
        } else {
          // Original order-sensitive comparison
          const maxLength = Math.max(obj1.length, obj2.length);
          for (let index = 0; index < maxLength; index++) {
            const newPath = currentPath.add(index);
            if (!(index in obj1)) {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('ocl01', ComparisonErrorType.UNEXPECTED_INDEX_IN_REAL_OBJECT, newPath, undefined, obj2[index]),
              );
            } else if (!(index in obj2)) {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('ocl02', ComparisonErrorType.MISSING_INDEX_IN_REAL_OBJECT, newPath, obj1[index]),
              );
            } else if (typeof obj1[index] === 'object' && obj1[index] !== null && typeof obj2[index] === 'object' && obj2[index] !== null) {
              recurse(newPath, obj1[index] as ComparableObject, obj2[index] as ComparableObject);
            } else if (obj1[index] !== obj2[index]) {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError(
                  'ocl03',
                  ComparisonErrorType.VALUE_MISMATCH,
                  newPath,
                  obj1[index] as Primitive,
                  obj2[index] as Primitive,
                ),
              );
            }
          }
        }
      } else {
        // Handle objects (maps) comparison
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        allKeys.forEach((key) => {
          const newPath = currentPath.add(key);
          if (!(key in obj1)) {
            if (
              behavior.useWarningForKnownIssues() &&
              (newPath.endsIn(JsonSchema.properties, JsonSchema.atLanguage) || JsonObjectComparator.isKnownProductionVariation(newPath))
            ) {
              comparisonResult.addBlueprintComparisonWarning(
                new ComparisonError('wco01', ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT, newPath),
              );
            } else {
              if (!acceptDiffKeys.includes(key)) {
                comparisonResult.addBlueprintComparisonError(
                  new ComparisonError('oco01', ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT, newPath),
                );
              }
            }
          } else if (!(key in obj2)) {
            if (
              behavior.useWarningForKnownIssues() &&
              (newPath.endsIn(CedarModel.literals, JsonPath.ANY, CedarModel.selectedByDefault) ||
                newPath.endsIn(CedarModel.ui, CedarModel.pages) ||
                JsonObjectComparator.isKnownProductionVariation(newPath))
            ) {
              comparisonResult.addBlueprintComparisonWarning(
                new ComparisonError('wco02', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, newPath),
              );
            } else {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('oco02', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, newPath),
              );
            }
          } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
            recurse(newPath, obj1[key] as ComparableObject, obj2[key] as ComparableObject);
          } else if (obj1[key] !== obj2[key]) {
            const error = new ComparisonError(
              'oco03',
              ComparisonErrorType.VALUE_MISMATCH,
              newPath,
              obj1[key] as Primitive,
              obj2[key] as Primitive,
            );
            if (behavior.useWarningForKnownIssues() && JsonObjectComparator.isKnownProductionVariation(newPath)) {
              comparisonResult.addBlueprintComparisonWarning(error);
            } else {
              comparisonResult.addBlueprintComparisonError(error);
            }
          }
        });
      }
    }

    recurse(path, blueprintObject, realObject);
  }

  /**
   * Differences that real CEDAR templates exhibit, and which the library must
   * therefore read rather than reject.
   *
   * The blueprint describes what the library writes today. The corpus contains
   * templates CEDAR served between 2018 and 2024, and 23 of the 123 differ from
   * that blueprint — not because they are broken, but because the canonical form
   * moved while they stayed as they were emitted. A reader that rejects them
   * cannot open documents that demonstrably exist, so each shape below is
   * downgraded to a warning under a behavior that tolerates known issues.
   * `STRICT` still treats every one as an error, which is what makes it strict.
   *
   * The observation is not discarded: it is recorded as a warning and remains
   * retrievable through `getBlueprintComparisonWarnings`.
   *
   *  - **`@context` additionalProperties** — the blueprint pins `false`; older
   *    templates allow further URI-valued entries.
   *  - **`@context` prefixes and required list** — `bibo` and others were added
   *    to the canonical context over time, so earlier documents lack them.
   *  - **an attribute-value field's `@context` enum** — omitted by templates
   *    predating the current attribute-value serialization.
   *  - **`_ui.propertyDescriptions`** — a later addition, absent throughout
   *    documents written before it existed.
   */
  public static isKnownProductionVariation(path: JsonPath): boolean {
    return (
      path.endsIn(JsonSchema.atContext, TemplateProperty.additionalProperties) ||
      path.endsIn(JsonSchema.atContext, JsonSchema.properties, JsonPath.ANY, CedarModel.enum, JsonPath.ANY) ||
      path.endsIn(JsonSchema.atContext, JsonSchema.required, JsonPath.ANY) ||
      path.endsIn(JsonSchema.atContext, JsonPath.ANY) ||
      path.endsIn(CedarModel.ui, CedarModel.propertyDescriptions, JsonPath.ANY) ||
      path.endsIn(CedarModel.ui, CedarModel.propertyDescriptions) ||
      path.endsIn(CedarModel.ui, CedarModel.propertyLabels) ||
      path.endsIn(JsonSchema.properties, JsonPath.ANY, CedarModel.enum, JsonPath.ANY) ||
      path.endsIn(JsonSchema.required)
    );
  }

  /**
   * A one-sided blueprint difference, at the severity the behavior asks for.
   *
   * `compareToLeft` walks the template's `properties` against the blueprint, and
   * it is where the last of the production variations surface: an older
   * `@context` schema whose `additionalProperties` permits further URI entries
   * rather than pinning `false`, and one whose `required` list predates prefixes
   * later added to the canonical context. Both belong to documents CEDAR served,
   * so a reader that rejects them is refusing real data.
   */
  private static reportToLeft(comparisonResult: JsonArtifactParsingResult, behavior: ReaderWriterBehavior, error: ComparisonError): void {
    if (behavior.useWarningForKnownIssues() && JsonObjectComparator.isKnownProductionVariation(error.errorPath)) {
      comparisonResult.addBlueprintComparisonWarning(error);
    } else {
      comparisonResult.addBlueprintComparisonError(error);
    }
  }

  static compareToLeft(
    comparisonResult: JsonArtifactParsingResult,
    blueprintObject: ComparableObject,
    realObject: ComparableObject,
    path: JsonPath,
    behavior: ReaderWriterBehavior,
  ): void {
    function recurse(currentPath: JsonPath, obj1: ComparableObject, obj2: ComparableObject) {
      const isNonOrderSensitive = currentPath.getLastComponent() == JsonSchema.required;

      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // Handle arrays (lists) comparison
        if (isNonOrderSensitive) {
          // Non-order-sensitive comparison
          const obj2Elements = new Set(obj2);

          obj1.forEach((element, index) => {
            const newPath = currentPath.add(index);
            if (!obj2Elements.has(element)) {
              JsonObjectComparator.reportToLeft(
                comparisonResult,
                behavior,
                new ComparisonError('ola01', ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT, newPath, element),
              );
            }
          });
        } else {
          // Original, order-sensitive comparison
          obj1.forEach((item, index) => {
            const newPath = currentPath.add(index);
            if (!(index in obj2)) {
              JsonObjectComparator.reportToLeft(
                comparisonResult,
                behavior,
                new ComparisonError('oll01', ComparisonErrorType.MISSING_INDEX_IN_REAL_OBJECT, newPath, obj1[index]),
              );
            } else if (typeof item === 'object' && item !== null && typeof obj2[index] === 'object' && obj2[index] !== null) {
              recurse(newPath, item as ComparableObject, obj2[index] as ComparableObject);
            } else if (item !== obj2[index]) {
              JsonObjectComparator.reportToLeft(
                comparisonResult,
                behavior,
                new ComparisonError('oll02', ComparisonErrorType.VALUE_MISMATCH, newPath, item as Primitive, obj2[index] as Primitive),
              );
            }
          });
        }
      } else {
        // Handle objects (maps) comparison
        Object.keys(obj1).forEach((key) => {
          const newPath = currentPath.add(key);
          if (!(key in obj2)) {
            JsonObjectComparator.reportToLeft(
              comparisonResult,
              behavior,
              new ComparisonError('olo01', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, newPath),
            );
          } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
            recurse(newPath, obj1[key] as ComparableObject, obj2[key] as ComparableObject);
          } else if (obj1[key] !== obj2[key]) {
            JsonObjectComparator.reportToLeft(
              comparisonResult,
              behavior,
              new ComparisonError('olo02', ComparisonErrorType.VALUE_MISMATCH, newPath, obj1[key] as Primitive, obj2[key] as Primitive),
            );
          }
        });
      }
    }

    recurse(path, blueprintObject, realObject);
  }

  static comparePrimitive(
    comparisonResult: JsonArtifactParsingResult,
    blue: Primitive,
    actual: Primitive,
    path: JsonPath,
  ): JsonArtifactParsingResult {
    if (blue !== actual) {
      comparisonResult.addBlueprintComparisonError(new ComparisonError('opp1', ComparisonErrorType.VALUE_MISMATCH, path, blue, actual));
    }
    return comparisonResult;
  }
}
