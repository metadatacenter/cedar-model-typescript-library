import { SemVer } from './SemVer';

export const SchemaVersionValues = {
  CURRENT: '1.6.0',
} as const;

export class SchemaVersion extends SemVer {
  public static CURRENT = new SchemaVersion(SchemaVersionValues.CURRENT);
  public static NULL = new SchemaVersion(null);

  protected getDefaultValue(): string {
    return SchemaVersionValues.CURRENT;
  }

  public static values(): SchemaVersion[] {
    return [SchemaVersion.CURRENT];
  }

  public static forValue(value: string | null): SchemaVersion {
    for (const version of SchemaVersion.values()) {
      if (version.getValue() === value) {
        return version;
      }
    }
    return new SchemaVersion(value);
  }
}
