import { ValueConstraints } from './ValueConstraints';

/**
 * The constraints of a field whose declared default is a plain literal.
 *
 * Text, paragraph, e-mail, phone, radio, checkbox and both list types share this
 * default, which is what the Java library's `LiteralDefaultableFieldBuilder`
 * says: the same seven builders, permitted by name so a new field type of that
 * shape cannot be added without deciding. The types that add nothing else use
 * this class directly; the rest extend it.
 *
 * A radio, a checkbox and a list carry a default twice over — this one, and the
 * `selectedByDefault` flag on each of their options. Both are in the model and
 * both are written, because both are in CEDAR's own schema.
 */
export class ValueConstraintsLiteralField extends ValueConstraints {
  public defaultValue: string | null = null;

  public constructor() {
    super();
  }
}
