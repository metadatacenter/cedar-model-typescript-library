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
   * What the writer uses for a child whose artifact declares no IRI of its own. The name is encoded
   * exactly as the Java library encodes it, which is Java's `URLEncoder`: form encoding, so a space
   * becomes `+`, and `!`, `'`, `(`, `)` and `~` are escaped even though a URI path would take them
   * literally. `encodeURIComponent` alone leaves those five alone, which is what made the two
   * libraries mint different IRIs for the same field — `Dose+(mg)` here against `Dose+%28mg%29`
   * there. Whether form encoding is the right choice for a path segment is another question; what
   * matters here is that one function answers it for both libraries.
   */
  static forName(name: string): string {
    return CedarModel.propertyIriPrefix + PropertyIri.formUrlEncode(name);
  }

  /** Java's `URLEncoder.encode(name, UTF_8)`, character for character. */
  private static formUrlEncode(name: string): string {
    return encodeURIComponent(name)
      .replace(/%20/g, '+')
      .replace(/[!'()~]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  /**
   * The IRI for a property identified by something other than its name.
   *
   * For a property whose name is the user's to change — an attribute-value
   * field's, say — where deriving the IRI from the name would give it a new
   * identity on every keystroke. The caller supplies the unique part, because
   * what makes it unique is the caller's to decide.
   */
  static forId(id: string): string {
    return CedarModel.propertyIriPrefix + id;
  }
}
