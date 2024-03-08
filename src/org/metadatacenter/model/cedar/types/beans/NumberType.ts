export const NumberTypeValues = {
  DECIMAL: 'xsd:decimal',
  LONG: 'xsd:long',
  INT: 'xsd:int',
  DOUBLE: 'xsd:double',
  FLOAT: 'xsd:float',
} as const;

export type NumberTypeValue = (typeof NumberTypeValues)[keyof typeof NumberTypeValues] | null;

export class NumberType {
  private readonly value: NumberTypeValue | null;

  private constructor(value: NumberTypeValue) {
    this.value = value;
  }

  public getValue(): NumberTypeValue {
    return this.value;
  }

  public static DECIMAL = new NumberType(NumberTypeValues.DECIMAL);
  public static LONG = new NumberType(NumberTypeValues.LONG);
  public static INT = new NumberType(NumberTypeValues.INT);
  public static DOUBLE = new NumberType(NumberTypeValues.DOUBLE);
  public static FLOAT = new NumberType(NumberTypeValues.FLOAT);
  public static NULL = new NumberType(null);

  public static values(): NumberType[] {
    return [NumberType.DECIMAL, NumberType.LONG, NumberType.INT, NumberType.DOUBLE, NumberType.FLOAT];
  }

  public static forValue(value: string | null): NumberType {
    for (const numberType of NumberType.values()) {
      if (numberType.getValue() === value) {
        return numberType;
      }
    }
    return this.NULL;
  }
}
