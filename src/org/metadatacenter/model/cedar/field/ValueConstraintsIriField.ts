import { ValueConstraints } from './ValueConstraints';
import { Iri } from '../types/wrapped-types/Iri';

/**
 * The constraints of a field whose declared default is an IRI.
 *
 * A link and the seven external authorities — ORCID, ROR, PFAS, RRID, PubMed, NIH
 * grant identifier and DOI — which is the set the Java library's
 * `IriDefaultableFieldBuilder` permits.
 *
 * The IRI stands alone, with no label beside it. That is the deliberate
 * difference from a controlled term, whose default names a term in a vocabulary
 * and carries the label that term is displayed under; an identifier resolved
 * against a register names nothing but itself.
 */
export class ValueConstraintsIriField extends ValueConstraints {
  public defaultValue: Iri | null = null;

  public constructor() {
    super();
  }
}
