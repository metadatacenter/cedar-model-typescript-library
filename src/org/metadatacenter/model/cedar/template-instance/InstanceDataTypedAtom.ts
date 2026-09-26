/**
 * A literal that declares its XSD type, as a temporal or numeric field does.
 *
 * The value may be null — an unfilled literal is `{"@value": null}`, which CEDAR
 * declares as `["string", "null"]` — but the type may not. A typed atom with no
 * type is an `InstanceDataStringAtom`, which is exactly the choice the readers
 * make when they find no `@type`, so a null here produces a node no reader would
 * ever have built.
 */
export class InstanceDataTypedAtom {
  /** Optional JSON-LD language tag, preserved across JSON and YAML. */
  public language: string | null = null;
  /** Optional SKOS notation, including an explicitly empty string. */
  public notation: string | null = null;
  private readonly _value: string | null;
  private readonly _type: string;

  constructor(
    value: string | null,
    type: string,
    public readonly label: string | null = null,
  ) {
    if (type === null || type === undefined || type === '') {
      throw new Error('InstanceDataTypedAtom requires a type. A literal with no declared type is an InstanceDataStringAtom.');
    }
    this._value = value;
    this._type = type;
  }

  get value(): string | null {
    return this._value;
  }

  get type(): string {
    return this._type;
  }
}
