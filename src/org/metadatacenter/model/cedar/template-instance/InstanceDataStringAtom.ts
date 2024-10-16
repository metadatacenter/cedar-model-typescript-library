export class InstanceDataStringAtom {
  private _value: string | null;

  constructor(value: string | null) {
    this._value = value;
  }

  get value(): string | null {
    return this._value;
  }
}
