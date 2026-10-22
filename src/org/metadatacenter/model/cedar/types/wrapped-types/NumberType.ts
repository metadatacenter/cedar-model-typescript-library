import { TextPolicy } from '../../../../policy/TextPolicy';

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

  /**
   * The constant a document's datatype names. Java's readers match the spelling to a constant ignoring
   * case and refuse any other, a full XSD IRI among them, and so does this. A spelling that `forValue`
   * did not know was read as no datatype, and the writers wrote it back as null.
   */
  public static forDatatype(value: unknown): NumberType {
    const match = NumberType.values().find((numberType) => {
      const constant = numberType.getValue();
      return typeof value === 'string' && constant !== null && TextPolicy.equalsIgnoreCase(constant, value);
    });
    if (match === undefined) {
      throw new Error(`No numeric datatype constant ${String(value)} found`);
    }
    return match;
  }
}
