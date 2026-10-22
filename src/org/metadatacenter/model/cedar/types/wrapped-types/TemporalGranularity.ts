export const TemporalGranularityValues = {
  YEAR: 'year',
  MONTH: 'month',
  DAY: 'day',
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second',
  DECIMAL_SECOND: 'decimalSecond',
} as const;

export type TemporalGranularityValue = (typeof TemporalGranularityValues)[keyof typeof TemporalGranularityValues] | null;

export class TemporalGranularity {
  private readonly value: TemporalGranularityValue | null;

  private constructor(value: TemporalGranularityValue) {
    this.value = value;
  }

  public getValue(): TemporalGranularityValue {
    return this.value;
  }

  public static YEAR = new TemporalGranularity(TemporalGranularityValues.YEAR);
  public static MONTH = new TemporalGranularity(TemporalGranularityValues.MONTH);
  public static DAY = new TemporalGranularity(TemporalGranularityValues.DAY);
  public static HOUR = new TemporalGranularity(TemporalGranularityValues.HOUR);
  public static MINUTE = new TemporalGranularity(TemporalGranularityValues.MINUTE);
  public static SECOND = new TemporalGranularity(TemporalGranularityValues.SECOND);
  public static DECIMAL_SECOND = new TemporalGranularity(TemporalGranularityValues.DECIMAL_SECOND);
  public static NULL = new TemporalGranularity(null);

  public static values(): TemporalGranularity[] {
    return [
      TemporalGranularity.YEAR,
      TemporalGranularity.MONTH,
      TemporalGranularity.DAY,
      TemporalGranularity.HOUR,
      TemporalGranularity.MINUTE,
      TemporalGranularity.SECOND,
      TemporalGranularity.DECIMAL_SECOND,
    ];
  }

  public static valuesWithTimes(): TemporalGranularity[] {
    return [TemporalGranularity.HOUR, TemporalGranularity.MINUTE, TemporalGranularity.SECOND, TemporalGranularity.DECIMAL_SECOND];
  }

  public static forValue(value: string | null): TemporalGranularity {
    for (const temporalType of TemporalGranularity.values()) {
      if (temporalType.getValue() === value) {
        return temporalType;
      }
    }
    return this.NULL;
  }

  /**
   * The constant a document's granularity names. Java's readers take only a constant's exact spelling
   * and refuse any other, a case variant among them, and so does this. A spelling that `forValue` did
   * not know was read as no granularity, and the writers then left the key out.
   */
  public static forGranularity(value: unknown): TemporalGranularity {
    const match = TemporalGranularity.values().find((granularity) => granularity.getValue() === value);
    if (match === undefined) {
      throw new Error(`No temporal granularity constant with name ${typeof value === 'string' ? value : JSON.stringify(value)} found`);
    }
    return match;
  }

  static hasTime(temporalGranularity: TemporalGranularity) {
    return this.valuesWithTimes().includes(temporalGranularity);
  }
}
