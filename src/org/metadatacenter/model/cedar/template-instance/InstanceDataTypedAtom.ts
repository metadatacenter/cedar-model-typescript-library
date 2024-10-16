export class InstanceDataTypedAtom {
  private _value: string | null;
  private _type: string | null;

  constructor(value: string | null, type: string | null) {
    this._value = value;
    this._type = type;
  }

  get value(): string | null {
    return this._value;
  }

  get type(): string | null {
    return this._type;
  }
}
