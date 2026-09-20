import { CedarBuilders, CedarReaders, CedarWriters, JsonNode } from '../../../../../../src';

/**
 * `_ui.order` is what an author decides, so it is the order a rendering states.
 *
 * Taking the `@context.required` names from `Object.keys` of the IRI map put every child whose
 * name looks like an array index first, in numeric order, because that is how JavaScript
 * enumerates an object's keys. A template with children named `14` and `18` came back with them
 * hoisted ahead of the rest and stopped matching what `cedar-artifact-library` writes from the
 * same document — three production templates, all of them ones whose names mix words and digits.
 */
const NAMES = ['Facility', '14', 'Level', '18', 'District'];

const contextRequired = (json: JsonNode): string[] => {
  const context = (json['properties'] as JsonNode)['@context'] as JsonNode;
  return context['required'] as string[];
};

describe('the required children follow the declared order', () => {
  it('keeps a numeric-looking child where the author put it, in a template', () => {
    const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(templateOf(NAMES));
    expect(contextRequired(json).slice(-NAMES.length)).toEqual(NAMES);
  });

  it('keeps it in an element too', () => {
    const json = CedarWriters.json().getStrict().getTemplateElementWriter().getAsJsonNode(elementOf(NAMES));
    expect(contextRequired(json).slice(-NAMES.length)).toEqual(NAMES);
  });

  it('survives a read of what was written', () => {
    const written = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(templateOf(NAMES));
    const reread = CedarReaders.json().getStrict().getTemplateReader().readFromObject(written).template;
    const again = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(reread);
    expect(contextRequired(again).slice(-NAMES.length)).toEqual(NAMES);
  });
});

function withChildren(builder: ReturnType<typeof CedarBuilders.templateBuilder>, names: string[]) {
  names.forEach((name, index) => {
    const field = CedarBuilders.textFieldBuilder().build();
    builder.addChild(
      field,
      field
        .createDeploymentBuilder(name)
        .withIri(`https://schema.metadatacenter.org/properties/child-${index}`)
        .build(),
    );
  });
  return builder.build();
}

function templateOf(names: string[]) {
  return withChildren(CedarBuilders.templateBuilder().withSchemaName('Register'), names);
}

function elementOf(names: string[]) {
  const builder = CedarBuilders.templateElementBuilder().withSchemaName('Register');
  names.forEach((name, index) => {
    const field = CedarBuilders.textFieldBuilder().build();
    builder.addChild(
      field,
      field
        .createDeploymentBuilder(name)
        .withIri(`https://schema.metadatacenter.org/properties/child-${index}`)
        .build(),
    );
  });
  return builder.build();
}
