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
}
