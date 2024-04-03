import { ComparisonError } from './ComparisonError';
import { JsonPath } from '../path/JsonPath';
import { YamlComparisonErrorType } from './YamlComparisonErrorType';
import { ComparisonResult } from './ComparisonResult';
import { Primitive } from '../../types/basic-types/Primitive';
import { ComparableObject } from './ComparableObject';

export class YamlObjectComparator {
  static compare(leftObject: ComparableObject, rightObject: ComparableObject): ComparisonResult {
    const result = new ComparisonResult();
    this.compareBothWays(result, leftObject, rightObject, new JsonPath());
    return result;
  }

  static compareBothWays(
    comparisonResult: ComparisonResult,
    leftObject: ComparableObject,
    rightObject: ComparableObject,
    path: JsonPath,
  ): void {
    function recurse(currentPath: JsonPath, obj1: ComparableObject, obj2: ComparableObject) {
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // Handle arrays (lists) comparison

        // Original order-sensitive comparison
        const maxLength = Math.max(obj1.length, obj2.length);
        for (let index = 0; index < maxLength; index++) {
          const newPath = currentPath.add(index);
          if (!(index in obj1)) {
            comparisonResult.addComparisonError(
              new ComparisonError('ocl01', YamlComparisonErrorType.UNEXPECTED_INDEX_IN_RIGHT_OBJECT, newPath, undefined, obj2[index]),
            );
          } else if (!(index in obj2)) {
            comparisonResult.addComparisonError(
              new ComparisonError('ocl02', YamlComparisonErrorType.MISSING_INDEX_IN_RIGHT_OBJECT, newPath, obj1[index]),
            );
          } else if (typeof obj1[index] === 'object' && obj1[index] !== null && typeof obj2[index] === 'object' && obj2[index] !== null) {
            recurse(newPath, obj1[index] as ComparableObject, obj2[index] as ComparableObject);
          } else if (obj1[index] !== obj2[index]) {
            comparisonResult.addComparisonError(
              new ComparisonError(
                'ocl03',
                YamlComparisonErrorType.VALUE_MISMATCH,
                newPath,
                obj1[index] as Primitive,
                obj2[index] as Primitive,
              ),
            );
          }
        }
      } else {
        // Handle objects (maps) comparison
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        allKeys.forEach((key) => {
          const newPath = currentPath.add(key);
          if (!(key in obj1)) {
            comparisonResult.addComparisonError(
              new ComparisonError('oco01', YamlComparisonErrorType.UNEXPECTED_KEY_IN_RIGHT_OBJECT, newPath),
            );
          } else if (!(key in obj2)) {
            comparisonResult.addComparisonError(new ComparisonError('oco02', YamlComparisonErrorType.MISSING_KEY_IN_RIGHT_OBJECT, newPath));
          } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
            recurse(newPath, obj1[key] as ComparableObject, obj2[key] as ComparableObject);
          } else if (obj1[key] !== obj2[key]) {
            comparisonResult.addComparisonError(
              new ComparisonError('oco03', YamlComparisonErrorType.VALUE_MISMATCH, newPath, obj1[key] as Primitive, obj2[key] as Primitive),
            );
          }
        });
      }
    }

    recurse(path, leftObject, rightObject);
  }
}
