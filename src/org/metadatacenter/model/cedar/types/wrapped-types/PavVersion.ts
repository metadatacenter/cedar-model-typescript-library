import { SemVer } from './SemVer';

export const PavVersionValues = {
  DEFAULT: '0.0.1',
} as const;

export class PavVersion extends SemVer {
  public static DEFAULT = new PavVersion(PavVersionValues.DEFAULT);
  public static NULL = new PavVersion(null);

  protected getDefaultValue(): string {
    return PavVersionValues.DEFAULT;
  }

  public static values(): PavVersion[] {
    return [PavVersion.DEFAULT, PavVersion.NULL];
  }

  public static forValue(value: string | null): PavVersion {
    for (const version of PavVersion.values()) {
      if (version.getValue() === value) {
        return version;
      }
    }
    return new PavVersion(value);
  }
}
