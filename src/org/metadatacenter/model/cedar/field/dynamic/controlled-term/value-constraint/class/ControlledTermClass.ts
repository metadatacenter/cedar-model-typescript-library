import { URI } from '../../../../../types/beans/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermClass extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermClass';
  public className = 'ControlledTermClass';
  private _label: string;
  private _source: string;
  private _type: string;
  private _prefLabel: string;
  private _uri: URI;

  constructor(label: string, source: string, type: string, prefLabel: string, uri: URI) {
    super();
    this._label = label;
    this._source = source;
    this._type = type;
    this._prefLabel = prefLabel;
    this._uri = uri;
  }

  get label(): string {
    return this._label;
  }

  get source(): string {
    return this._source;
  }

  get type(): string {
    return this._type;
  }

  get prefLabel(): string {
    return this._prefLabel;
  }

  get uri(): URI {
    return this._uri;
  }
}
