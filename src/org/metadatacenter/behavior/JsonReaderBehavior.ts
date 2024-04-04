import { ReaderWriterBehavior } from './ReaderWriterBehavior';

export const JsonReaderBehaviorValues = {
  STRICT: 'strict',
  FEBRUARY_2024: 'february-2024',
} as const;

export type JsonReaderBehaviorValue = (typeof JsonReaderBehaviorValues)[keyof typeof JsonReaderBehaviorValues] | null;

export class JsonReaderBehavior extends ReaderWriterBehavior {
  private readonly value: JsonReaderBehaviorValue | null;

  private constructor(value: JsonReaderBehaviorValue, useWarningForKnownIssues: boolean) {
    super(useWarningForKnownIssues);
    this.value = value;
  }

  public getValue(): JsonReaderBehaviorValue {
    return this.value;
  }

  public static STRICT = new JsonReaderBehavior(JsonReaderBehaviorValues.STRICT, false);
  public static FEBRUARY_2024 = new JsonReaderBehavior(JsonReaderBehaviorValues.FEBRUARY_2024, true);
}
