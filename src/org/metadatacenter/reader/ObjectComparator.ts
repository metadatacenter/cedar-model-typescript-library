import { Node } from '../model/cedar/types/Node';

type Primitive = string | number | boolean;
class ComparisonError {
  public readonly errorType: string;
  public readonly errorPath: string;
  public readonly expectedValue?: Primitive;
  public readonly encounteredValue?: Primitive;
  constructor(errorType: string, errorPath: string, expectedValue?: Primitive, encounteredValue?: Primitive) {
    this.errorType = errorType;
    this.errorPath = errorPath;
    this.expectedValue = expectedValue;
    this.encounteredValue = encounteredValue;
  }
}

type ComparableObject = Node;

class ComparisonResult {
  private errors: Array<ComparisonError> = [];

  public addError(error: ComparisonError) {
    this.errors.push(error);
  }

  public areEqual(): boolean {
    return this.errors.length === 0;
  }

  public getErrors(): Array<ComparisonError> {
    return this.errors;
  }
}

export class ObjectComparator {
  static compare(blueprintObject: ComparableObject, realObject: ComparableObject): ComparisonResult {
    const result = new ComparisonResult();

    function recurse(currentPath: string, obj1: ComparableObject, obj2: ComparableObject) {
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

      allKeys.forEach((key) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        if (!(key in obj1)) {
          result.addError(new ComparisonError('unexpectedInRealObject', newPath));
        } else if (!(key in obj2)) {
          result.addError(new ComparisonError('missingInRealObject', newPath));
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
          recurse(newPath, obj1[key] as ComparableObject, obj2[key] as ComparableObject);
        } else if (obj1[key] !== obj2[key]) {
          result.addError(new ComparisonError('valueMismatch', newPath, obj1[key] as Primitive, obj2[key] as Primitive));
        }
      });
    }

    recurse('', blueprintObject, realObject);
    return result;
  }
}
