import { Primitive } from '../types/Primitive';
import { CedarJsonPath } from '../path/CedarJsonPath';

export class ComparisonError {
  public readonly errorType: string;
  public readonly errorPath: CedarJsonPath;
  public readonly expectedValue?: Primitive;
  public readonly encounteredValue?: Primitive;

  constructor(errorType: string, errorPath: CedarJsonPath, expectedValue?: Primitive, encounteredValue?: Primitive) {
    this.errorType = errorType;
    this.errorPath = errorPath;
    this.expectedValue = expectedValue;
    this.encounteredValue = encounteredValue;
  }
}
