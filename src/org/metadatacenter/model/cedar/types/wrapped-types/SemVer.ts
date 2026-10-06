export abstract class SemVer {
  protected readonly value: string | null;

  protected constructor(value: string | null) {
    this.value = this.validateVersion(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  /**
   * Three numbers, each of which fits a Java int, as the Java library reads a version. Anything else
   * used to be replaced by the default, so "1.0" was read as "0.0.1" and written back that way,
   * where Java refuses it.
   */
  private validateVersion(value: string | null): string | null {
    if (value === null) {
      return value;
    }

    const parts = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
    if (parts === null || parts.slice(1).some((part) => part.length > 10 || Number(part) > 2147483647)) {
      throw new Error(`Invalid version "${value}": expected three numbers separated by periods.`);
    }
    return value;
  }
}
