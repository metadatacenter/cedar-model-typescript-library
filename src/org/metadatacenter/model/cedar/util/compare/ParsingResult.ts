import { ComparisonError } from './ComparisonError';

export class ParsingResult {
  private blueprintComparisonErrors: Array<ComparisonError> = [];

  public addBlueprintComparisonError(error: ComparisonError) {
    this.blueprintComparisonErrors.push(error);
  }

  public wasSuccessful(): boolean {
    return this.blueprintComparisonErrors.length === 0;
  }

  public adheresToBlueprint(): boolean {
    return this.blueprintComparisonErrors.length === 0;
  }

  public getBlueprintComparisonErrors(): Array<ComparisonError> {
    return this.blueprintComparisonErrors;
  }

  getBlueprintComparisonErrorCount() {
    return this.blueprintComparisonErrors.length;
  }

  merge(otherResult: ParsingResult) {
    this.blueprintComparisonErrors.push(...otherResult.blueprintComparisonErrors);
  }
}
