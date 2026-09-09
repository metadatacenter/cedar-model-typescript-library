import { CedarBuilders, CedarFieldType, CedarReaders, CedarWriters } from '../src';

test('an empty controlled-term field retains its IRI type through JSON and YAML', () => {
  const field = CedarBuilders.controlledTermFieldBuilder().withSchemaName('Terms').build();
  const template = CedarBuilders.templateBuilder().withSchemaName('Draft').build();
  template.addChild(field, field.createDeploymentBuilder('Terms').build());
  const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  const readJson = CedarReaders.json().getStrict().getTemplateReader().readFromObject(json).template;
  expect(readJson.getField('Terms')?.cedarFieldType).toBe(CedarFieldType.CONTROLLED_TERM);
  const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template);
  const readYaml = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
  expect(readYaml.getField('Terms')?.cedarFieldType).toBe(CedarFieldType.CONTROLLED_TERM);
  expect(CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(readJson)).toEqual(json);
});
