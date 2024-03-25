export const JSONReaderBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JSONReaderBehaviorValue = (typeof JSONReaderBehaviorValues)[keyof typeof JSONReaderBehaviorValues] | null;

export class JSONReaderBehavior {
  private readonly value: JSONReaderBehaviorValue | null;
  private readonly _includeBiboInContext: boolean;

  private constructor(value: JSONReaderBehaviorValue, includeBiboInContext: boolean) {
    this.value = value;
    this._includeBiboInContext = includeBiboInContext;
  }

  public getValue(): JSONReaderBehaviorValue {
    return this.value;
  }

  public static STRICT = new JSONReaderBehavior(JSONReaderBehaviorValues.STRICT, true);
  public static FEBRUARY_2024 = new JSONReaderBehavior(JSONReaderBehaviorValues.FEBRUARY_2024, true);

  includeBiboInContext(): boolean {
    return this._includeBiboInContext;
  }
}
