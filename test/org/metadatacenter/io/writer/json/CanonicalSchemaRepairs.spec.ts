import { CedarBuilders, CedarWriters, CedarJsonReaders } from '../../../../../../src';

describe('canonical schema repairs', () => {
  const writers = CedarWriters.json().getStrict();
  test('standalone attribute-value groups have exactly one array wrapper and remain readable', () => {
    const field = CedarBuilders.attributeValueFieldBuilder().withSchemaName('Attributes').build();
    const writer = writers.getFieldWriterForType(field.cedarFieldType);
    const json = writer.getAsJsonNode(field) as any;
    expect(json).toMatchObject({ type: 'array', minItems: 0, items: { type: 'string', _ui: { inputType: 'attribute-value' } } });
    const reader = CedarJsonReaders.getStrict().getTemplateFieldReader();
    for (const source of [json, json.items]) {
      const read = reader.readFromObject(source).field;
      expect(writer.getAsJsonNode(read)).toEqual(json);
    }
    expect(JSON.parse(writer.getAsJsonString(field))).toEqual(json);
    const template = CedarBuilders.templateBuilder().addChild(field, field.createDeploymentBuilder('attributes').build()).build();
    const nested = (writers.getTemplateWriter().getAsJsonNode(template) as any).properties.attributes;
    expect(nested).toEqual(json);
    expect(nested.items.items).toBeUndefined();
  });

  test('templates declare optional platform annotations without introducing a child', () => {
    const template = CedarBuilders.templateBuilder().withSchemaName('Annotations').build();
    const writer = writers.getTemplateWriter();
    const json = writer.getAsJsonNode(template) as any;
    expect(json.required).not.toContain('_annotations');
    expect(json.properties['@context'].required).not.toContain('_annotations');
    expect(json.properties['@context'].properties._annotations).toEqual({ type: 'string', enum: ['@nest'] });
    expect(json.properties._annotations.patternProperties['^.+$'].oneOf).toHaveLength(2);
    const reader = CedarJsonReaders.getStrict().getTemplateReader();
    expect(writer.getAsJsonNode(reader.readFromObject(json).template)).toEqual(json);
    const legacy = JSON.parse(JSON.stringify(json));
    delete legacy.properties._annotations;
    delete legacy.properties['@context'].properties._annotations;
    const old = reader.readFromObject(legacy);
    expect(old.template.getChildrenInfo().getChildrenNames()).toEqual([]);
    expect(writer.getAsJsonNode(old.template)).toEqual(json);
  });
});
