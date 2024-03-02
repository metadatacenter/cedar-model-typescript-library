import { Primitive } from '../types/Primitive';
import { CedarJsonPath } from '../path/CedarJsonPath';
import { ComparisonErrorType } from './ComparisonErrorType';

export class ComparisonError {
  public readonly errorType: ComparisonErrorType;
  public readonly errorPath: CedarJsonPath;
  public readonly expectedValue?: Primitive;
  public readonly encounteredValue?: Primitive;

  constructor(errorType: ComparisonErrorType, errorPath: CedarJsonPath, expectedValue?: Primitive, encounteredValue?: Primitive) {
    this.errorType = errorType;
    this.errorPath = errorPath;
    this.expectedValue = expectedValue;
    this.encounteredValue = encounteredValue;
  }
}
