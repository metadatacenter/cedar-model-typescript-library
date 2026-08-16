import { CedarModel } from '../../constants/CedarModel';

/**
 * The IRI CEDAR identifies one of a container's properties by.
 *
 * A model fact — the namespace those IRIs live in, and the two ways one is
 * arrived at — rather than a key in any serialization. It was reachable only as
 * `CedarModel.propertyIriPrefix`, a bare string in a class otherwise full of the
 * *names* a template's JSON uses for its parts: `_ui`, `$schema`,
 * `_valueConstraints`. A consumer that needed to mint a property IRI had to
 * reach into that table for a prefix and then know how the rest is built, which
 * is how CEE came to mint one a different way from the library.
 *
 * Both schemes are here so they cannot drift again. Which is right depends on
 * what the caller has: a property whose name is settled is identified from that
 * name, and one whose name the user is still typing needs an identity that does
 * not change under them.
 */
export class PropertyIri {
  /** The namespace every property IRI CEDAR mints belongs to. */
  static get namespace(): string {
    return CedarModel.propertyIriPrefix;
  }

  /**
   * The IRI for a property with this name.
   *
   * What the writer uses for a child whose artifact declares no IRI of its own. The name becomes a path
   * segment, so it is percent-encoded as `encodeURIComponent` encodes it — a space is `%20`. Both
   * libraries used to reach for form encoding, which is meant for a query string and writes a space as
   * `+`; in a path a `+` is a literal plus, so the IRI did not decode back to the name it came from.
   * The Java library encodes identically, and a table of names and their encodings is pinned on both
   * sides.
   */
  static forName(name: string): string {
    return CedarModel.propertyIriPrefix + encodeURIComponent(name);
  }
}
