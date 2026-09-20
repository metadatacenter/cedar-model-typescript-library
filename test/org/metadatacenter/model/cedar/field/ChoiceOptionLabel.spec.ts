import { CedarBuilders, CedarReaders, CedarWriters, JsonNode } from '../../../../../../src';

/**
 * A permitted value's label is the value an instance stores when that option is picked, so a blank
 * one offers a choice whose answer cannot be told from no answer. `requiredValue: false` is how the
 * model says a field may be left alone, and the meta-schema requires a label of at least one
 * character — so a blank option says the same thing a second time, and loses information doing it.
 *
 * `cedar-artifact-library` has always refused this; these pin TypeScript to the same reading.
 */
const REFUSAL = /requires a label/;

describe('a permitted value requires a label', () => {
  it('refuses a blank option on a single-choice list', () => {
    expect(() => CedarBuilders.singleChoiceListFieldBuilder().addListOption('').build()).toThrow(REFUSAL);
  });

  it('refuses a blank option on a multiple-choice list', () => {
    expect(() => CedarBuilders.multipleChoiceListFieldBuilder().addListOption('').build()).toThrow(REFUSAL);
  });

  it('refuses a blank option on a radio field', () => {
    expect(() => CedarBuilders.radioFieldBuilder().addRadioOption('').build()).toThrow(REFUSAL);
  });

  it('refuses a blank option on a checkbox field', () => {
    expect(() => CedarBuilders.checkboxFieldBuilder().addCheckboxOption('').build()).toThrow(REFUSAL);
  });

  it('refuses a stored template whose option has no label', () => {
    expect(() => CedarReaders.json().getStrict().getTemplateReader().readFromObject(storedWith(['', 'Complete'])))
      .toThrow(REFUSAL);
  });

  it('still reads one whose options all name themselves', () => {
    const result = CedarReaders.json().getStrict().getTemplateReader().readFromObject(storedWith(['In progress', 'Complete']));
    expect(result.template).not.toBeNull();
  });
});

function storedWith(labels: string[]): JsonNode {
  const field = CedarBuilders.singleChoiceListFieldBuilder().addListOption('placeholder').build();
  const template = CedarBuilders.templateBuilder()
    .withSchemaName('Status')
    .addChild(field, field.createDeploymentBuilder('Status').build())
    .build();
  const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  const status = (json['properties'] as JsonNode)['Status'] as JsonNode;
  (status['_valueConstraints'] as JsonNode)['literals'] = labels.map((label) => ({ label }));
  return json;
}
