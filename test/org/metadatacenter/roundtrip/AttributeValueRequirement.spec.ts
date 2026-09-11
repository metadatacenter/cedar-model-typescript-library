import { CedarBuilders, CedarReaders, CedarWriters, JsonNode, Template, TemplateField } from '../../../../src';

/**
 * An attribute-value field records no requirement, in either serialization.
 *
 * CEDAR keeps a requirement in the field's own `_valueConstraints`, and this type has none: its
 * property names come from whoever fills the form, so the template has no property to constrain and
 * carries `additionalProperties` in place of one. The JSON writer therefore omits the whole node,
 * and the JSON Schema `required` array excludes the key.
 *
 * The YAML form keeps a requirement somewhere else — on the child, in a `configuration:` block
 * every kind of child has — so it had a slot for something JSON could not carry, and used it. One
 * template then said the field was required when saved as YAML and said nothing when saved as JSON,
 * and the JSON is the form the artifact server stores and a form is rendered from. So what the YAML
 * claimed would never be enforced.
 *
 * The deployment builder declines to hold one, which is the rule and what makes the rest follow: a
 * document that declares one is read through that builder, so it arrives with none. The YAML writer
 * asks as well, because `ChildDeploymentInfo` carries these as public fields and a model can be
 * assembled without the builder — the last test here is the one that pins that guard. The Java
 * library's `AttributeValueField.Builder` has refused a requirement for as long as it has had the
 * method, by making it a no-op, so this brings the two into line.
 */
const named = (builder: {
  withSchemaName(name: string): unknown;
  withTitle(title: string): unknown;
  withDescription(description: string): unknown;
}) =>
  (builder.withSchemaName('Field') as typeof builder).withTitle('Field field schema') as unknown as {
    withDescription(description: string): { build(): TemplateField };
  };

/** A template of one child of this type, deployed under `key` and asked to be required. */
const templateWith = (field: TemplateField, key: string): Template => {
  const deployment = field.createDeploymentBuilder(key) as unknown as {
    withRequiredValue(value: boolean): { withRecommendedValue(value: boolean): { build(): never } };
  };
  const info = deployment.withRequiredValue(true).withRecommendedValue(true).build();
  return CedarBuilders.templateBuilder()
    .withSchemaName('Template')
    .withTitle('Template template schema')
    .withDescription('Exercises a requirement')
    .addChild(field, info)
    .build();
};

const attributeValueField = (): TemplateField => named(CedarBuilders.attributeValueFieldBuilder()).withDescription('An attribute').build();

const textField = (): TemplateField => named(CedarBuilders.textFieldBuilder()).withDescription('A text field').build();

const asYaml = (template: Template): string => CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template, false);

const asJson = (template: Template): JsonNode => CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);

const readYaml = (yaml: string): Template => CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;

const requirementOf = (template: Template, key: string) => {
  const info = template.getChildrenInfo().get(key) as unknown as { requiredValue: boolean; recommendedValue: boolean } | null;
  return { required: info?.requiredValue, recommended: info?.recommendedValue };
};

describe('a requirement on an attribute-value field', () => {
  test('is declined by the deployment builder', () => {
    const template = templateWith(attributeValueField(), 'Attribute');
    expect(requirementOf(template, 'Attribute')).toEqual({ required: false, recommended: false });
  });

  test('is written into neither serialization', () => {
    const template = templateWith(attributeValueField(), 'Attribute');

    const yaml = asYaml(template);
    expect(yaml).not.toContain('required:');
    expect(yaml).not.toContain('recommended:');

    const json = asJson(template);
    const property = json['properties'] as Record<string, JsonNode>;
    const definition = (property['Attribute']['items'] as JsonNode) ?? property['Attribute'];
    expect(definition['_valueConstraints']).toBeUndefined();
    expect(json['required']).not.toContain('Attribute');
  });

  test('is not honoured when an older document declares one', () => {
    const template = templateWith(attributeValueField(), 'Attribute');
    /*
     * The shape a document written before this change carries: the key under the
     * child's own `configuration:` block, which is where every other child keeps
     * it and where this one used to.
     */
    const yaml = asYaml(template).replace(
      /^(\s+)- key: "Attribute"$/m,
      '$1- key: "Attribute"\n$1  configuration:\n$1    required: true\n$1    recommended: true',
    );
    expect(yaml).toContain('required: true');

    expect(requirementOf(readYaml(yaml), 'Attribute')).toEqual({ required: false, recommended: false });
  });

  test('is not written for a deployment assembled without the builder', () => {
    /*
     * The writer's own guard, which the builder would otherwise hide. A
     * `ChildDeploymentInfo` carries its settings as public fields, and the YAML
     * reader assembles one that way before handing it to a builder, so a model
     * can hold a requirement the builder never accepted.
     */
    const field = attributeValueField();
    const info = field.createDeploymentBuilder('Attribute').build() as unknown as { requiredValue: boolean };
    info.requiredValue = true;

    const template = CedarBuilders.templateBuilder()
      .withSchemaName('Template')
      .withTitle('Template template schema')
      .withDescription('Exercises a requirement')
      .addChild(field, info as never)
      .build();

    expect(asYaml(template)).not.toContain('required:');
  });
});

describe('a requirement on a field that records one', () => {
  test('survives the YAML round trip, so the rule above is not a blanket', () => {
    const template = templateWith(textField(), 'Title');
    expect(requirementOf(template, 'Title')).toEqual({ required: true, recommended: true });

    const yaml = asYaml(template);
    expect(yaml).toContain('required: true');
    expect(requirementOf(readYaml(yaml), 'Title')).toEqual({ required: true, recommended: true });

    const json = asJson(template);
    const property = json['properties'] as Record<string, JsonNode>;
    const constraints = property['Title']['_valueConstraints'] as JsonNode;
    expect(constraints['requiredValue']).toBe(true);
  });
});
