import { ReaderWriterBehavior } from './ReaderWriterBehavior';

export const JSONReaderBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JSONReaderBehaviorValue = (typeof JSONReaderBehaviorValues)[keyof typeof JSONReaderBehaviorValues] | null;

export class JSONReaderBehavior extends ReaderWriterBehavior {
  private readonly value: JSONReaderBehaviorValue | null;

  private constructor(value: JSONReaderBehaviorValue, useWarningForKnownIssues: boolean) {
    super(useWarningForKnownIssues);
    this.value = value;
  }

  public getValue(): JSONReaderBehaviorValue {
    return this.value;
  }

  public static STRICT = new JSONReaderBehavior(JSONReaderBehaviorValues.STRICT, false);
  public static FEBRUARY_2024 = new JSONReaderBehavior(JSONReaderBehaviorValues.FEBRUARY_2024, true);
}
