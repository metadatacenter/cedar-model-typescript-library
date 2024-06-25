export abstract class SemVer {
  protected readonly value: string | null;

  protected constructor(value: string | null) {
    this.value = this.validateVersion(value);
  }

  protected abstract getDefaultValue(): string;

  public getValue(): string | null {
    return this.value;
  }

  private validateVersion(value: string | null): string | null {
    if (value === null) {
      return value;
    }

    const versionPattern = /^\d+\.\d+\.\d+$/;
    if (versionPattern.test(value)) {
      return value;
    } else {
      return this.getDefaultValue();
    }
  }
}
