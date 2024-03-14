import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermValueSet extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermValueSet';
  public className = 'ControlledTermValueSet';
  private _vsCollection: string;
  private _name: string;
  private _uri: URI;
  private _numTerms: number = 0;

  constructor(vsCollection: string, name: string, numTerms: number, uri: URI) {
    super();
    this._vsCollection = vsCollection;
    this._name = name;
    this._uri = uri;
    this._numTerms = numTerms;
  }

  get vsCollection(): string {
    return this._vsCollection;
  }

  get name(): string {
    return this._name;
  }

  get uri(): URI {
    return this._uri;
  }

  get numTerms(): number {
    return this._numTerms;
  }
}
