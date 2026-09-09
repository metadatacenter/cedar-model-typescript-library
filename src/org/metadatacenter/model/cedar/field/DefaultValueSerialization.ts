import { JsonNode } from '../types/basic-types/JsonNode';
import { Iri } from '../types/wrapped-types/Iri';
import { ReaderUtil } from '../../../io/reader/ReaderUtil';

/**
 * How a declared default value crosses the serialization boundary.
 *
 * CEDAR states a default in one place — `_valueConstraints.defaultValue` in JSON,
 * `default` in YAML — and gives it a different shape per field type. Two of those
 * shapes are shared by many types: a plain literal, carried by text, paragraph,
 * e-mail, phone, radio, checkbox and both lists, and an IRI, carried by a link and
 * the seven external authorities. The numeric, temporal and controlled-term shapes
 * are one type each and stay with their own readers and writers, where the
 * datatype they validate against lives.
 *
 * Stated once here rather than in the twenty-eight readers and writers that need
 * it, because the two rules below are easy to get subtly different in one of them:
 * an empty default is not a default, and an IRI is a string on the wire.
 */
export class DefaultValueSerialization {
  /**
   * A literal default, or null.
   *
   * An absent key and an explicit null both read as null. An empty string reads as
   * the empty string, which the writers then decline to write: the Java library
   * discards it at the boundary instead, and the two agree on the document either
   * way. Real templates carry `defaultValue: ""` and mean nothing by it.
   */
  public static literalFromNode(node: JsonNode, key: string): string | null {
    return ReaderUtil.getString(node, key);
  }

  /** A literal default, written only where there is one to write. */
  public static writeLiteral(target: JsonNode, key: string, value: string | null): void {
    if (value !== null && value !== '') {
      target[key] = value;
    }
  }

  /**
   * An IRI default, or null.
   *
   * The wire form is a bare string, as it is in the Java library: the `termUri` and
   * label pair belongs to a controlled term, whose default names a term in a
   * vocabulary. A link's default names nothing but itself and carries no label.
   */
  public static iriFromNode(node: JsonNode, key: string): Iri | null {
    const value = ReaderUtil.getString(node, key);
    return value === null || value === '' ? null : new Iri(value);
  }

  /** An IRI default, written as the string it is. */
  public static writeIri(target: JsonNode, key: string, value: Iri | null): void {
    if (value !== null && !value.isEmpty()) {
      target[key] = value.getValue();
    }
  }
}
