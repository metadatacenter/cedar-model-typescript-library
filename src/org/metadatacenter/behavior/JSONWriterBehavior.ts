export const JSONWriterBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JSONWriterBehaviorValue = (typeof JSONWriterBehaviorValues)[keyof typeof JSONWriterBehaviorValues] | null;

export class JSONWriterBehavior {
  private readonly value: JSONWriterBehaviorValue | null;

  private constructor(value: JSONWriterBehaviorValue) {
    this.value = value;
  }

  public getValue(): JSONWriterBehaviorValue {
    return this.value;
  }

  public static STRICT = new JSONWriterBehavior(JSONWriterBehaviorValues.STRICT);
  public static FEBRUARY_2024 = new JSONWriterBehavior(JSONWriterBehaviorValues.FEBRUARY_2024);
}
