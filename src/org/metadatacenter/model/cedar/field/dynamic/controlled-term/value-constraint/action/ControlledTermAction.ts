import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';
import { BioportalTermType } from '../../../../../types/bioportal-types/BioportalTermType';

export class ControlledTermAction extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermAction';
  public className = 'ControlledTermAction';
  private readonly _to: number | null = null;
  private readonly _action: string;
  private readonly _termUri: Iri;
  private readonly _sourceUri: Iri;
  private readonly _source: string;
  private readonly _type: BioportalTermType;

  constructor(to: number | null, action: string, termUri: Iri, sourceUri: Iri, source: string, type: BioportalTermType) {
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

  get termUri(): Iri {
    return this._termUri;
  }

  get sourceUri(): Iri {
    return this._sourceUri;
  }

  get source(): string {
    return this._source;
  }

  get type(): BioportalTermType {
    return this._type;
  }
}
