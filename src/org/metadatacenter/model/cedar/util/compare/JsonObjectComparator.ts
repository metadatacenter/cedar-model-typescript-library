import { JsonArtifactParsingResult } from './JsonArtifactParsingResult';
import { ComparisonError } from './ComparisonError';
import { Primitive } from '../../types/basic-types/Primitive';
import { JsonPath } from '../path/JsonPath';
import { ComparisonErrorType } from './ComparisonErrorType';
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
            if (behavior.useWarningForKnownIssues() && newPath.endsIn(JsonSchema.properties, JsonSchema.atLanguage)) {
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
                newPath.endsIn(CedarModel.ui, CedarModel.pages))
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
            comparisonResult.addBlueprintComparisonError(
              new ComparisonError('oco03', ComparisonErrorType.VALUE_MISMATCH, newPath, obj1[key] as Primitive, obj2[key] as Primitive),
            );
          }
        });
      }
    }

    recurse(path, blueprintObject, realObject);
  }

  static compareToLeft(
    comparisonResult: JsonArtifactParsingResult,
    blueprintObject: ComparableObject,
    realObject: ComparableObject,
    path: JsonPath,
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
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('ola01', ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT, newPath, element),
              );
            }
          });
        } else {
          // Original, order-sensitive comparison
          obj1.forEach((item, index) => {
            const newPath = currentPath.add(index);
            if (!(index in obj2)) {
              comparisonResult.addBlueprintComparisonError(
                new ComparisonError('oll01', ComparisonErrorType.MISSING_INDEX_IN_REAL_OBJECT, newPath, obj1[index]),
              );
            } else if (typeof item === 'object' && item !== null && typeof obj2[index] === 'object' && obj2[index] !== null) {
              recurse(newPath, item as ComparableObject, obj2[index] as ComparableObject);
            } else if (item !== obj2[index]) {
              comparisonResult.addBlueprintComparisonError(
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
            comparisonResult.addBlueprintComparisonError(
              new ComparisonError('olo01', ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT, newPath),
            );
          } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
            recurse(newPath, obj1[key] as ComparableObject, obj2[key] as ComparableObject);
          } else if (obj1[key] !== obj2[key]) {
            comparisonResult.addBlueprintComparisonError(
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
