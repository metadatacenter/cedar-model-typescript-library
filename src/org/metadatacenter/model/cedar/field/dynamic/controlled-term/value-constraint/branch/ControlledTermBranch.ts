import { URI } from '../../../../../types/beans/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermBranch extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermBranch';
  public className = 'ControlledTermBranch';
  private _source: string;
  private _acronym: string;
  private _name: string;
  private _uri: URI;
  private _maxDepth: number = 0;

  constructor(source: string, acronym: string, name: string, maxDepth: number, uri: URI) {
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

  get uri(): URI {
    return this._uri;
  }

  get maxDepth(): number {
    return this._maxDepth;
  }
}
