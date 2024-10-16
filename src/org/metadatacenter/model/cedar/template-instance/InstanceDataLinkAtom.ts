export class InstanceDataLinkAtom {
  private _id: string | null;

  constructor(id: string | null) {
    this._id = id;
  }

  get id(): string | null {
    return this._id;
  }
}
