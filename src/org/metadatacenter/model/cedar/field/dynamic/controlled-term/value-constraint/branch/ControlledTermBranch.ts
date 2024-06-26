import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermBranch extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermBranch';
  public className = 'ControlledTermBranch';
  private readonly _source: string;
  private readonly _acronym: string;
  private readonly _name: string;
  private readonly _uri: Iri;
  private readonly _maxDepth: number = 0;

  constructor(source: string, acronym: string, name: string, maxDepth: number, uri: Iri) {
    super();
    this._source = source;
    this._acronym = acronym;
    this._uri = uri;
    this._name = name;
    this._maxDepth = maxDepth;
  }

  get source(): string {
    return this._source;
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

  get maxDepth(): number {
    return this._maxDepth;
  }
}
