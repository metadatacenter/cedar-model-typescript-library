import { assertIri, PARSED_NODE } from './InstanceDataLinkAtom';

/**
 * A controlled term: the IRI that identifies it and the label it is shown by.
 *
 * Both are required. An IRI with no label is a link, which is
 * `InstanceDataLinkAtom`; a label with no IRI is a label with nothing to label,
 * and there is no term in it at all — the reader makes an
 * `InstanceDataEmptyAtom` of that and carries what was dropped.
 *
 * The constructor's parameters were named `(value, type)` and assigned to `_id`
 * and `_label`, which is `InstanceDataTypedAtom`'s signature: this class was
 * copied from that one and the names were never changed. Anyone reading the
 * signature to learn what a controlled atom holds was told the wrong thing.
 */
export class InstanceDataControlledAtom {
  private readonly _id: string | null;
  private readonly _label: string | null;

  constructor(id: string, label: string);
  constructor(id: string | null, label: string | null, parsed: typeof PARSED_NODE);
  constructor(id: string | null, label: string | null, parsed?: typeof PARSED_NODE) {
    if (parsed !== PARSED_NODE) {
      assertIri(id, 'InstanceDataControlledAtom');
      if (label === null || label === undefined || label === '') {
        throw new Error('InstanceDataControlledAtom requires a label. An IRI on its own is a link, not a controlled term.');
      }
    }
    this._id = id;
    this._label = label;
  }

  /**
   * The atom a reader makes of a node carrying a label and a null `@id`.
   *
   * Only the readers use this — see `InstanceDataLinkAtom.fromParsedNode` for
   * why a malformed document is preserved rather than repaired.
   */
  static fromParsedNode(id: string | null, label: string | null): InstanceDataControlledAtom {
    return new InstanceDataControlledAtom(id, label, PARSED_NODE);
  }

  get id(): string | null {
    return this._id;
  }

  get label(): string | null {
    return this._label;
  }
}
