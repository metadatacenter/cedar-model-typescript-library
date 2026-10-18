/** Facts are independent of the context in which an artifact is saved. */
export type ValidationCategory = 'structural' | 'constraint' | 'completeness' | 'verification';
export type ValidationContext = 'instance' | 'template';
export type VerificationStatus = 'passed' | 'failed' | 'notChecked' | 'unavailable';

export interface ValidationFinding {
  code: string;
  category: ValidationCategory;
  /** RFC 6901 JSON Pointer, including array indexes and the offending property. */
  path: string;
  message: string;
  verificationStatus?: VerificationStatus;
}

export interface ValidationSummary {
  findings: ValidationFinding[];
  structurallyValid: boolean;
  canSave: boolean;
  /** False also when an applicable check was omitted or could not complete. */
  isValid: boolean;
}

/** Shared save policy. Unknown codes fail closed as structural defects. */
export class ValidationPolicy {
  private static readonly constraints = new Set([
    'minLength',
    'maxLength',
    'regex',
    'pattern',
    'email',
    'link',
    'phoneNumber',
    'minValue',
    'maxValue',
    'decimalPlace',
    'temporalGranularity',
    'timezone',
    'choiceMembership',
    'maxItems',
    'controlledTermMembership',
    'authorityIdentifier',
    'authorityMembership',
  ]);
  private static readonly completeness = new Set(['required', 'minItems']);
  private static readonly verification = new Set([
    'regexPending',
    'regexEvaluation',
    'regexUnavailable',
    'semanticNotChecked',
    'semanticUnavailable',
    'controlledTermVerified',
    'authorityVerified',
  ]);

  /** A semantic service response is evidence only for its documented check and outcome. */
  static acceptsSemanticResult(controlled: boolean, status: unknown, code: unknown): boolean {
    switch (status) {
      case 'passed':
        return code === (controlled ? 'controlledTermVerified' : 'authorityVerified');
      case 'failed':
        return controlled ? code === 'controlledTermMembership' : code === 'authorityIdentifier' || code === 'authorityMembership';
      case 'notChecked':
        return code === 'semanticNotChecked';
      case 'unavailable':
        return code === 'semanticUnavailable';
      default:
        return false;
    }
  }

  static category(code: string): ValidationCategory {
    if (this.constraints.has(code)) return 'constraint';
    if (this.completeness.has(code)) return 'completeness';
    if (this.verification.has(code)) return 'verification';
    return 'structural';
  }

  static blocksSave(code: string | ValidationFinding, context: ValidationContext = 'instance'): boolean {
    if (typeof code !== 'string' && code.verificationStatus === 'passed') return false;
    const category = typeof code === 'string' ? this.category(code) : code.category;
    return (
      category === 'structural' ||
      (context === 'template' && (category !== 'verification' || (typeof code !== 'string' && code.verificationStatus === 'failed')))
    );
  }

  static severity(code: string, context: ValidationContext = 'instance'): 'error' | 'warning' {
    return this.blocksSave(code, context) ? 'error' : 'warning';
  }

  static finding(code: string, path: string, message: string, verificationStatus?: VerificationStatus): ValidationFinding {
    const finding: ValidationFinding = { code, category: this.category(code), path, message };
    if (verificationStatus !== undefined) finding.verificationStatus = verificationStatus;
    return finding;
  }

  static summarize(findings: readonly ValidationFinding[], context: ValidationContext = 'instance'): ValidationSummary {
    const actionable = findings.filter((f) => f.verificationStatus !== 'passed');
    return {
      findings: [...findings],
      structurallyValid: !actionable.some((f) => f.category === 'structural'),
      canSave: !actionable.some((f) => this.blocksSave(f, context)),
      isValid: actionable.length === 0,
    };
  }

  static pointer(path: readonly (string | number)[]): string {
    return path.map((p) => '/' + String(p).replace(/~/g, '~0').replace(/\//g, '~1')).join('');
  }

  static child(path: string, property: string | number): string {
    return path + this.pointer([property]);
  }
}
