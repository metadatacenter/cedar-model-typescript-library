import { ComparisonError } from './ComparisonError';

export class ParsingResult {
  private comparisonErrors: Array<ComparisonError> = [];

  public addComparisonError(error: ComparisonError) {
    this.comparisonErrors.push(error);
  }

  public wasSuccessful(): boolean {
    return this.comparisonErrors.length === 0;
  }

  public areEqual(): boolean {
    return this.comparisonErrors.length === 0;
  }

  public getComparisonErrors(): Array<ComparisonError> {
    return this.comparisonErrors;
  }
}
