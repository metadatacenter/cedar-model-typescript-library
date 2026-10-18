import { CedarJsonWriters } from '../../../io/writer/json/CedarJsonWriters';
import { ValidationField } from '../../../policy/FieldValuePolicy';
import { TemplateField } from '../field/TemplateField';
import { ControlledTermDefaultValue } from '../field/dynamic/controlled-term/value-constraint/ControlledTermDefaultValue';
import { Iri } from '../types/wrapped-types/Iri';

/** Inspect invalid imported constraints without passing them through save-time writer assertions. */
export function validationFieldSchema(child: TemplateField, includeDefault = false): ValidationField {
  const constraints = child.valueConstraints as unknown as Record<string, unknown>;
  const projected = Object.assign(Object.create(Object.getPrototypeOf(child)), child);
  projected.valueConstraints = Object.assign(Object.create(Object.getPrototypeOf(child.valueConstraints)), child.valueConstraints, {
    defaultValue: null,
    minValue: null,
    maxValue: null,
  });
  const schema = CedarJsonWriters.getStrict().getFieldWriterForField(projected).getAsJsonNode(projected) as ValidationField;
  for (const key of ['minValue', 'maxValue']) {
    if (constraints[key] != null) (schema._valueConstraints ??= {})[key] = constraints[key];
  }
  if (includeDefault && constraints.defaultValue != null) {
    const value = constraints.defaultValue;
    (schema._valueConstraints ??= {}).defaultValue =
      value instanceof ControlledTermDefaultValue
        ? { termUri: value.termUri.getValue(), 'rdfs:label': value.rdfsLabel }
        : value instanceof Iri
          ? value.getValue()
          : value;
  }
  return schema;
}
