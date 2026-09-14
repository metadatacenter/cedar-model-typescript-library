import { CedarBuilders, CedarReaders, CedarWriters } from '../../../../../src';

/**
 * What a container says about each of its children, across a YAML round trip.
 *
 * A container carries a label and a description for every child, in `_ui.propertyLabels` and
 * `_ui.propertyDescriptions`. YAML writes one only where it differs from the child's own name or
 * description, since repeating the child's name under `label` would state the same string twice.
 * Reading such a document as though the container had said nothing loses the entry rather than the
 * repetition, and a template written as YAML and read back came out with a thinner `_ui` than the
 * JSON it was made from.
 *
 * The Java library's YAML reader fills each entry from the child's own value wherever the document
 * overrides nothing, so the two libraries now return the same model from the same document.
 */
const template = (label: string | null) => {
  const field = CedarBuilders.textFieldBuilder()
    .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
    .withSchemaName('Lab identifier')
    .withSchemaDescription('The identifier the lab uses')
    .build();
  const deployment = field.createDeploymentBuilder('lab_id');
  if (label !== null) {
    deployment.withLabel(label);
  }
  const built = CedarBuilders.templateBuilder()
    .withAtId('https://repo.metadatacenter.org/templates/00000000-0000-0000-0000-000000000000')
    .withSchemaName('Lab')
    .withSchemaDescription('d')
    .build();
  built.addChild(field, deployment.build());
  return built;
};

const roundTrip = (label: string | null) => {
  const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template(label));
  return {
    yaml,
    read: CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template,
  };
};

describe("a container's entry for a child", () => {
  test('comes back as the child of its own name where the document declares no override', () => {
    const { yaml, read } = roundTrip(null);

    expect(yaml).not.toContain('overrideLabel:');
    expect(read.getChildrenInfo().get('lab_id')?.label).toBe('Lab identifier');
    expect(read.getChildrenInfo().get('lab_id')?.description).toBe('The identifier the lab uses');
  });

  test('comes back as the override where the document declares one', () => {
    const { yaml, read } = roundTrip('Identifier');

    expect(yaml).toContain('overrideLabel: "Identifier"');
    expect(read.getChildrenInfo().get('lab_id')?.label).toBe('Identifier');
  });

  /**
   * The entries come back filled, not restored to what the model held before: a container that
   * declared nothing about a child is indistinguishable, once written as YAML, from one that
   * labelled the child with its own name. So a pass through YAML leaves a CEDAR template — whose
   * `_ui` names every child — as it was, and gives one to a template built without any. That is
   * what the Java library does with the same document, and closing the gap would mean changing what
   * the YAML writers leave out rather than what the readers put back.
   */
  test('survives a pass through YAML where the JSON declares it, and appears where it does not', () => {
    const ui = (t: ReturnType<typeof template>) =>
      (CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(t) as Record<string, Record<string, object>>)['_ui'];

    expect(ui(roundTrip('Identifier').read)['propertyLabels']).toStrictEqual({ lab_id: 'Identifier' });
    expect(ui(template(null))['propertyLabels']).toStrictEqual({});
    expect(ui(roundTrip(null).read)['propertyLabels']).toStrictEqual({ lab_id: 'Lab identifier' });
    expect(ui(roundTrip(null).read)['propertyDescriptions']).toStrictEqual({
      lab_id: 'The identifier the lab uses',
    });
  });
});
