import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';
import { BioportalTermType } from '../../../../../types/bioportal-types/BioportalTermType';

export class ControlledTermClass extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermClass';
  public className = 'ControlledTermClass';
  private readonly _label: string;
  private readonly _source: string;
  private readonly _type: BioportalTermType;
  private readonly _prefLabel: string;
  private readonly _uri: URI;

  constructor(label: string, source: string, type: BioportalTermType, prefLabel: string, uri: URI) {
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

  get type(): BioportalTermType {
    return this._type;
  }

  get prefLabel(): string {
    return this._prefLabel;
  }

  get uri(): URI {
    return this._uri;
  }
}
