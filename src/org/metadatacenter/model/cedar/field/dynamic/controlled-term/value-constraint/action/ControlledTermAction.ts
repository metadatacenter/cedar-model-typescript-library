import { Iri } from '../../../../../types/wrapped-types/Iri';
import { ControlledTermAbstractValueConstraint } from '../ControlledTermAbstractValueConstraint';
import { BioportalTermType } from '../../../../../types/bioportal-types/BioportalTermType';

/** What an action does to a term, as Java's `ValueConstraintsActionType` defines it. */
export const ControlledTermActionValues = {
  DELETE: 'delete',
  MOVE: 'move',
} as const;

export class ControlledTermAction extends ControlledTermAbstractValueConstraint {
  static className = 'ControlledTermAction';

  /**
   * The action a document's `action` names, in JSON or in YAML. Java's readers take `delete` and
   * `move` exactly and refuse any other spelling, and an action that states none. These readers kept
   * whatever a document stated, and the writers wrote it back.
   */
  static forAction(value: unknown): string {
    if (value === null || value === undefined) {
      throw new Error('A controlled-term action requires an action.');
    }
    if (value !== ControlledTermActionValues.DELETE && value !== ControlledTermActionValues.MOVE) {
      throw new Error(
        `No value constraints action type constant with text ${typeof value === 'string' ? value : JSON.stringify(value)} found`,
      );
    }
    return value;
  }

  public className = 'ControlledTermAction';
  private readonly _to: number | null = null;
  private readonly _action: string; //move, delete
  private readonly _termUri: Iri;
  private readonly _sourceUri: Iri;
  private readonly _source: string; // source acronym
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
