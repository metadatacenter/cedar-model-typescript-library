export const CedarSchemaValues = {
  CURRENT: 'http://json-schema.org/draft-04/schema#',
} as const;

export class CedarSchema {
  private readonly value: string | null;

  private constructor(schema: string | null) {
    this.value = schema;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static CURRENT = new CedarSchema(CedarSchemaValues.CURRENT);
  public static NULL = new CedarSchema(null);

  public static forValue(value: string | null): CedarSchema {
    if (value === null) {
      return new CedarSchema(CedarSchemaValues.CURRENT);
    } else {
      return new CedarSchema(value);
    }
  }

  toJSON() {
    return this.value;
  }
}
