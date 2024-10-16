export class InstanceDataAttributeValueFieldName {
  private _name: string | null;

  constructor(name: string | null) {
    this._name = name;
  }

  get name(): string | null {
    return this._name;
  }
}
