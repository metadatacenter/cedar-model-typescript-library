export const CedarSchemaValues = {
  CURRENT: 'http://json-schema.org/draft-04/schema#',
} as const;

export class ArtifactSchema {
  private readonly value: string | null;

  private constructor(schema: string | null) {
    this.value = schema;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static CURRENT = new ArtifactSchema(CedarSchemaValues.CURRENT);
  public static NULL = new ArtifactSchema(null);

  public static forValue(value: string | null): ArtifactSchema {
    if (value === null) {
      return new ArtifactSchema(CedarSchemaValues.CURRENT);
    } else {
      return new ArtifactSchema(value);
    }
  }
}
