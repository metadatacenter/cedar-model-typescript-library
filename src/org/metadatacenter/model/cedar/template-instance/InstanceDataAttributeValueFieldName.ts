/**
 * The name of one attribute-value slot, as it sits in the field's list.
 *
 * The name is required. It was declared nullable and never could be: the readers
 * build one only from a value they have already established is a string, and
 * nothing else constructs one at all.
 */
export class InstanceDataAttributeValueFieldName {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }
}
