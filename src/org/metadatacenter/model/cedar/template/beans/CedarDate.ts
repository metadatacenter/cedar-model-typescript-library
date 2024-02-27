export class CedarDate {
  private readonly value: string | null;

  private constructor(version: string | null) {
    this.value = version;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static forValue(value: string | null): CedarDate {
    return new CedarDate(value);
  }

  toJSON() {
    return this.value;
  }
}
