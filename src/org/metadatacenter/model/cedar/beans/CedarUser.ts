export class CedarUser {
  private readonly value: string | null;

  private constructor(version: string | null) {
    this.value = version;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static forValue(value: string | null): CedarUser {
    return new CedarUser(value);
  }

  toJSON() {
    return this.value;
  }
}
