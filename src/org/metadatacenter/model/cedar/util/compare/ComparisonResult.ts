import { ComparisonError } from './ComparisonError';

export class ComparisonResult {
  private comparisonErrors: Array<ComparisonError> = [];
  private comparisonWarnings: Array<ComparisonError> = [];

  public addComparisonError(error: ComparisonError) {
    this.comparisonErrors.push(error);
  }

  public getComparisonErrors(): Array<ComparisonError> {
    return this.comparisonErrors;
  }

  getComparisonErrorCount() {
    return this.comparisonErrors.length;
  }

  public addComparisonWarning(warning: ComparisonError) {
    this.comparisonWarnings.push(warning);
  }

  public getComparisonWarnings(): Array<ComparisonError> {
    return this.comparisonWarnings;
  }

  getComparisonWarningCount() {
    return this.comparisonWarnings.length;
  }

  public areEqual(): boolean {
    return this.comparisonErrors.length === 0 && this.comparisonWarnings.length === 0;
  }

  merge(otherResult: ComparisonResult) {
    this.comparisonErrors.push(...otherResult.comparisonErrors);
    this.comparisonWarnings.push(...otherResult.comparisonWarnings);
  }
}
