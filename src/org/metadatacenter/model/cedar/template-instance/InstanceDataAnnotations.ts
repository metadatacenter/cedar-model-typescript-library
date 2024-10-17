import { InstanceDataAtomStringOrLinkType } from './InstanceDataAtomStringOrLinkType';

export class InstanceDataAnnotations {
  private _values: { [key: string]: InstanceDataAtomStringOrLinkType } = {};

  constructor() {
    this._values = {};
  }

  addValue(name: string, value: InstanceDataAtomStringOrLinkType) {
    this._values[name] = value;
  }

  get values(): { [p: string]: InstanceDataAtomStringOrLinkType } {
    return this._values;
  }

  add(name: string, instanceDataLinkAtom: InstanceDataAtomStringOrLinkType) {
    this._values[name] = instanceDataLinkAtom;
  }
}
