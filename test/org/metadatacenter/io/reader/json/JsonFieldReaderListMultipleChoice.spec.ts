import { CedarReaders, JsonNode, Template } from '../../../../../../src';
import { ListField } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/list/ListField';
import { MultipleChoiceListFieldImpl } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/list-multiple-choice/MultipleChoiceListFieldImpl';
import { SingleChoiceListFieldImpl } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/list-single-choice/SingleChoiceListFieldImpl';

/**
 * How a list field's `multipleChoice` is decided when it is read.
 *
 * For a field read inside a template, the property's cardinality decides, and
 * a `_valueConstraints.multipleChoice` that disagrees is overwritten. That is
 * not a shortcut: a list whose answer may select several options serialises as
 * an array, so the two are meant to be the same fact stated twice, and the
 * schema is the half that governs the instance. When a template states them
 * inconsistently, the array wins. The Java artifact library normalises the same
 * way, which is what keeps the two libraries' output identical.
 *
 * Real templates do state them inconsistently. Six list fields across the
 * HuBMAP corpus and `template-029` in `cedar-test-artifacts` declare
 * `multipleChoice: false` on an array-typed property, or the reverse.
 * `template-029`'s generated output — from both libraries — shows the
 * normalisation: `false` in the source, `true` in what either library writes.
 *
 * Worth pinning because a reader coming to this fresh will find the standalone
 * branch below, conclude the declared value is authoritative, and be wrong
 * about every field that arrives inside a template. Anything consuming the
 * parsed model — CEE, for one, which renders a single-select or a multi-select
 * from exactly this — gets the normalised answer, not the declared one.
 */
const listTemplate = (multipleChoice: boolean | undefined, asArray: boolean): JsonNode => {
  const valueConstraints: Record<string, unknown> = {
    requiredValue: false,
    literals: [{ label: 'Option A' }, { label: 'Option B' }],
  };
  if (multipleChoice !== undefined) {
    valueConstraints['multipleChoice'] = multipleChoice;
  }
  const field = {
    '@type': 'https://schema.metadatacenter.org/core/TemplateField',
    '@context': {},
    type: 'object',
    _ui: { inputType: 'list' },
    _valueConstraints: valueConstraints,
    'schema:name': 'Choices',
    'schema:description': '',
  };
  return {
    '@type': 'https://schema.metadatacenter.org/core/Template',
    '@context': {},
    type: 'object',
    _ui: {
      order: ['Choices'],
      propertyLabels: { Choices: 'Choices' },
      propertyDescriptions: { Choices: '' },
    },
    required: ['Choices'],
    properties: {
      '@context': { properties: { Choices: { enum: ['https://example.org/Choices'] } } },
      Choices: asArray ? { type: 'array', minItems: 1, items: field } : field,
    },
    'schema:name': 'List template',
    'schema:description': '',
  };
};

const readChoices = (source: JsonNode): ListField => {
  const template: Template = CedarReaders.json().getFebruary2024().getTemplateReader().readFromObject(source).template;
  return template.getField('Choices') as unknown as ListField;
};

const readStandalone = (multipleChoice: boolean | undefined): ListField => {
  const source = listTemplate(multipleChoice, false);
  const field = (source['properties'] as JsonNode)['Choices'] as JsonNode;
  return CedarReaders.json().getFebruary2024().getTemplateFieldReader().readFromObject(field)
    .field as unknown as ListField;
};

describe('JsonFieldReaderList multipleChoice', () => {
  test('inside a template, the property cardinality decides', () => {
    expect(readChoices(listTemplate(false, false)) instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(readChoices(listTemplate(true, true)) instanceof MultipleChoiceListFieldImpl).toBe(true);
  });

  test('a declared multipleChoice that contradicts the cardinality is overwritten', () => {
    // template-029 is this case: multipleChoice false, property an array. Both
    // libraries write it back out as true.
    const arrayWins = readChoices(listTemplate(false, true));
    expect(arrayWins instanceof MultipleChoiceListFieldImpl).toBe(true);
    expect(arrayWins.multipleChoice).toBe(true);

    const objectWins = readChoices(listTemplate(true, false));
    expect(objectWins instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(objectWins.multipleChoice).toBe(false);
  });

  test('cardinality still decides when multipleChoice is not declared at all', () => {
    expect(readChoices(listTemplate(undefined, true)) instanceof MultipleChoiceListFieldImpl).toBe(true);
    expect(readChoices(listTemplate(undefined, false)) instanceof SingleChoiceListFieldImpl).toBe(true);
  });

  /**
   * A field read on its own has no property around it, so there is no
   * cardinality to normalise against and the declared value is all there is.
   */
  test('standalone, the declared value is the only signal', () => {
    expect(readStandalone(true) instanceof MultipleChoiceListFieldImpl).toBe(true);
    expect(readStandalone(false) instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(readStandalone(undefined) instanceof SingleChoiceListFieldImpl).toBe(true);
  });
});
