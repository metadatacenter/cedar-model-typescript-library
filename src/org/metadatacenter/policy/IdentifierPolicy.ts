/** Pure identifier checks shared by model readers and UI; no URL normalization. */
export abstract class IdentifierPolicy {
  /** Match Java URI's whitespace, fragment and scheme checks; never rewrite identifiers. */
  public static assertIdentifierCharacters(raw: string | null, key: string): void {
    if (raw === null) return;
    if (
      Array.from(raw).some(
        (character) =>
          character.charCodeAt(0) <= 0x20 ||
          (character.charCodeAt(0) >= 0x7f && character.charCodeAt(0) <= 0x9f) ||
          /\p{Z}/u.test(character),
      )
    ) {
      throw new Error(`Invalid URI at "${key}": unescaped space or control character.`);
    }
    if (raw.indexOf('#') !== raw.lastIndexOf('#')) {
      throw new Error(`Invalid URI at "${key}": more than one fragment delimiter.`);
    }
    // A colon before any slash, query or fragment denotes a scheme in java.net.URI.
    const prefix = raw.split(/[/?#]/, 1)[0];
    if (prefix.includes(':') && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(raw)) {
      throw new Error(`Invalid URI at "${key}": malformed scheme.`);
    }
  }

  /** RFC 3987 field identifiers: validate characters without normalizing RDF identity. */
  public static assertFieldIri(raw: string | null, key: string): void {
    if (raw === null) return;
    if (raw === '') throw new Error(`An empty string is not a URI at "${key}"; write null or leave the key out where there is no value.`);
    if (typeof raw !== 'string') throw new Error(`Invalid URI/IRI at "${key}": expected string.`);
    let query = false;
    let fragment = false;
    for (const character of raw) {
      const cp = character.codePointAt(0)!;
      if (character === '#') {
        fragment = true;
        query = false;
      } else if (character === '?' && !fragment) query = true;
      if (cp < 0x80) {
        if (cp <= 0x20 || cp === 0x7f || '<>"{}|\\^`'.includes(character)) {
          throw new Error(`Invalid URI/IRI at "${key}": unescaped space, control or forbidden character.`);
        }
      } else {
        const ucs =
          (cp >= 0xa0 && cp <= 0xd7ff) ||
          (cp >= 0xf900 && cp <= 0xfdcf) ||
          (cp >= 0xfdf0 && cp <= 0xffef) ||
          (cp >= 0x10000 && cp <= 0xdfffd && (cp & 0xffff) <= 0xfffd) ||
          (cp >= 0xe1000 && cp <= 0xefffd);
        const privateChar = (cp >= 0xe000 && cp <= 0xf8ff) || (cp >= 0xf0000 && cp <= 0xffffd) || (cp >= 0x100000 && cp <= 0x10fffd);
        if (!ucs && !(query && privateChar)) throw new Error(`Invalid URI/IRI at "${key}": forbidden Unicode character.`);
      }
    }
    if (/%(?![0-9a-fA-F]{2})/.test(raw)) throw new Error(`Invalid URI/IRI at "${key}": malformed percent escape.`);
    // Keep the existing scheme/fragment checks, using an ASCII transport spelling only for validation.
    const transport = Array.from(raw, (c) => (c.codePointAt(0)! >= 0x80 ? encodeURIComponent(c) : c)).join('');
    this.assertIdentifierCharacters(transport, key);
  }

  /**
   * An IRI anywhere but a field's value, as the Java readers judge one: RFC 3987 characters, and
   * none of the space separators a java.net.URI cannot hold as spelled. A field's value keeps its
   * spelling and so takes those, through `assertFieldIri` alone. Whether an empty string means
   * absence differs by position, so each position decides that itself.
   */
  public static assertIri(raw: string | null, key: string): void {
    if (raw === null || raw === '') return;
    if (typeof raw !== 'string') throw new Error(`Invalid URI at "${key}": expected a string.`);
    this.assertFieldIri(raw, key);
    this.assertIdentifierCharacters(raw, key);
  }

  /**
   * An identifier, as the Java readers judge one: an IRI `assertIri` takes that is also absolute.
   * Every IRI outside a field's value is one, except a nested child's temporary `@id`, which the
   * server replaces on a write, and an action's `sourceUri`, where the legacy editor writes
   * `template`. Null is absence; the empty string is a relative reference and is refused.
   */
  public static assertIdentifier(raw: string | null, key: string): void {
    if (raw === null) return;
    if (typeof raw !== 'string') throw new Error(`Invalid URI at "${key}": expected a string.`);
    if (raw === '') {
      throw new Error(`An empty string is not a URI at "${key}"; write null or leave the key out where there is no value.`);
    }
    this.assertIri(raw, key);
    if (!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(raw)) {
      throw new Error(`Invalid URI at "${key}": an identifier must be an absolute IRI.`);
    }
  }

  public static isValid(value: string): boolean {
    if (typeof value !== 'string') return false;
    try {
      this.assertIdentifier(value, 'value');
      return true;
    } catch {
      return false;
    }
  }
}
