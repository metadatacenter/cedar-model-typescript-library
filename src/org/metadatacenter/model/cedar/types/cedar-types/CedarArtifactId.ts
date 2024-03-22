export class CedarArtifactId {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static NULL = new CedarArtifactId(null);

  static forValue(value: string | null): CedarArtifactId {
    if (value === null) {
      return CedarArtifactId.NULL;
    } else {
      return new CedarArtifactId(value);
    }
  }
}
