import { URI } from '../../../../../types/wrapped-types/URI';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';

export class ControlledTermAction extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermAction';
  public className = 'ControlledTermAction';
  private readonly _to: number | null = null;
  private readonly _action: string;
  private readonly _termUri: URI;
  private readonly _sourceUri: URI;
  private readonly _source: string;
  private readonly _type: string;

  constructor(to: number | null, action: string, termUri: URI, sourceUri: URI, source: string, type: string) {
    super();
    this._to = to;
    this._action = action;
    this._termUri = termUri;
    this._sourceUri = sourceUri;
    this._source = source;
    this._type = type;
  }

  get to(): number | null {
    return this._to;
  }

  get action(): string {
    return this._action;
  }

  get termUri(): URI {
    return this._termUri;
  }

  get sourceUri(): URI {
    return this._sourceUri;
  }

  get source(): string {
    return this._source;
  }

  get type(): string {
    return this._type;
  }
}
