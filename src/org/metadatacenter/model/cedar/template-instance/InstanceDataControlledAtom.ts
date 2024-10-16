export class InstanceDataControlledAtom {
  protected id: string | null;
  protected label: string | null;

  constructor(value: string | null, type: string | null) {
    this.id = value;
    this.label = type;
  }
}
