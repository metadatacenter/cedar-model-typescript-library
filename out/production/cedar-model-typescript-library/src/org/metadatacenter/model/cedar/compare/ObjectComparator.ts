import { Node } from '../types/Node';
import { ParsingResult } from './ParsingResult';
import { ComparisonError } from './ComparisonError';
import { Primitive } from '../types/Primitive';

type ComparableObject = Node;

export class ObjectComparator {
  static compare(
    comparisonResult: ParsingResult,
    blueprintObject: ComparableObject,
    realObject: ComparableObject,
    path: string,
  ): ParsingResult {
    function recurse(currentPath: string, obj1: ComparableObject, obj2: ComparableObject) {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

      allKeys.forEach((key) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        if (!(key in obj1)) {
          comparisonResult.addComparisonError(new ComparisonError('unexpectedInRealObject', newPath));
        } else if (!(key in obj2)) {
          comparisonResult.addComparisonError(new ComparisonError('missingInRealObject', newPath));
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
          recurse(newPath, obj1[key] as ComparableObject, obj2[key] as ComparableObject);
        } else if (obj1[key] !== obj2[key]) {
          comparisonResult.addComparisonError(
            new ComparisonError('valueMismatch', newPath, obj1[key] as Primitive, obj2[key] as Primitive),
          );
        }
      });
    }

    recurse(path, blueprintObject, realObject);
    return comparisonResult;
  }

  static comparePrimitive(comparisonResult: ParsingResult, blue: Primitive, actual: Primitive, path: string): ParsingResult {
    if (blue !== actual) {
      comparisonResult.addComparisonError(new ComparisonError('artifactTypeMismatch', path, blue, actual));
    }
    return comparisonResult;
  }
}
