import { Iri } from '../../../../types/wrapped-types/Iri';
import { BioportalTermType } from '../../../../types/bioportal-types/BioportalTermType';

/**
 * What a controlled-term constraint must carry to be one.
 *
 * Each of the six builders in this family declared every field with an empty
 * default — `''` for a string, `Iri.empty()` for a URI — so `build()` succeeded
 * whatever the caller had supplied, and an ontology constraint naming no
 * ontology serialized as `{"uri": "", "acronym": "DOID", "name": "Disease"}`. A
 * constraint that points at nothing is not a constraint; it is a request the
 * terminology server cannot answer.
 *
 * Which fields are required is measured rather than assumed. Across the 437
 * artifacts in `cedar-test-artifacts`, every field checked below is present on
 * every occurrence of its constraint and empty on none:
 *
 * | constraint | occurrences | always present |
 * |---|---|---|
 * | class | 109 | `uri`, `prefLabel`, `label`, `source`, `type` |
 * | branch | 219 | `uri`, `source`, `acronym`, `name` |
 * | ontology | 32 | `uri`, `acronym`, `name` |
 * | value set | 10 | `uri`, `vsCollection`, `name` |
 * | action | 48 | `termUri`, `sourceUri`, `action`, `source`, `type` |
 * | default value | 30 | `termUri`, `rdfs:label` |
 *
 * The fields left unchecked are the ones that measurement shows are optional —
 * an ontology's `numTerms` (26 of 32) and an action's `to` (32 of 48), both
 * already nullable — and the two numeric fields, `maxDepth` and a value set's
 * `numTerms`, where zero is a value rather than an absence.
 *
 * Only the deployment-info builders are used by the readers, so nothing here
 * can turn a malformed document into an exception on the way in. A constraint
 * read from a real template goes through the constraint classes directly.
 */
export class ValueConstraintRequirements {
  static requireText(value: string, field: string, constraint: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${constraint} requires ${field}.`);
    }
  }

  static requireIri(value: Iri, field: string, constraint: string): void {
    if (value === null || value === undefined || value.isEmpty()) {
      throw new Error(`${constraint} requires ${field}. A constraint that points at nothing cannot be resolved.`);
    }
  }

  static requireTermType(value: BioportalTermType, constraint: string): void {
    if (value === null || value === undefined || value.getJsonValue() === null) {
      throw new Error(`${constraint} requires a term type.`);
    }
  }
}
