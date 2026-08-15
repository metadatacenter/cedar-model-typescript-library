import { CedarReaders, CedarWriters, JsonNode, Template } from '../../../../../../src';
import { ListField } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/list/ListField';
import { MultipleChoiceListFieldImpl } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/list-multiple-choice/MultipleChoiceListFieldImpl';
import { SingleChoiceListFieldImpl } from '../../../../../../src/org/metadatacenter/model/cedar/field/dynamic/list-single-choice/SingleChoiceListFieldImpl';

/**
 * How a list field's `multipleChoice` is decided when it is read.
 *
 * The declared value decides, wherever the field sits. How many options an answer may select and how
 * many times the field is asked are separate facts: `multipleChoice` states the first, and the
 * property's cardinality — an array-typed property with `minItems`/`maxItems` — states the second.
 * Both serialise as an array, which is what made them easy to confuse.
 *
 * A child field used to take `multipleChoice` from its cardinality, so a repeatable single-select was
 * read as a multi-select and written back with `multipleChoice: true` over the `false` its template
 * declared. Real templates state it that way: six list fields across the HuBMAP corpus and
 * `template-029` in `cedar-test-artifacts` are repeatable single-selects. The Java artifact library
 * reads the declared value, and this library follows it, which is what keeps the two outputs identical.
 *
 * Anything consuming the parsed model — CEE, for one, which renders a single-select or a multi-select
 * from exactly this — now gets what the template says.
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
  return CedarReaders.json().getFebruary2024().getTemplateFieldReader().readFromObject(field).field as unknown as ListField;
};

describe('JsonFieldReaderList multipleChoice', () => {
  test('inside a template, the declared value decides', () => {
    expect(readChoices(listTemplate(false, false)) instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(readChoices(listTemplate(true, true)) instanceof MultipleChoiceListFieldImpl).toBe(true);
  });

  test('a repeatable single-select stays a single-select', () => {
    // template-029 is this case: multipleChoice false, property an array. It is a list offering one
    // option, asked more than once.
    const repeatable = readChoices(listTemplate(false, true));
    expect(repeatable instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(repeatable.multipleChoice).toBe(false);

    const multiSelect = readChoices(listTemplate(true, false));
    expect(multiSelect instanceof MultipleChoiceListFieldImpl).toBe(true);
    expect(multiSelect.multipleChoice).toBe(true);
  });

  test('an undeclared multipleChoice is false, whatever the cardinality', () => {
    expect(readChoices(listTemplate(undefined, true)) instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(readChoices(listTemplate(undefined, false)) instanceof SingleChoiceListFieldImpl).toBe(true);
  });

  test('a repeatable single-select is written back as one', () => {
    const source = listTemplate(false, true);
    const template: Template = CedarReaders.json().getFebruary2024().getTemplateReader().readFromObject(source).template;
    const written = JSON.parse(CedarWriters.json().getStrict().getTemplateWriter().getAsJsonString(template));
    const property = written['properties']['Choices'];

    expect(property['type']).toBe('array');
    expect(property['minItems']).toBe(1);
    expect(property['items']['_valueConstraints']['multipleChoice']).toBe(false);
  });

  /** A field read on its own has no property around it, and the declared value is all there is. */
  test('standalone, the declared value is the only signal', () => {
    expect(readStandalone(true) instanceof MultipleChoiceListFieldImpl).toBe(true);
    expect(readStandalone(false) instanceof SingleChoiceListFieldImpl).toBe(true);
    expect(readStandalone(undefined) instanceof SingleChoiceListFieldImpl).toBe(true);
  });
});
