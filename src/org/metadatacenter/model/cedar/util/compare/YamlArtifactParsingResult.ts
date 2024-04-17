import { ComparisonError } from './ComparisonError';

export class YamlArtifactParsingResult {
  private blueprintComparisonErrors: Array<ComparisonError> = [];
  private blueprintComparisonWarnings: Array<ComparisonError> = [];

  public addBlueprintComparisonError(error: ComparisonError) {
    this.blueprintComparisonErrors.push(error);
  }

  public getBlueprintComparisonErrors(): Array<ComparisonError> {
    return this.blueprintComparisonErrors;
  }

  getBlueprintComparisonErrorCount() {
    return this.blueprintComparisonErrors.length;
  }

  public addBlueprintComparisonWarning(warning: ComparisonError) {
    this.blueprintComparisonWarnings.push(warning);
  }

  public getBlueprintComparisonWarnings(): Array<ComparisonError> {
    return this.blueprintComparisonWarnings;
  }

  getBlueprintComparisonWarningCount() {
    return this.blueprintComparisonWarnings.length;
  }

  public wasSuccessful(): boolean {
    return this.blueprintComparisonErrors.length === 0;
  }

  public adheresToBlueprint(): boolean {
    return this.blueprintComparisonErrors.length === 0;
  }

  merge(otherResult: YamlArtifactParsingResult) {
    this.blueprintComparisonErrors.push(...otherResult.blueprintComparisonErrors);
    this.blueprintComparisonWarnings.push(...otherResult.blueprintComparisonWarnings);
  }
}
