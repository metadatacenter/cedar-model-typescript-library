export const SchemaVersionValues = {
  CURRENT: '1.6.0',
} as const;

export class SchemaVersion {
  private readonly value: string;

  private constructor(version: string) {
    this.value = version;
  }

  public getValue(): string {
    return this.value;
  }

  public static CURRENT = new SchemaVersion(SchemaVersionValues.CURRENT);

  public static forValue(value: string | null): SchemaVersion {
    if (value === null) {
      return new SchemaVersion(SchemaVersionValues.CURRENT);
    } else {
      return new SchemaVersion(value);
    }
  }

  toJSON() {
    return this.value;
  }
}
