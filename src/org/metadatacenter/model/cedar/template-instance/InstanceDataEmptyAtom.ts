/**
 * A value node the reader could not make a value out of.
 *
 * A CEDAR value is a literal (`@value`) or an IRI (`@id`, optionally with an
 * `rdfs:label`). A node carrying neither has no value in it, whatever else it
 * holds — `{"rdfs:label": "Some Term"}` is a label with nothing to label, so
 * there is no term.
 *
 * `discarded` is what the node held. The reader used to return a bare empty atom
 * and the content was simply gone: a host application handing CEDAR a
 * half-written controlled term got an empty field back with no way to find out
 * why, and nothing in the parsing result mentioned it. Keeping the node costs
 * one reference and lets a consumer say what happened, or put it back.
 */
export class InstanceDataEmptyAtom {
  private readonly _discarded: object | null;

  constructor(discarded: object | null = null) {
    this._discarded = discarded;
  }

  /** What the node held, when it held something that was not a value. */
  get discarded(): object | null {
    return this._discarded;
  }

  /** True when something was thrown away to produce this atom. */
  hasDiscardedContent(): boolean {
    return this._discarded !== null && Object.keys(this._discarded).length > 0;
  }
}
