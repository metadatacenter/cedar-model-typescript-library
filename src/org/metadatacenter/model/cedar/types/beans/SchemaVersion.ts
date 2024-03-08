export const SchemaVersionValues = {
  CURRENT: '1.6.0',
} as const;

export class SchemaVersion {
  private readonly value: string | null;

  private constructor(version: string | null) {
    this.value = version;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static CURRENT = new SchemaVersion(SchemaVersionValues.CURRENT);
  public static NULL = new SchemaVersion(null);

  public static values(): SchemaVersion[] {
    return [SchemaVersion.CURRENT];
  }

  public static forValue(value: string | null): SchemaVersion {
    for (const version of SchemaVersion.values()) {
      if (version.getValue() === value) {
        return version;
      }
    }
    return this.NULL;
  }
}
