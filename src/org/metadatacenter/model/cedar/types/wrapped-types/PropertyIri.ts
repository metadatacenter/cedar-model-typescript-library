import { CedarModel } from '../../constants/CedarModel';

/**
 * The namespace CEDAR identifies one of a container's properties by.
 *
 * A model fact rather than a key in any serialization, and the whole of what a consumer needs: the
 * IRIs themselves are the repository's to assign, so nothing here derives one. It used to, from the
 * property's name, and that is exactly what a name cannot carry — an author renames a child and the
 * identity underneath it would move.
 *
 * It is here at all because the namespace was reachable only as `CedarModel.propertyIriPrefix`, a
 * bare string in a class otherwise full of the *names* a template's JSON uses for its parts: `_ui`,
 * `$schema`, `_valueConstraints`. A consumer that wanted to recognise a property IRI had to reach
 * into that table, which is how CEE came to mint one a different way from the library.
 */
export class PropertyIri {
  /** The namespace every property IRI CEDAR assigns belongs to. */
  static get namespace(): string {
    return CedarModel.propertyIriPrefix;
  }
}
