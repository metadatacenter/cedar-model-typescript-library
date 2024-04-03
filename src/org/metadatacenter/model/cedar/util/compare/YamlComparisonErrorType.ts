export const YamlComparisonErrorTypeValues = {
  MISSING_KEY_IN_RIGHT_OBJECT: 'missingKeyInRightObject',
  UNEXPECTED_KEY_IN_RIGHT_OBJECT: 'unexpectedKeyInRightObject',
  VALUE_MISMATCH: 'valueMismatch',
  MISSING_INDEX_IN_RIGHT_OBJECT: 'missingIndexInRightObject',
  UNEXPECTED_INDEX_IN_RIGHT_OBJECT: 'unexpectedIndexInRightObject',
  MISSING_VALUE_IN_RIGHT_OBJECT: 'missingValueInRightObject',
  UNEXPECTED_VALUE_IN_RIGHT_OBJECT: 'unexpectedValueInRightObject',
} as const;

export type YamlComparisonErrorTypeValue = (typeof YamlComparisonErrorTypeValues)[keyof typeof YamlComparisonErrorTypeValues] | null;

export class YamlComparisonErrorType {
  private readonly value: YamlComparisonErrorTypeValue | null;

  private constructor(value: YamlComparisonErrorTypeValue) {
    this.value = value;
  }

  public getValue(): YamlComparisonErrorTypeValue {
    return this.value;
  }

  public static MISSING_KEY_IN_RIGHT_OBJECT = new YamlComparisonErrorType(YamlComparisonErrorTypeValues.MISSING_KEY_IN_RIGHT_OBJECT);
  public static UNEXPECTED_KEY_IN_RIGHT_OBJECT = new YamlComparisonErrorType(YamlComparisonErrorTypeValues.UNEXPECTED_KEY_IN_RIGHT_OBJECT);
  public static VALUE_MISMATCH = new YamlComparisonErrorType(YamlComparisonErrorTypeValues.VALUE_MISMATCH);
  public static MISSING_INDEX_IN_RIGHT_OBJECT = new YamlComparisonErrorType(YamlComparisonErrorTypeValues.MISSING_INDEX_IN_RIGHT_OBJECT);
  public static UNEXPECTED_INDEX_IN_RIGHT_OBJECT = new YamlComparisonErrorType(
    YamlComparisonErrorTypeValues.UNEXPECTED_INDEX_IN_RIGHT_OBJECT,
  );
  public static MISSING_VALUE_IN_RIGHT_OBJECT = new YamlComparisonErrorType(YamlComparisonErrorTypeValues.MISSING_VALUE_IN_RIGHT_OBJECT);
  public static UNEXPECTED_VALUE_IN_RIGHT_OBJECT = new YamlComparisonErrorType(
    YamlComparisonErrorTypeValues.UNEXPECTED_VALUE_IN_RIGHT_OBJECT,
  );
  public static NULL = new YamlComparisonErrorType(null);

  public static values(): YamlComparisonErrorType[] {
    return [
      YamlComparisonErrorType.MISSING_KEY_IN_RIGHT_OBJECT,
      YamlComparisonErrorType.UNEXPECTED_KEY_IN_RIGHT_OBJECT,
      YamlComparisonErrorType.VALUE_MISMATCH,
      YamlComparisonErrorType.MISSING_INDEX_IN_RIGHT_OBJECT,
      YamlComparisonErrorType.UNEXPECTED_INDEX_IN_RIGHT_OBJECT,
      YamlComparisonErrorType.MISSING_VALUE_IN_RIGHT_OBJECT,
      YamlComparisonErrorType.UNEXPECTED_VALUE_IN_RIGHT_OBJECT,
    ];
  }

  public static forValue(value: string | null): YamlComparisonErrorType {
    for (const status of YamlComparisonErrorType.values()) {
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
