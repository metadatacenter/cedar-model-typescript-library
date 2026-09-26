import { CedarBuilders, CedarFieldType, CedarReaders, CedarWriters } from '../src';

describe('orphan vocabulary actions on literal fields', () => {
  test.each(['move', 'delete'])('%s alone preserves text classification and literal constraints', (action) => {
    const original = CedarBuilders.textFieldBuilder()
      .withSchemaName('Publications')
      .withTitle('Publications')
      .withRegex('(DOI\\:)?[0-9]{2}\\.[A-Z0-9]{4,}.*')
      .withMinLength(3)
      .withMaxLength(80)
      .withDefaultValue('10.ABCD')
      .build();
    const writers = CedarWriters.json().getStrict();
    const source = JSON.parse(writers.getFieldWriterForField(original).getAsJsonString(original));
    source._valueConstraints.actions = [{
      action,
      termUri: 'http://edamontology.org/data_1188',
      sourceUri: 'template',
      source: 'EDAM',
      type: 'OntologyClass',
      ...(action === 'move' ? { to: 0 } : {}),
    }];
    const reader = CedarReaders.json().getStrict().getTemplateFieldReader();
    const field = reader.readFromString(JSON.stringify(source)).field;
    expect(field.cedarFieldType).toBe(CedarFieldType.TEXT);
    const output = JSON.parse(writers.getFieldWriterForField(field).getAsJsonString(field));
    expect(output.properties['@value']).toEqual(source.properties['@value']);
    expect(output.properties['@id']).toBeUndefined();
    expect(output._valueConstraints.regex).toBe(source._valueConstraints.regex);
    expect(output._valueConstraints.minLength).toBe(3);
    expect(output._valueConstraints.maxLength).toBe(80);
    expect(output._valueConstraints.defaultValue).toBe('10.ABCD');
    expect(output._valueConstraints.actions).toBeUndefined();
    expect(source._valueConstraints.actions).toHaveLength(1);

    const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field);
    const restored = CedarReaders.yaml().getStrict().getTemplateFieldReader().readFromString(yaml).field;
    expect(JSON.parse(writers.getFieldWriterForField(restored).getAsJsonString(restored))._valueConstraints).toEqual(
      output._valueConstraints,
    );
  });
});
