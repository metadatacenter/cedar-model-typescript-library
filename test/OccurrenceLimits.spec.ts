import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ChildDeploymentInfoAlwaysMultipleBuilder,
  AbstractDynamicChildDeploymentInfo,
} from '../src';

for (const [name, factory] of [
  ['checkbox', () => CedarBuilders.checkboxFieldBuilder().addCheckboxOption('A')],
  ['list', () => CedarBuilders.multipleChoiceListFieldBuilder().addListOption('A')],
  ['attribute-value', () => CedarBuilders.attributeValueFieldBuilder()],
] as const) {
  test(`${name} retains declared limits through YAML`, () => {
    const field = factory().withSchemaName('Value').build();
    const deployment = (field.createDeploymentBuilder('Value') as ChildDeploymentInfoAlwaysMultipleBuilder)
      .withMinItems(2)
      .withMaxItems(5)
      .build();
    const template = CedarBuilders.templateBuilder().withSchemaName('Audit').build();
    template.addChild(field, deployment);
    const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
    const read = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
    const info = read.getChildrenInfo().get('Value') as AbstractDynamicChildDeploymentInfo;
    expect(info?.minItems).toBe(2);
    expect(info?.maxItems).toBe(5);
  });
}
