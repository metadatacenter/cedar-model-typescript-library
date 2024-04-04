import { ReaderWriterBehavior } from './ReaderWriterBehavior';

export const YAMLWriterBehaviorValues = {
  STRICT: 'strict',
} as const;

export type YAMLWriterBehaviorValue = (typeof YAMLWriterBehaviorValues)[keyof typeof YAMLWriterBehaviorValues] | null;

export class YAMLWriterBehavior extends ReaderWriterBehavior {
  private readonly value: YAMLWriterBehaviorValue | null;

  private constructor(value: YAMLWriterBehaviorValue, useWarningForKnownIssues: boolean) {
    super(useWarningForKnownIssues);
    this.value = value;
  }

  public getValue(): YAMLWriterBehaviorValue {
    return this.value;
  }

  public static STRICT = new YAMLWriterBehavior(YAMLWriterBehaviorValues.STRICT, false);
}
