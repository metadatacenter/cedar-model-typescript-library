import {
  AbstractFieldChildDeploymentInfo,
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ChildDeploymentInfoElement,
} from '../../../../../src';

/**
 * Where `continuePreviousLine` may be stated, and where it may not.
 *
 * The CEDAR model gives the setting to a dynamic field: `literalFieldUIContent` and
 * `iriFieldUIContent` declare it, an element's `_ui` and a static field's do not, and every one of
 * those closes with `additionalProperties: false`. So a template whose element carries the setting
 * is a template the validation library rejects.
 *
 * This library used to keep it on the deployment info an element child shares with a field child.
 * A YAML document stating it for an element therefore came back with it set, the YAML writer wrote
 * it out again, and the JSON writer — having nowhere to put it — dropped it without a word, so the
 * same template said one thing in YAML and another in JSON, and disagreed with the Java library in
 * both.
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

describe('the line placement of an element child', () => {
  test('is not a setting its deployment info has', () => {
    const info = element().createDeploymentBuilder('el').build();
    expect(info).toBeInstanceOf(ChildDeploymentInfoElement);
    expect(info).not.toBeInstanceOf(AbstractFieldChildDeploymentInfo);
    expect('continuePreviousLine' in info).toBe(false);
  });

  test('is read past when a document states it, as the Java library reads past it', () => {
    const template = readTemplate(templateYaml('      continuePreviousLine: true\n'));
    expect(template.getChildrenInfo().get('el')).toBeInstanceOf(ChildDeploymentInfoElement);
    expect('continuePreviousLine' in template.getChildrenInfo().get('el')!).toBe(false);
  });

  test('is written by neither serialization, while a field child keeps its own', () => {
    const template = readTemplate(templateYaml('      continuePreviousLine: true\n'));
    const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(template, false);
    const json = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);

    expect(yaml).toBe(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(readTemplate(templateYaml('')), false));
    expect((json['properties'] as Record<string, Record<string, object>>)['el']['_ui']).toStrictEqual({
      order: ['inner'],
      propertyLabels: {},
      propertyDescriptions: {},
    });
    expect(yaml.match(/continuePreviousLine/g)).toHaveLength(1);
    expect((json['properties'] as Record<string, Record<string, object>>)['f']['_ui']).toStrictEqual({
      inputType: 'textfield',
      continuePreviousLine: true,
    });
  });
});
