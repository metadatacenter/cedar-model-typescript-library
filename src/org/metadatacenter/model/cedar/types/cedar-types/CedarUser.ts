export class CedarUser {
  private readonly value: string | null;

  private constructor(version: string | null) {
    this.value = version;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static NULL = new CedarUser(null);

  public static forValue(value: string | null): CedarUser {
    if (value === null) {
      return CedarUser.NULL;
    } else {
      return new CedarUser(value);
    }
  }
}
