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

  /**
   * Nothing went wrong that stops a caller using what was read.
   *
   * Errors only. A document that parsed with warnings produced a usable
   * artifact — the warnings say it was written in a form the blueprint no longer
   * describes, not that reading it failed.
   */
  public wasSuccessful(): boolean {
    return this.blueprintComparisonErrors.length === 0;
  }

  /**
   * The document matches the blueprint exactly.
   *
   * Errors *and* warnings, which is what separates this from `wasSuccessful`.
   * See the JSON counterpart for why the two stopped meaning the same thing.
   */
  public adheresToBlueprint(): boolean {
    return this.blueprintComparisonErrors.length === 0 && this.blueprintComparisonWarnings.length === 0;
  }

  merge(otherResult: YamlArtifactParsingResult) {
    this.blueprintComparisonErrors.push(...otherResult.blueprintComparisonErrors);
    this.blueprintComparisonWarnings.push(...otherResult.blueprintComparisonWarnings);
  }
}
