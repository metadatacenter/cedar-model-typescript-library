export class InstanceDataControlledAtom {
  private _id: string | null;
  private _label: string | null;

  constructor(value: string | null, type: string | null) {
    this._id = value;
    this._label = type;
  }

  get id(): string | null {
    return this._id;
  }

  get label(): string | null {
    return this._label;
  }
}
