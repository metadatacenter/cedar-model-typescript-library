import { CedarBuilders, CedarReaders, CedarWriters } from '../../../../src';

/**
 * Where an IRI outside a field's value may still be relative, and where only a strict reader
 * refuses one.
 *
 * Every identifier is an absolute IRI, as the Java readers require, with two exceptions the rule
 * matrix does not reach. A nested child's `@id` may be the temporary one the Template Designer
 * writes, because the server replaces it only after validating a write. An action's `sourceUri` may
 * be `template`, which the legacy editor writes for one of the template's own classes. A
 * compatibility reader also still opens a relative identifier on an artifact itself, as it always
 * has, and leaves it to the server to refuse one on a write.
 */
const STRICT = CedarReaders.json().getStrict();
const COMPATIBLE = CedarReaders.json().getFebruary2024();
const TEMPORARY = 'tmp-1542056961440-10793276';

function templateWithChild(): any {
  const text = CedarBuilders.textFieldBuilder().withSchemaName('text').build();
  const template = CedarBuilders.templateBuilder()
    .withSchemaName('Identifiers')
    .addChild(text, text.createDeploymentBuilder('text').withIri('https://example.org/properties/text').build())
    .build();
  const source: any = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template);
  source['@id'] = 'https://example.org/templates/identifiers';
  return source;
}

describe('identifier positions', () => {
  test("a nested child's temporary @id reads, and an artifact's own does not", () => {
    const source = templateWithChild();
    source.properties.text['@id'] = TEMPORARY;
    expect(STRICT.getTemplateReader().readFromObject(source).template.getChild('text')?.at_id.getValue()).toBe(TEMPORARY);

    source['@id'] = TEMPORARY;
    expect(() => STRICT.getTemplateReader().readFromObject(source)).toThrow(/absolute IRI/);
    expect(COMPATIBLE.getTemplateReader().readFromObject(source).template.at_id.getValue()).toBe(TEMPORARY);
  });

  test('a version in pav:previousVersion opens only in the compatibility reader', () => {
    const source = templateWithChild();
    source['pav:previousVersion'] = '0.0.1';
    expect(() => STRICT.getTemplateReader().readFromObject(source)).toThrow(/absolute IRI/);
    expect(COMPATIBLE.getTemplateReader().readFromObject(source).template.pav_previousVersion.getValue()).toBe('0.0.1');
  });

  test("an action's sourceUri of template reads, and a relative termUri does not", () => {
    const field = CedarBuilders.controlledTermFieldBuilder().withSchemaName('term').build();
    const source: any = CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonNode(field);
    source['@id'] = 'https://example.org/fields/term';
    source._valueConstraints.classes = [
      { uri: 'https://example.org/classes/kept', label: 'Kept', prefLabel: 'Kept', type: 'OntologyClass', source: 'SLOT' },
    ];
    source._valueConstraints.actions = [
      { to: 0, action: 'move', termUri: 'https://example.org/classes/moved', sourceUri: 'template', source: 'SLOT', type: 'OntologyClass' },
    ];
    const read = STRICT.getTemplateFieldReader().readFromObject(source);
    expect((read.field as any).valueConstraints.actions[0].sourceUri.getValue()).toBe('template');

    source._valueConstraints.actions[0].termUri = 'relative/path';
    expect(() => STRICT.getTemplateFieldReader().readFromObject(source)).toThrow(/absolute IRI/);
  });
});
