export class InstanceDataStringAtom {
  /** Optional JSON-LD language tag, preserved across JSON and YAML. */
  public language: string | null = null;
  /** Optional SKOS notation, including an explicitly empty string. */
  public notation: string | null = null;
  private _value: string | null;

  constructor(
    value: string | null,
    public readonly label: string | null = null,
  ) {
    this._value = value;
  }

  get value(): string | null {
    return this._value;
  }
}
