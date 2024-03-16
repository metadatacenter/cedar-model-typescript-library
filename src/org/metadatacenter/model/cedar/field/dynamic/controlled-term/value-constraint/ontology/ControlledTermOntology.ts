import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermOntology extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermOntology';
  public className = 'ControlledTermOntology';
  private readonly _acronym: string;
  private readonly _name: string;
  private readonly _uri: URI;
  private readonly _numTerms: number = 0;

  constructor(acronym: string, name: string, numTerms: number, uri: URI) {
    super();
    this._acronym = acronym;
    this._name = name;
    this._uri = uri;
    this._numTerms = numTerms;
  }

  get acronym(): string {
    return this._acronym;
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
