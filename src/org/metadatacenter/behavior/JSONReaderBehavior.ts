export const JSONReaderBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JSONReaderBehaviorValue = (typeof JSONReaderBehaviorValues)[keyof typeof JSONReaderBehaviorValues] | null;

export class JSONReaderBehavior {
  private readonly value: JSONReaderBehaviorValue | null;

  private constructor(value: JSONReaderBehaviorValue) {
    this.value = value;
  }

  public getValue(): JSONReaderBehaviorValue {
    return this.value;
  }

  public static STRICT = new JSONReaderBehavior(JSONReaderBehaviorValues.STRICT);
  public static FEBRUARY_2024 = new JSONReaderBehavior(JSONReaderBehaviorValues.FEBRUARY_2024);
}
