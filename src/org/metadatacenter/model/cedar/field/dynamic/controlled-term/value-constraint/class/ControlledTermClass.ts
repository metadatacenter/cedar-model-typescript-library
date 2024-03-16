import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermClass extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermClass';
  public className = 'ControlledTermClass';
  private readonly _label: string;
  private readonly _source: string;
  private readonly _type: string;
  private readonly _prefLabel: string;
  private readonly _uri: URI;

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
