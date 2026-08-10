/**
 * The readers' way past the checks below.
 *
 * Not in `index.ts`, which names its exports one at a time, so it is reachable
 * from inside the library and nowhere else.
 */
export const PARSED_NODE: unique symbol = Symbol('parsed node');

/**
 * Shared by the two IRI-bearing atoms.
 *
 * Empty string as well as null: `Iri.empty()` exists and is how an unset IRI is
 * carried elsewhere in the model, so a caller reaching for one here is making
 * the same mistake in a different spelling.
 */
export function assertIri(id: string | null, className: string): void {
  if (id === null || id === undefined || id === '') {
    throw new Error(`${className} requires an IRI. An IRI-valued field with nothing in it is an empty node, not a null IRI.`);
  }
}

/**
 * A value that is an IRI and nothing else.
 *
 * The IRI is required, and the constructor now says so. `{"@id": null}` is not
 * an unfilled link — an unfilled IRI-valued field is `{}`, which is
 * `InstanceDataEmptyAtom` — and JSON-LD has no null branch for `@id` any more
 * than CEDAR's templates do, which declare it `{"type": "string", "format":
 * "uri"}`. `JsonTemplateInstanceReader.reportNullIri` has said so on the way in
 * for some time. The way out said nothing, so a consumer could build exactly the
 * node the reader would go on to complain about.
 */
export class InstanceDataLinkAtom {
  private readonly _id: string | null;

  constructor(id: string);
  constructor(id: string | null, parsed: typeof PARSED_NODE);
  constructor(id: string | null, parsed?: typeof PARSED_NODE) {
    if (parsed !== PARSED_NODE) {
      assertIri(id, 'InstanceDataLinkAtom');
    }
    this._id = id;
  }

  /**
   * The atom a reader makes of a node whose `@id` is null.
   *
   * Only the readers use this. A document that arrives malformed is preserved as
   * it came and reported, because fidelity to what a host actually sent is worth
   * more than a tidy model: a consumer cannot say which field lost what if the
   * library quietly repaired it on the way through. Refusing at construction is
   * for code that is composing an instance, where there is still something to
   * fix.
   */
  static fromParsedNode(id: string | null): InstanceDataLinkAtom {
    return new InstanceDataLinkAtom(id, PARSED_NODE);
  }

  get id(): string | null {
    return this._id;
  }
}
