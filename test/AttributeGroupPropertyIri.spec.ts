import { CedarBuilders, CedarReaders, CedarWriters, InstanceInflater } from '../src';

const templateId = 'https://repo.metadatacenter.org/templates/2adc9a19-6132-4525-bd59-341e6a09f4e0';

test.each([
  null,
  'https://schema.metadatacenter.org/properties/d01cb533-265c-474a-95f3-9afb4616a6e1',
  'https://w3id.org/radx/radmo/auxiliaryMetadataKeyValuePair',
])('optional group IRI %s survives schema round trips without becoming an instance mapping', (iri) => {
  const group = CedarBuilders.attributeValueFieldBuilder().withSchemaName('attributes').build();
  const text = CedarBuilders.textFieldBuilder().withSchemaName('text').build();
  const groupDeployment = () => {
    const deployment = group.createDeploymentBuilder('attributes');
    if (iri !== null) deployment.withIri(iri);
    return deployment.build();
  };
  const element = CedarBuilders.templateElementBuilder()
    .withSchemaName('nested')
    .addChild(text, text.createDeploymentBuilder('text').withIri('urn:text').build())
    .addChild(group, groupDeployment())
    .build();
  const template = CedarBuilders.templateBuilder()
    .withAtId(templateId)
    .withSchemaName('Groups')
    .addChild(text, text.createDeploymentBuilder('text').withIri('urn:text').build())
    .addChild(group, groupDeployment())
    .addChild(element, element.createDeploymentBuilder('nested').withIri('urn:nested').build())
    .build();
  const writers = CedarWriters.json().getStrict();
  const jsonReaders = CedarReaders.json().getStrict();
  const yamlReaders = CedarReaders.yaml().getStrict();
  const yamlWriters = CedarWriters.yaml().getStrict();
  const rendered: any = writers.getTemplateWriter().getAsJsonNode(template);
  const renderedElement: any = writers.getTemplateElementWriter().getAsJsonNode(element);
  for (const schema of [rendered, renderedElement, rendered.properties.nested]) {
    const context = schema.properties['@context'];
    expect(context.properties.attributes).toEqual(iri === null ? undefined : { enum: [iri] });
    expect(context.required).not.toContain('attributes');
    expect(context.required).toContain('text');
  }
  const jsonTemplate = jsonReaders.getTemplateReader().readFromObject(rendered).template;
  const jsonElement = jsonReaders.getTemplateElementReader().readFromObject(renderedElement).element;
  expect(writers.getTemplateWriter().getAsJsonNode(jsonTemplate)).toEqual(rendered);
  expect(writers.getTemplateElementWriter().getAsJsonNode(jsonElement)).toEqual(renderedElement);
  const yamlTemplate = yamlReaders.getTemplateReader().readFromString(yamlWriters.getTemplateWriter().getAsYamlString(template)).template;
  const yamlElement = yamlReaders
    .getTemplateElementReader()
    .readFromString(yamlWriters.getTemplateElementWriter().getAsYamlString(element)).element;
  const fromYaml: any = writers.getTemplateWriter().getAsJsonNode(yamlTemplate);
  const elementFromYaml: any = writers.getTemplateElementWriter().getAsJsonNode(yamlElement);
  expect(fromYaml.properties['@context']).toEqual(rendered.properties['@context']);
  expect(fromYaml.properties.nested.properties['@context']).toEqual(rendered.properties.nested.properties['@context']);
  expect(elementFromYaml.properties['@context']).toEqual(renderedElement.properties['@context']);
  const sparse = yamlReaders.getTemplateInstanceReader().readFromString(`type: instance
name: metadata
isBasedOn: ${templateId}
children:
  nested:
    id: https://repo.metadatacenter.org/template-element-instances/8feaa3a4-7a2d-48d3-8a19-478562bb1bfa
    children:
      text:
        value: example
`).instance;
  InstanceInflater.inflate(sparse, jsonTemplate);
  const instance: any = writers.getTemplateInstanceWriter().getAsJsonNode(sparse);
  expect(instance['@context'].attributes).toBeUndefined();
  expect(instance.nested['@context'].attributes).toBeUndefined();
  expect(instance['@context'].text).toBe('urn:text');
});
