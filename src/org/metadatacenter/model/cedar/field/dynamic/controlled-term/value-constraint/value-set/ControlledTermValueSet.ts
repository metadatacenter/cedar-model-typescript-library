import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermValueSet extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermValueSet';
  public className = 'ControlledTermValueSet';
  private readonly _vsCollection: string;
  private readonly _name: string;
  private readonly _uri: Iri;
  private readonly _numTerms: number | null = 0;

  constructor(vsCollection: string, name: string, numTerms: number | null, uri: Iri) {
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

  get uri(): Iri {
    return this._uri;
  }

  get numTerms(): number | null {
    return this._numTerms;
  }
}
