import { ComparisonError } from './ComparisonError';
import { ComparisonErrorType } from './ComparisonErrorType';
import { JsonPath } from '../path/JsonPath';
import { ValidationContext, ValidationFinding, ValidationPolicy, ValidationSummary } from '../../../../policy/ValidationPolicy';

export class JsonArtifactParsingResult {
  private blueprintComparisonErrors: Array<ComparisonError> = [];
  private blueprintComparisonWarnings: Array<ComparisonError> = [];
  private validationFindings: ValidationFinding[] = [];

  /** Structured validation facts, separate from the legacy parser-comparison diagnostics. */
  public getValidationFindings(): ValidationFinding[] {
    return [...this.validationFindings];
  }

  public addValidationFinding(
    finding: ValidationFinding,
    context: ValidationContext = 'instance',
    legacyDiagnostic?: ComparisonError,
  ): void {
    if (this.validationFindings.some((f) => f.code === finding.code && f.path === finding.path)) return;
    this.validationFindings.push(finding);
    if (finding.verificationStatus === 'passed') return;
    const diagnostic =
      legacyDiagnostic ??
      new ComparisonError('ValidationPolicy', ComparisonErrorType.VALUE_MISMATCH, JsonPath.fromPointer(finding.path), finding.message);
    if (ValidationPolicy.blocksSave(finding, context)) this.addBlueprintComparisonError(diagnostic);
    else this.addBlueprintComparisonWarning(diagnostic);
  }

  public getValidationReport(context: ValidationContext = 'instance'): ValidationSummary {
    const findings = [...this.validationFindings];
    for (const error of this.blueprintComparisonErrors) {
      if (error.errorLocation === 'ValidationPolicy') continue;
      const code = error.errorType === ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT ? 'missingProperty' : 'valueShape';
      findings.push(ValidationPolicy.finding(code, error.errorPath.toPointer(), `Invalid structure: ${error.errorType}.`));
    }
    return ValidationPolicy.summarize(findings, context);
  }

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
   * The two were identical implementations until warnings carried real signal;
   * once a reader started recording production variations as warnings rather
   * than rejecting them, "it read cleanly" and "it is in the canonical form"
   * stopped being the same claim, and the stricter one had nowhere to live.
   *
   * A template CEDAR served in 2018 is the case that makes the difference
   * concrete: it reads, so `wasSuccessful` is true, but it does not adhere, so
   * this is false. Which one a caller wants depends on whether it is about to
   * consume the artifact or about to judge it.
   */
  public adheresToBlueprint(): boolean {
    return this.blueprintComparisonErrors.length === 0 && this.blueprintComparisonWarnings.length === 0;
  }

  merge(otherResult: JsonArtifactParsingResult) {
    this.blueprintComparisonErrors.push(...otherResult.blueprintComparisonErrors);
    this.blueprintComparisonWarnings.push(...otherResult.blueprintComparisonWarnings);
    this.validationFindings.push(...otherResult.validationFindings);
  }
}
