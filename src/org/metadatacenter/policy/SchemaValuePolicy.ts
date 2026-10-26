import { FieldValuePolicy, ValidationField } from './FieldValuePolicy';
import { ValidationFinding, ValidationPolicy } from './ValidationPolicy';

/** Raw schema constraint checks shared by model validation and the host's retained payload. */
export class SchemaValuePolicy {
  static visit(source: unknown, path: string, out: ValidationFinding[]): void {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      out.push(ValidationPolicy.finding('valueShape', path, 'A definition must be an object.'));
      return;
    }
    const schema = source as ValidationField & { type?: string; items?: unknown; minItems?: number; maxItems?: number };
    if (schema.type === 'array') {
      if (schema.minItems != null && schema.maxItems != null && schema.minItems > schema.maxItems)
        out.push(ValidationPolicy.finding('templateConstraint', path + '/maxItems', 'Minimum occurrence count exceeds maximum.'));
      this.visit(schema.items, path + '/items', out);
      return;
    }
    if (schema._ui?.inputType) {
      out.push(...FieldValuePolicy.validateConfiguration(schema, path), ...FieldValuePolicy.validateDefault(schema, path));
      const value = schema._valueConstraints?.defaultValue;
      if (
        value != null &&
        value !== '' &&
        (FieldValuePolicy.isControlled(schema) || FieldValuePolicy.authorityTypes.has(schema._ui.inputType))
      ) {
        const semanticPath =
          path + '/_valueConstraints/defaultValue' + (FieldValuePolicy.isControlled(schema) && typeof value === 'object' ? '/termUri' : '');
        out.push(
          ValidationPolicy.finding(
            'semanticNotChecked',
            semanticPath,
            'Default identifier membership or existence has not been verified.',
            'notChecked',
          ),
        );
      }
      return;
    }
    for (const [name, child] of Object.entries(schema.properties ?? {})) {
      const candidate = child?.type === 'array' ? child.items : child;
      if (candidate && typeof candidate === 'object' && candidate._ui)
        this.visit(child, ValidationPolicy.child(path + '/properties', name), out);
    }
  }
}
