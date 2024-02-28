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

  static forValue(value: string | null): PavVersion {
    return new PavVersion(value);
  }
}
