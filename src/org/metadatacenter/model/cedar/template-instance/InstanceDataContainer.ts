import { InstanceDataAtomType } from './InstanceDataAtomType';

/**
 * An element occurrence, or an instance's root: named children and the property
 * IRI of each.
 *
 * The two maps are exposed, and were the only way to change one. A consumer that
 * had to remove a child — an editor renaming a property, say — reached into
 * `values` and used `delete`, which is the model failing to hide its own shape:
 * the container decides what a child is and how it is keyed, and a caller that
 * has to know both in order to remove one is not using a model, it is editing a
 * dictionary that happens to live behind a getter.
 *
 * So removal is a method, and the getters stay for reading.
 */
export class InstanceDataContainer {
  private _id: string | null = null;
  private _values: { [key: string]: InstanceDataAtomType };
  private _iris: { [key: string]: string };

  constructor() {
    this._values = {};
    this._iris = {};
  }

  setValue(key: string, instanceDataAtom: InstanceDataAtomType) {
    this._values[key] = instanceDataAtom;
  }

  /** Whether this container has a child under that key. */
  hasValue(key: string): boolean {
    return Object.hasOwn(this._values, key);
  }

  /**
   * Remove a child, and the property IRI that identifies it.
   *
   * Both together, because they are two halves of one property: a name left in
   * the IRI map with no child under it becomes a `@context` entry pointing at
   * nothing, which is what happened whenever a caller deleted from `values` and
   * forgot the other map. `removeIri` is there for the rarer case of dropping
   * only the identity.
   */
  removeValue(key: string): void {
    delete this._values[key];
    delete this._iris[key];
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

  /** Whether this container records a property IRI under that key. */
  hasIri(key: string): boolean {
    return Object.hasOwn(this._iris, key);
  }

  /** Forget a property IRI, leaving any child under that key where it is. */
  removeIri(key: string): void {
    delete this._iris[key];
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
}
