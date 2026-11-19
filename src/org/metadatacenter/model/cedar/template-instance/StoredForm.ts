import type { AttributeValueNameConflict } from './AttributeValueNamePolicy';

/**
 * What a document stated that the instance model does not keep.
 *
 * The model keeps an optional property held as null as no value, and gives
 * every instance the writer's standard `@context` terms, so neither a stored
 * null nor a stored term survives into it. The server judges the document as it
 * was stored, and so does a validator asked about that document. The reader
 * records both here, keyed by the objects it builds, which leaves the model, its
 * equality and its serializations as they were. A copy of a model carries no
 * record, and is judged as the writer would write it.
 *
 * One record does reach a serialization. `InstanceInflater` keeps each stated
 * null whose key the stored template requires of the field's value, and the
 * JSON writer writes the kept ones, since leaving them out would make the
 * written document fail the template the stored one satisfied.
 */
export class StoredForm {
  private static readonly nulls = new WeakMap<object, readonly string[]>();
  private static readonly keptNulls = new WeakMap<object, readonly string[]>();
  private static readonly contextTerms = new WeakMap<object, { [key: string]: unknown }>();
  private static readonly members = new WeakMap<object, { [key: string]: unknown }>();
  private static readonly attributeNameConflicts = new WeakMap<object, readonly AttributeValueNameConflict[]>();

  private constructor() {}

  /** The optional properties a value held as null. */
  static recordNulls(value: object, keys: readonly string[]): void {
    if (keys.length > 0) StoredForm.nulls.set(value, keys);
  }

  static nullsOf(value: object): readonly string[] {
    return StoredForm.nulls.get(value) ?? [];
  }

  /** The stated nulls of a value that the JSON writer writes: those its stored value schema requires. */
  static recordKeptNulls(value: object, keys: readonly string[]): void {
    if (keys.length > 0) StoredForm.keptNulls.set(value, keys);
  }

  static keptNullsOf(value: object): readonly string[] {
    return StoredForm.keptNulls.get(value) ?? [];
  }

  /** The standard prefixes and term definitions a container's `@context` held. */
  static recordContextTerms(container: object, terms: { [key: string]: unknown }): void {
    StoredForm.contextTerms.set(container, terms);
  }

  /** Null for a container the reader did not build from a document. */
  static contextTermsOf(container: object): { [key: string]: unknown } | null {
    return StoredForm.contextTerms.get(container) ?? null;
  }

  /**
   * The keys a container's own object held besides its children, as stored:
   * its `@context` and `@id` and, at the root, the template, name and
   * provenance. The model keeps a missing identifier and a null one alike.
   */
  static recordMembers(container: object, members: { [key: string]: unknown }): void {
    StoredForm.members.set(container, members);
  }

  /** Null for a container the reader did not build from a document. */
  static membersOf(container: object): { [key: string]: unknown } | null {
    return StoredForm.members.get(container) ?? null;
  }

  /**
   * The attribute names a container's document gave that `AttributeValueNamePolicy` refuses. The
   * model cannot hold such a name, a reserved or blank one or a second use of one, so the reader
   * leaves its attribute out, and only this record says that the document stated it.
   */
  static recordAttributeNameConflicts(container: object, conflicts: readonly AttributeValueNameConflict[]): void {
    if (conflicts.length > 0) StoredForm.attributeNameConflicts.set(container, conflicts);
  }

  static attributeNameConflictsOf(container: object): readonly AttributeValueNameConflict[] {
    return StoredForm.attributeNameConflicts.get(container) ?? [];
  }
}
