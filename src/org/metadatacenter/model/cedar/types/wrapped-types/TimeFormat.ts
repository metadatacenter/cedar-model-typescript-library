export const TimeFormatValues = {
  H24: '24h',
  H12: '12h',
} as const;

export type TimeFormatValue = (typeof TimeFormatValues)[keyof typeof TimeFormatValues] | null;

export class TimeFormat {
  private readonly value: TimeFormatValue | null;

  private constructor(value: TimeFormatValue) {
    this.value = value;
  }

  public getValue(): TimeFormatValue {
    return this.value;
  }

  public static H24 = new TimeFormat(TimeFormatValues.H24);
  public static H12 = new TimeFormat(TimeFormatValues.H12);
  public static NULL = new TimeFormat(null);

  public static values(): TimeFormat[] {
    return [TimeFormat.H24, TimeFormat.H12];
  }

  public static forValue(value: string | null): TimeFormat {
    for (const temporalType of TimeFormat.values()) {
      if (temporalType.getValue() === value) {
        return temporalType;
      }
    }
    return this.NULL;
  }

  /**
   * The constant a document's input time format names. Java's readers take only a constant's exact
   * spelling and refuse any other, a case variant among them, and so does this. A spelling that
   * `forValue` did not know was read as no input time format, and the writers then left the key out.
   */
  public static forInputTimeFormat(value: unknown): TimeFormat {
    const match = TimeFormat.values().find((format) => format.getValue() === value);
    if (match === undefined) {
      throw new Error(`No input time format constant with text ${typeof value === 'string' ? value : JSON.stringify(value)} found`);
    }
    return match;
  }
}
