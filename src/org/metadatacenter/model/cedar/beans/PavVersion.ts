export const PavVersionValues = {
  DEFAULT: '0.0.1',
} as const;

export type PavVersionValue = (typeof PavVersionValues)[keyof typeof PavVersionValues] | null;

export class PavVersion {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static DEFAULT = new PavVersion(PavVersionValues.DEFAULT);
  public static NULL = new PavVersion(null);

  toJSON() {
    return this.value;
  }

  public static values(): PavVersion[] {
    return [PavVersion.DEFAULT, PavVersion.NULL];
  }
  public static forValue(value: string | null): PavVersion {
    for (const status of PavVersion.values()) {
      if (status.getValue() === value) {
        return status;
      }
    }
    return new PavVersion(value);
  }
}
