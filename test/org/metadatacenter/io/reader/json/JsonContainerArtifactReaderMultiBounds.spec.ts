import { CedarReaders, JsonNode, Template } from '../../../../../../src';

/**
 * `minItems` and `maxItems` on a child that is multiple by definition.
 *
 * Checkbox, multiple-choice list and attribute-value fields take several
 * answers whatever the template says, so most templates leave the bounds out
 * and the model supplies them: one when the field is required, zero otherwise,
 * and always zero for attribute-value, since requiring one would mean requiring
 * an attribute nobody has named yet.
 *
 * A template may still state them, and then the statement stands. It used to
 * be discarded — `ChildDeploymentInfoAlwaysMultipleBuilder` had nowhere to put
 * it — so a declared bound was replaced by the default on the way back out.
 * `template-029` in `cedar-test-artifacts` declares `minItems: 1` on a list
 * that is not required; the Java artifact library keeps the 1, this one wrote
 * 0, and that was the only child anywhere in the numbered corpus where the two
 * libraries' JSON disagreed.
 */
const checkbox = (required: boolean): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/TemplateField',
  '@context': {},
  type: 'object',
  _ui: { inputType: 'checkbox' },
  _valueConstraints: { requiredValue: required, multipleChoice: true, literals: [{ label: 'A' }] },
  'schema:name': 'Boxes',
  'schema:description': '',
});

const attributeValue = (): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/TemplateField',
  '@context': {},
  type: 'string',
  _ui: { inputType: 'attribute-value' },
  _valueConstraints: { requiredValue: true },
  'schema:name': 'Boxes',
  'schema:description': '',
});

const templateWith = (field: JsonNode, bounds?: { minItems?: number; maxItems?: number }): JsonNode => ({
  '@type': 'https://schema.metadatacenter.org/core/Template',
  '@context': {},
  type: 'object',
  _ui: { order: ['Boxes'], propertyLabels: { Boxes: 'Boxes' }, propertyDescriptions: { Boxes: '' } },
  required: ['Boxes'],
  properties: {
    '@context': { properties: { Boxes: { enum: ['https://example.org/Boxes'] } } },
    Boxes: { type: 'array', ...(bounds ?? {}), items: field },
  },
  'schema:name': 'Bounds',
  'schema:description': '',
});

const boundsOf = (source: JsonNode) => {
  const template: Template = CedarReaders.json().getFebruary2024().getTemplateReader().readFromObject(source).template;
  const info = template.getChildInfo('Boxes')!;
  return { minItems: (info as unknown as { minItems: number | null }).minItems, maxItems: (info as unknown as { maxItems: number | null }).maxItems };
};

describe('bounds on an always-multiple child', () => {
  test('defaults follow requiredValue when the template states nothing', () => {
    expect(boundsOf(templateWith(checkbox(false)))).toEqual({ minItems: 0, maxItems: null });
    expect(boundsOf(templateWith(checkbox(true)))).toEqual({ minItems: 1, maxItems: null });
  });

  test('an attribute-value field defaults to zero even when required', () => {
    expect(boundsOf(templateWith(attributeValue())).minItems).toBe(0);
  });

  test('a declared bound wins over the default', () => {
    // template-029 is this case: minItems 1 on a field that is not required.
    expect(boundsOf(templateWith(checkbox(false), { minItems: 1 }))).toEqual({ minItems: 1, maxItems: null });
    expect(boundsOf(templateWith(checkbox(true), { minItems: 0 }))).toEqual({ minItems: 0, maxItems: null });
    expect(boundsOf(templateWith(checkbox(false), { minItems: 2, maxItems: 4 }))).toEqual({ minItems: 2, maxItems: 4 });
  });
});
