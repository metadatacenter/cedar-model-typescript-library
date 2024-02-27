export const CedarSchemaValues = {
  CURRENT: 'http://json-schema.org/draft-04/schema#',
} as const;

export class CedarSchema {
  private readonly value: string;

  private constructor(schema: string) {
    this.value = schema;
  }

  public getValue(): string {
    return this.value;
  }

  public static CURRENT = new CedarSchema(CedarSchemaValues.CURRENT);

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
