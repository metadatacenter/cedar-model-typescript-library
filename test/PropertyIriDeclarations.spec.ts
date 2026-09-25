import { CedarBuilders, CedarReaders, CedarWriters } from '../src';

for (const kind of ['template', 'element'] as const) {
  test(`${kind}: attribute-value groups and static fields need no fixed property IRI`, () => {
    const builder = kind === 'template' ? CedarBuilders.templateBuilder() : CedarBuilders.templateElementBuilder();
    const attribute = CedarBuilders.attributeValueFieldBuilder().withSchemaName('attributes').build();
    const text = CedarBuilders.richTextFieldBuilder().withSchemaName('display').build();
    builder.withSchemaName('Test').addChild(attribute, attribute.createDeploymentBuilder('attributes').build());
    builder.addChild(text, text.createDeploymentBuilder('display').build());
    const parent = builder.build();
    const writers = CedarWriters.json().getStrict();
    const readers = CedarReaders.json().getStrict();
    const source =
      kind === 'template'
        ? writers.getTemplateWriter().getAsJsonNode(parent as any)
        : writers.getTemplateElementWriter().getAsJsonNode(parent as any);
    const read =
      kind === 'template' ? readers.getTemplateReader().readFromObject(source) : readers.getTemplateElementReader().readFromObject(source);
    expect(read.parsingResult.getBlueprintComparisonErrors().filter((e) => e.errorLocation === 'jtr06')).toEqual([]);
  });
}

test('ordinary fields still report missing property IRIs', () => {
  const field = CedarBuilders.textFieldBuilder().withSchemaName('value').build();
  const template = CedarBuilders.templateBuilder()
    .withSchemaName('Test')
    .addChild(field, field.createDeploymentBuilder('value').build())
    .build();
  const source = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  const read = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source);
  expect(read.parsingResult.getBlueprintComparisonErrors().filter((e) => e.errorLocation === 'jtr06')).toHaveLength(1);
});

test('explicit attribute-group mappings are preserved, and malformed declarations still report errors', () => {
  const field = CedarBuilders.attributeValueFieldBuilder().withSchemaName('attributes').build();
  const template = CedarBuilders.templateBuilder()
    .withSchemaName('Test')
    .addChild(field, field.createDeploymentBuilder('attributes').build())
    .build();
  const source: any = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  source.properties['@context'].properties.attributes = { enum: ['urn:explicit-group'] };
  const reader = CedarReaders.json().getStrict().getTemplateReader();
  const read = reader.readFromObject(source);
  expect(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(read.template)).toContain('urn:explicit-group');
  source.properties['@context'].properties.attributes.enum = [];
  expect(
    reader
      .readFromObject(source)
      .parsingResult.getBlueprintComparisonErrors()
      .filter((e) => e.errorLocation === 'jtr06'),
  ).toHaveLength(1);
});
