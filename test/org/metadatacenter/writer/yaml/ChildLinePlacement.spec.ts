import {
  AbstractFieldChildDeploymentInfo,
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ChildDeploymentInfoElement,
} from '../../../../../src';

/**
 * Where `continuePreviousLine` and `valueRecommendationEnabled` may be stated, and where they may
 * not.
 *
 * The CEDAR model gives both to a dynamic field: `literalFieldUIContent` and `iriFieldUIContent`
 * declare them, an element's `_ui` and a static field's do not, and every one of those closes with
 * `additionalProperties: false`. So a template whose element carries either is a template the
 * validation library rejects.
 *
 * This library used to keep both on the deployment info an element child shares with a field child.
 * A YAML document stating a line placement for an element therefore came back with it set, the YAML
 * writer wrote it out again, and the JSON writer — having nowhere to put it — dropped it without a
 * word, so the same template said one thing in YAML and another in JSON, and disagreed with the Java
 * library in both. A value recommendation reached an element the same way, and no writer would ever
 * emit one for an element.
 */
const element = () =>
  CedarBuilders.templateElementBuilder()
    .withAtId('https://repo.metadatacenter.org/template-elements/00000000-0000-0000-0000-000000000000')
    .withTitle('Sample')
    .withDescription('d')
    .withSchemaName('Sample')
    .withSchemaDescription('d')
    .build();

const templateYaml = (childConfiguration: string) => `type: template
name: "T"
description: "d"
id: "https://repo.metadatacenter.org/templates/00000000-0000-0000-0000-000000000000"
status: draft
version: 0.0.1
modelVersion: 1.6.0
children:
  - key: "el"
    type: element
    name: "el"
    id: "https://repo.metadatacenter.org/template-elements/00000000-0000-0000-0000-000000000001"
    status: draft
    version: 0.0.1
    modelVersion: 1.6.0
    children:
      - key: "inner"
        type: text-field
        name: "inner"
        id: "https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000002"
        modelVersion: 1.6.0
        configuration:
          propertyIri: "https://schema.metadatacenter.org/properties/00000000-0000-0000-0000-000000000003"
    configuration:
      propertyIri: "https://schema.metadatacenter.org/properties/00000000-0000-0000-0000-000000000004"
${childConfiguration}  - key: "f"
    type: text-field
    name: "f"
    id: "https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000005"
    modelVersion: 1.6.0
    configuration:
      propertyIri: "https://schema.metadatacenter.org/properties/00000000-0000-0000-0000-000000000006"
      continuePreviousLine: true
`;

const readTemplate = (yaml: string) => CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;

const elementStates =
  '      continuePreviousLine: true\n      valueRecommendation: true\n      hidden: true\n      required: true\n      recommended: true\n';

describe('the settings an element child cannot carry', () => {
  test('are not settings its deployment info has', () => {
    const info = element().createDeploymentBuilder('el').build();
    expect(info).toBeInstanceOf(ChildDeploymentInfoElement);
    expect(info).not.toBeInstanceOf(AbstractFieldChildDeploymentInfo);
    expect('continuePreviousLine' in info).toBe(false);
    expect('valueRecommendationEnabled' in info).toBe(false);
    // `hidden`, `requiredValue` and `recommendedValue` are answered for every child and settable
    // only where the model keeps one, so an element reports the absence rather than hiding it.
    expect(info.hidden).toBe(false);
    expect(info.requiredValue).toBe(false);
    expect(info.recommendedValue).toBe(false);
  });

  test('are read past when a document states them, as the Java library reads past them', () => {
    const template = readTemplate(templateYaml(elementStates));
    const info = template.getChildrenInfo().get('el');
    expect(info).toBeInstanceOf(ChildDeploymentInfoElement);
    if (!(info instanceof ChildDeploymentInfoElement)) throw new Error('the element child lost its deployment info');
    expect('continuePreviousLine' in info).toBe(false);
    expect('valueRecommendationEnabled' in info).toBe(false);
    expect(info.hidden).toBe(false);
    expect(info.requiredValue).toBe(false);
    expect(info.recommendedValue).toBe(false);
  });

  test('are written by neither serialization, while a field child keeps its own', () => {
    const template = readTemplate(templateYaml(elementStates));
    const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template, false);
    const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);

    expect(yaml).toBe(
      CedarWriters.yaml()
        .getStrict()
        .getTemplateWriter()
        .getAsYamlString(readTemplate(templateYaml('')), false),
    );
    // The element labels and describes its child with the child's own name and description, which
    // the YAML leaves out and the reader puts back. An absent description is the empty string, as
    // the Java library reads it, so the entry is present and empty rather than absent.
    expect((json['properties'] as Record<string, Record<string, object>>)['el']['_ui']).toStrictEqual({
      order: ['inner'],
      propertyLabels: { inner: 'inner' },
      propertyDescriptions: { inner: '' },
    });
    expect(yaml.match(/continuePreviousLine/g)).toHaveLength(1);
    expect((json['properties'] as Record<string, Record<string, object>>)['f']['_ui']).toStrictEqual({
      inputType: 'textfield',
      continuePreviousLine: true,
    });
  });
});
