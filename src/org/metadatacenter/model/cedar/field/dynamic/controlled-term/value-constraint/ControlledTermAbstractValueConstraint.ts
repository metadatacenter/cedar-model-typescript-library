import { ValueConstraints } from '../../../ValueConstraints';
import { Iri } from '../../../../types/wrapped-types/Iri';
import { ControlledTermVersion } from './ControlledTermVersion';

interface ClassWithClassName {
  className: string;
}

/**
 * What the four controlled-term constraints have in common: which vocabulary the terms come from,
 * and which snapshot of it.
 *
 * All three are optional, and a constraint written before they existed carries none of them. `iri`
 * is the source ontology's canonical identity, the one that holds whichever system serves it — not
 * to be confused with an ontology constraint's `uri`, which is the address BioPortal answers at.
 * `sourceSystem` names that system, and its absence means BioPortal. `version` pins the snapshot,
 * and its absence means the latest one.
 */
export abstract class ControlledTermAbstractValueConstraint extends ValueConstraints implements ClassWithClassName {
  className = 'ControlledTermAbstractValueConstraint';
  private readonly _iri: Iri | null;
  private readonly _sourceSystem: string | null;
  private readonly _version: ControlledTermVersion | null;

  protected constructor(iri: Iri | null = null, sourceSystem: string | null = null, version: ControlledTermVersion | null = null) {
    super();
    this._iri = iri;
    this._sourceSystem = sourceSystem;
    this._version = version;
  }

  get iri(): Iri | null {
    return this._iri;
  }

  get sourceSystem(): string | null {
    return this._sourceSystem;
  }

  get version(): ControlledTermVersion | null {
    return this._version;
  }
}
