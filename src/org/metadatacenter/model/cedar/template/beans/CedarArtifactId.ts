export class CedarArtifactId {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static NULL = new CedarArtifactId(null);

  toJSON() {
    return this.value;
  }

  static forValue(value: string | null): CedarArtifactId {
    return new CedarArtifactId(value);
  }
}
