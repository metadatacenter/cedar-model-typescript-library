export const TemporalTypeValues = {
  DATE: 'xsd:date',
  TIME: 'xsd:time',
  DATETIME: 'xsd:dateTime',
} as const;

export type TemporalTypeValue = (typeof TemporalTypeValues)[keyof typeof TemporalTypeValues] | null;

export class TemporalType {
  private readonly value: TemporalTypeValue | null;

  private constructor(value: TemporalTypeValue) {
    this.value = value;
  }

  public getValue(): TemporalTypeValue {
    return this.value;
  }

  public static DATE = new TemporalType(TemporalTypeValues.DATE);
  public static TIME = new TemporalType(TemporalTypeValues.TIME);
  public static DATETIME = new TemporalType(TemporalTypeValues.DATETIME);
  public static NULL = new TemporalType(null);

  public static values(): TemporalType[] {
    return [TemporalType.DATE, TemporalType.TIME, TemporalType.DATETIME];
  }

  public static forValue(value: string | null): TemporalType {
    for (const temporalType of TemporalType.values()) {
      if (temporalType.getValue() === value) {
        return temporalType;
      }
    }
    return this.NULL;
  }
}
