import { ReservedNames } from '../ReservedNames';
import { InstanceDataAtomType } from './InstanceDataAtomType';

export class InstanceDataAttributeValueField {
  private readonly _name: string;
  private _values: { [key: string]: InstanceDataAtomType } = Object.create(null);
  private _iris: { [key: string]: string };

  constructor(name: string) {
    this._name = name;
    this._values = Object.create(null);
    this._iris = Object.create(null);
  }

  addValue(name: string, value: InstanceDataAtomType) {
    ReservedNames.requireChildName(name);
    this._values[name] = value;
  }

  get name(): string {
    return this._name;
  }

  get values(): { [p: string]: InstanceDataAtomType } {
    return this._values;
  }

  setIri(key: string, iri: string) {
    this._iris[key] = iri;
  }

  get iris(): { [p: string]: string } {
    return this._iris;
  }
}
