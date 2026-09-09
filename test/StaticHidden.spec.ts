import { CedarBuilders, CedarReaders, CedarWriters } from '../src';

test('JSON and YAML preserve hidden static fields', () => {
  const field = CedarBuilders.imageFieldBuilder().withSchemaName('Image').withContent('https://example.org/a.png').build();
  const template = CedarBuilders.templateBuilder().withSchemaName('Audit').build();
  template.addChild(field, field.createDeploymentBuilder('Image').withHidden(true).build());
  const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  const fromJson = CedarReaders.json().getStrict().getTemplateReader().readFromObject(json).template;
  expect(fromJson.getChildrenInfo().get('Image')?.hidden).toBe(true);
  const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
  const read = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
  expect(read.getChildrenInfo().get('Image')?.hidden).toBe(true);
});
