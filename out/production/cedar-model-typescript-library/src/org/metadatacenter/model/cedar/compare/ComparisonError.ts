import { Primitive } from '../types/Primitive';

export class ComparisonError {
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
