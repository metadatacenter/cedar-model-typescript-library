import { InstanceDataAtomType } from './InstanceDataAtomType';
import { InstanceDataAnnotations } from './InstanceDataAnnotations';

export class InstanceDataContainer {
  private _id: string | null = null;
  private _values: { [key: string]: InstanceDataAtomType };
  private _iris: { [key: string]: string };
  private _annotations: InstanceDataAnnotations | null;

  constructor() {
    this._values = {};
    this._iris = {};
    this._annotations = null;
  }

  setValue(key: string, instanceDataAtom: InstanceDataAtomType) {
    this._values[key] = instanceDataAtom;
  }

  get values(): { [p: string]: InstanceDataAtomType } {
    return this._values;
  }

  set values(values: { [key: string]: InstanceDataAtomType }) {
    this._values = values;
  }

  setIri(key: string, iri: string) {
    this._iris[key] = iri;
  }

  get iris(): { [p: string]: string } {
    return this._iris;
  }

  set id(value: string | null) {
    this._id = value;
  }

  get id(): string | null {
    return this._id;
  }

  get annotations(): InstanceDataAnnotations | null {
    return this._annotations;
  }

  set annotations(value: InstanceDataAnnotations | null) {
    this._annotations = value;
  }
}
