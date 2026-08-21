import { CedarBuilders, CedarWriters } from '../../../../../../src';

const PROPERTY_IRI = 'https://schema.metadatacenter.org/properties/mapped';

const children = () => {
  const unmapped = CedarBuilders.textFieldBuilder().build();
  const mapped = CedarBuilders.textFieldBuilder().build();
  return {
    unmapped,
    mapped,
    unmappedDeployment: unmapped.createDeploymentBuilder('unmapped').build(),
    mappedDeployment: mapped.createDeploymentBuilder('mapped').withIri(PROPERTY_IRI).build(),
  };
};

const expectContextTermsToMatchMappings = (json: Record<string, unknown>) => {
  const context = (json['properties'] as Record<string, Record<string, unknown>>)['@context'];
  const properties = context['properties'] as Record<string, unknown>;
  const required = context['required'] as string[];
  const instanceRequired = json['required'] as string[];

  expect(properties['unmapped']).toBeUndefined();
  expect(required).not.toContain('unmapped');
  expect(properties['mapped']).toEqual({ enum: [PROPERTY_IRI] });
  expect(required).toContain('mapped');
  // The child is still part of every instance. Only its context term waits for repository minting.
  expect(instanceRequired).toEqual(expect.arrayContaining(['unmapped', 'mapped']));
};

describe('JSON container context property IRIs', () => {
  test('a template requires only child terms for which it has an IRI mapping', () => {
    const { unmapped, mapped, unmappedDeployment, mappedDeployment } = children();
    const template = CedarBuilders.templateBuilder().addChild(unmapped, unmappedDeployment).addChild(mapped, mappedDeployment).build();

    const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);

    expectContextTermsToMatchMappings(json);
  });

  test('an element requires only child terms for which it has an IRI mapping', () => {
    const { unmapped, mapped, unmappedDeployment, mappedDeployment } = children();
    const element = CedarBuilders.templateElementBuilder()
      .addChild(unmapped, unmappedDeployment)
      .addChild(mapped, mappedDeployment)
      .build();

    const json = CedarWriters.json().getStrict().getTemplateElementWriter().getAsJsonNode(element);

    expectContextTermsToMatchMappings(json);
  });
});
