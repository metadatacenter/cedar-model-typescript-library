import { Primitive } from '../../types/basic-types/Primitive';
import { JsonPath } from '../path/JsonPath';
import { ComparisonErrorType } from './ComparisonErrorType';
import { YamlComparisonErrorType } from './YamlComparisonErrorType';

export class ComparisonError {
  public readonly errorLocation: string;
  public readonly errorType: ComparisonErrorType | YamlComparisonErrorType;
  public readonly errorPath: JsonPath;
  public readonly expectedValue?: Primitive;
  public readonly encounteredValue?: Primitive;
  public stackTopLines?: string[];

  constructor(
    errorLocation: string,
    errorType: ComparisonErrorType | YamlComparisonErrorType,
    errorPath: JsonPath,
    expectedValue?: Primitive,
    encounteredValue?: Primitive,
  ) {
    this.errorLocation = errorLocation;
    this.errorType = errorType;
    this.errorPath = errorPath;
    this.expectedValue = expectedValue;
    this.encounteredValue = encounteredValue;
    // eslint-disable-next-line no-constant-condition
    if (false) {
      this.parseStackTrace();
    }
  }
  private parseStackTrace() {
    const logError = new Error();
    if (logError && logError.stack) {
      const stackLines = logError.stack.split('\n');
      // Store the top three lines of the stack, excluding the constructs
      this.stackTopLines = stackLines.slice(3, 12);
    }
  }
}
