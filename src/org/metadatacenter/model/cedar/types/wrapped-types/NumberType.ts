export const NumberTypeValues = {
  DECIMAL: 'xsd:decimal',
  INT: 'xsd:int',
  LONG: 'xsd:long',
  BYTE: 'xsd:byte',
  SHORT: 'xsd:short',
  FLOAT: 'xsd:float',
  DOUBLE: 'xsd:double',
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
  public static INT = new NumberType(NumberTypeValues.INT);
  public static LONG = new NumberType(NumberTypeValues.LONG);
  public static BYTE = new NumberType(NumberTypeValues.BYTE);
  public static SHORT = new NumberType(NumberTypeValues.SHORT);
  public static FLOAT = new NumberType(NumberTypeValues.FLOAT);
  public static DOUBLE = new NumberType(NumberTypeValues.DOUBLE);
  public static NULL = new NumberType(null);

  public static values(): NumberType[] {
    return [NumberType.DECIMAL, NumberType.INT, NumberType.LONG, NumberType.BYTE, NumberType.SHORT, NumberType.FLOAT, NumberType.DOUBLE];
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
