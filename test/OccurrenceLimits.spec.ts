import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ChildDeploymentInfoAlwaysMultipleBuilder,
  AbstractDynamicChildDeploymentInfo,
} from '../src';

// An attribute-value field takes no minimum above 0, because its attributes need names.
for (const [name, factory, minItems] of [
  ['checkbox', () => CedarBuilders.checkboxFieldBuilder().addCheckboxOption('A'), 2],
  ['list', () => CedarBuilders.multipleChoiceListFieldBuilder().addListOption('A'), 2],
  ['attribute-value', () => CedarBuilders.attributeValueFieldBuilder(), 0],
] as const) {
  test(`${name} retains declared limits through YAML`, () => {
    const field = factory().withSchemaName('Value').build();
    const deployment = (field.createDeploymentBuilder('Value') as ChildDeploymentInfoAlwaysMultipleBuilder)
      .withMinItems(minItems)
      .withMaxItems(5)
      .build();
    const template = CedarBuilders.templateBuilder().withSchemaName('Audit').build();
    template.addChild(field, deployment);
    const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
    const read = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
    const info = read.getChildrenInfo().get('Value') as AbstractDynamicChildDeploymentInfo;
    expect(info?.minItems).toBe(minItems);
    expect(info?.maxItems).toBe(5);
  });
}

test('attribute-value refuses a minimum above zero', () => {
  const field = CedarBuilders.attributeValueFieldBuilder().withSchemaName('Value').build();
  const deployment = field.createDeploymentBuilder('Value') as ChildDeploymentInfoAlwaysMultipleBuilder;
  expect(() => deployment.withMinItems(1).build()).toThrow('minItems must be zero in attribute-value field Value');
  expect(deployment.withMinItems(0).build().minItems).toBe(0);
});
