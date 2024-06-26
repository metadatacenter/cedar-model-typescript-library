import { ReaderWriterBehavior } from './ReaderWriterBehavior';

export const YAMLReaderBehaviorValues = {
  STRICT: 'strict',
} as const;

export type YAMLReaderBehaviorValue = (typeof YAMLReaderBehaviorValues)[keyof typeof YAMLReaderBehaviorValues] | null;

export class YamlReaderBehavior extends ReaderWriterBehavior {
  private readonly value: YAMLReaderBehaviorValue | null;

  private constructor(value: YAMLReaderBehaviorValue, useWarningForKnownIssues: boolean) {
    super(useWarningForKnownIssues);
    this.value = value;
  }

  public getValue(): YAMLReaderBehaviorValue {
    return this.value;
  }

  public static STRICT = new YamlReaderBehavior(YAMLReaderBehaviorValues.STRICT, false);
}
