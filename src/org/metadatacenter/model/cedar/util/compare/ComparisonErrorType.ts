export const ComparisonErrorTypeValues = {
  MISSING_KEY_IN_REAL_OBJECT: 'missingKeyInRealObject',
  UNEXPECTED_KEY_IN_REAL_OBJECT: 'unexpectedKeyInRealObject',
  VALUE_MISMATCH: 'valueMismatch',
  MISSING_INDEX_IN_REAL_OBJECT: 'missingIndexInRealObject',
  UNEXPECTED_INDEX_IN_REAL_OBJECT: 'unexpectedIndexInRealObject',
  MISSING_VALUE_IN_REAL_OBJECT: 'missingValueInRealObject',
  UNEXPECTED_VALUE_IN_REAL_OBJECT: 'unexpectedValueInRealObject',
} as const;

export type ComparisonErrorTypeValue = (typeof ComparisonErrorTypeValues)[keyof typeof ComparisonErrorTypeValues] | null;

export class ComparisonErrorType {
  private readonly value: ComparisonErrorTypeValue | null;

  private constructor(value: ComparisonErrorTypeValue) {
    this.value = value;
  }

  public getValue(): ComparisonErrorTypeValue {
    return this.value;
  }

  public static MISSING_KEY_IN_REAL_OBJECT = new ComparisonErrorType(ComparisonErrorTypeValues.MISSING_KEY_IN_REAL_OBJECT);
  public static UNEXPECTED_KEY_IN_REAL_OBJECT = new ComparisonErrorType(ComparisonErrorTypeValues.UNEXPECTED_KEY_IN_REAL_OBJECT);
  public static VALUE_MISMATCH = new ComparisonErrorType(ComparisonErrorTypeValues.VALUE_MISMATCH);
  public static MISSING_INDEX_IN_REAL_OBJECT = new ComparisonErrorType(ComparisonErrorTypeValues.MISSING_INDEX_IN_REAL_OBJECT);
  public static UNEXPECTED_INDEX_IN_REAL_OBJECT = new ComparisonErrorType(ComparisonErrorTypeValues.UNEXPECTED_INDEX_IN_REAL_OBJECT);
  public static MISSING_VALUE_IN_REAL_OBJECT = new ComparisonErrorType(ComparisonErrorTypeValues.MISSING_VALUE_IN_REAL_OBJECT);
  public static UNEXPECTED_VALUE_IN_REAL_OBJECT = new ComparisonErrorType(ComparisonErrorTypeValues.UNEXPECTED_VALUE_IN_REAL_OBJECT);
  public static NULL = new ComparisonErrorType(null);

  public static values(): ComparisonErrorType[] {
    return [
      ComparisonErrorType.MISSING_KEY_IN_REAL_OBJECT,
      ComparisonErrorType.UNEXPECTED_KEY_IN_REAL_OBJECT,
      ComparisonErrorType.VALUE_MISMATCH,
      ComparisonErrorType.MISSING_INDEX_IN_REAL_OBJECT,
      ComparisonErrorType.UNEXPECTED_INDEX_IN_REAL_OBJECT,
      ComparisonErrorType.MISSING_VALUE_IN_REAL_OBJECT,
      ComparisonErrorType.UNEXPECTED_VALUE_IN_REAL_OBJECT,
    ];
  }

  public static forValue(value: string | null): ComparisonErrorType {
    for (const status of ComparisonErrorType.values()) {
      if (status.getValue() === value) {
        return status;
      }
    }
    return this.NULL;
  }

  // noinspection JSUnusedGlobalSymbols
  toJSON() {
    return this.value;
  }
}
