import { CedarBuilders, CedarReaders, CedarWriters, YamlTemplateReader, YamlTemplateElementReader } from '../src';

for (const kind of ['template', 'element'] as const) {
  test(`${kind} preserves multiple instance types in JSON and YAML`, () => {
    const artifact = (kind === 'template' ? CedarBuilders.templateBuilder() : CedarBuilders.templateElementBuilder())
      .withSchemaName('Types')
      .withTitle('Types')
      .withDescription('Types')
      .withSchemaDescription('Types')
      .build();
    artifact.instanceTypeSpecifications = ['urn:type:one', 'urn:type:two'];
    const jw = CedarWriters.json().getStrict();
    const yw = CedarWriters.yaml().getStrict();
    const json =
      kind === 'template'
        ? jw.getTemplateWriter().getAsJsonNode(artifact as any)
        : jw.getTemplateElementWriter().getAsJsonNode(artifact as any);
    expect((json.properties as any)['@type'].oneOf[0].enum).toEqual(['urn:type:one', 'urn:type:two']);
    expect((json.properties as any)['@type'].oneOf[1].items.enum).toEqual(['urn:type:one', 'urn:type:two']);
    const readers = CedarReaders.json().getStrict();
    const restored =
      kind === 'template'
        ? readers.getTemplateReader().readFromObject(json).template
        : readers.getTemplateElementReader().readFromObject(json).element;
    expect(restored.instanceTypeSpecifications).toEqual(artifact.instanceTypeSpecifications);
    const yaml =
      kind === 'template'
        ? yw.getTemplateWriter().getAsYamlString(artifact as any)
        : yw.getTemplateElementWriter().getAsYamlString(artifact as any);
    const fromYaml =
      kind === 'template'
        ? YamlTemplateReader.getStrict().readFromString(yaml).template
        : YamlTemplateElementReader.getStrict().readFromString(yaml).element;
    expect(fromYaml.instanceTypeSpecifications).toEqual(artifact.instanceTypeSpecifications);
    artifact.instanceTypeSpecification = 'urn:legacy';
    expect(artifact.instanceTypeSpecifications).toEqual(['urn:legacy']);
    artifact.instanceTypeSpecification = null;
    expect(artifact.instanceTypeSpecifications).toEqual([]);
  });
}

test('type lists are copied and malformed constraints are rejected consistently', () => {
  const template = CedarBuilders.templateBuilder().withSchemaName('Types').build();
  const types = ['urn:one', 'urn:two'];
  template.instanceTypeSpecifications = types;
  types.length = 0;
  template.instanceTypeSpecifications.push('urn:three');
  expect(template.instanceTypeSpecifications).toEqual(['urn:one', 'urn:two']);
  for (const invalid of [['urn:a', 'urn:a'], ['relative'], [42]]) {
    expect(() => {
      template.instanceTypeSpecifications = invalid as string[];
    }).toThrow();
  }
  const valid = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  for (const invalid of [[], ['urn:a', 'urn:a'], ['relative'], [42]]) {
    const json = structuredClone(valid) as any;
    json.properties['@type'].oneOf[0].enum = invalid;
    expect(() => CedarReaders.json().getStrict().getTemplateReader().readFromObject(json)).toThrow();
  }
});
