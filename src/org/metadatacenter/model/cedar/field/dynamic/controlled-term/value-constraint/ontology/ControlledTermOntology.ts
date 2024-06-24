import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermOntology extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermOntology';
  public className = 'ControlledTermOntology';
  private readonly _acronym: string;
  private readonly _name: string;
  private readonly _uri: Iri;
  private readonly _numTerms: number | null = 0;

  constructor(acronym: string, name: string, numTerms: number | null, uri: Iri) {
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

  get uri(): Iri {
    return this._uri;
  }

  get numTerms(): number | null {
    return this._numTerms;
  }
}
