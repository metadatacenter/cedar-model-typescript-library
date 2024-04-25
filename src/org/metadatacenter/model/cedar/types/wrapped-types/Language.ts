export class Language {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public getValue(): string | null {
    return this.value;
  }

  public static NULL = new Language(null);

  static forValue(value: string | null): Language {
    if (value === null) {
      return Language.NULL;
    } else if (value === '') {
      return Language.NULL;
    } else {
      return new Language(value);
    }
  }
}
