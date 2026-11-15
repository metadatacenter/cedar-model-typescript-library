/**
 * The keys each child field's stored value schema lists as required, by child name.
 *
 * A field's value schema is the object its template declares for the field's value in an instance (the
 * `items` of a repeated field), and its `required` list names the keys a value must carry. The model
 * does not keep that list, because the writer derives it from the field's kind. A stored template can
 * still require more, such as an `rdfs:label` the instance states as null, and the server judges an
 * instance against the template as stored. `InstanceInflater` reads these lists to keep a stated null
 * the stored template requires.
 *
 * The reader records them, keyed by the container it builds, which leaves the model, its equality and
 * its serializations as they were. A container built or copied in code carries none. Mirrors the Java
 * library's `StoredValueRequirements`.
 */
export class StoredValueRequirements {
  private static readonly required = new WeakMap<object, Map<string, readonly string[]>>();

  private constructor() {}

  static record(container: object, childName: string, keys: readonly string[]): void {
    let byChild = StoredValueRequirements.required.get(container);
    if (byChild === undefined) {
      byChild = new Map();
      StoredValueRequirements.required.set(container, byChild);
    }
    byChild.set(childName, [...keys]);
  }

  /** The keys the stored value schema of the child field requires, or none where none were recorded. */
  static of(container: object, childName: string): readonly string[] {
    return StoredValueRequirements.required.get(container)?.get(childName) ?? [];
  }
}
