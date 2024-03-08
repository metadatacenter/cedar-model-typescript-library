import { Primitive } from '../../types/basic-types/Primitive';
import { CedarJsonPath } from '../path/CedarJsonPath';
import { ComparisonErrorType } from './ComparisonErrorType';

export class ComparisonError {
  public readonly errorType: ComparisonErrorType;
  public readonly errorPath: CedarJsonPath;
  public readonly expectedValue?: Primitive;
  public readonly encounteredValue?: Primitive;
  // public stackTopLines?: string[];

  constructor(errorType: ComparisonErrorType, errorPath: CedarJsonPath, expectedValue?: Primitive, encounteredValue?: Primitive) {
    this.errorType = errorType;
    this.errorPath = errorPath;
    this.expectedValue = expectedValue;
    this.encounteredValue = encounteredValue;
    //    this.parseStackTrace();
  }
  // private parseStackTrace() {
  //   const logError = new Error();
  //   if (logError && logError.stack) {
  //     const stackLines = logError.stack.split('\n');
  //     // Store the top three lines of the stack, excluding the constructs
  //     this.stackTopLines = stackLines.slice(3, 6);
  //   }
  // }
}
