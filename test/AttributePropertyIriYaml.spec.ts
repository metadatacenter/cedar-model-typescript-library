import { CedarJsonReaders, CedarWriters, CedarYamlReaders } from '../src';

/**
 * An attribute's property IRI is the instance's own. The server mints it when the attribute is first
 * stored, and no template states it, so the YAML form has to carry it or a trip through YAML loses it.
 * Both writers put it beside the attribute's value under `propertyIri`, the key a template uses for a
 * child's property IRI, in the full and the compact form, at the root and in an element, and both
 * readers put it back in the `@context` of the instance or element that holds the attribute.
 * `AttributeValuePropertyIriYamlTest` holds the Java library to the same.
 */
describe('An attribute property IRI in YAML', () => {
  const rootIri = 'https://schema.metadatacenter.org/properties/root-attribute';
  const nestedIri = 'https://schema.metadatacenter.org/properties/nested-attribute';
  const source = {
    '@context': {
      Extra: 'https://schema.metadatacenter.org/properties/extra',
      'Root attribute': rootIri,
      Block: 'https://schema.metadatacenter.org/properties/block',
    },
    '@id': 'https://repo.metadatacenter.org/template-instances/i1',
    'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
    'schema:name': 'Instance',
    'schema:description': '',
    Extra: ['Root attribute'],
    'Root attribute': { '@value': 'at the root' },
    Block: {
      '@context': { More: 'https://schema.metadatacenter.org/properties/more', 'Nested attribute': nestedIri },
      '@id': 'https://repo.metadatacenter.org/template-element-instances/e1',
      More: ['Nested attribute'],
      'Nested attribute': { '@value': 'in an element' },
    },
  };
  const instance = () => CedarJsonReaders.getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source)).instance;
  const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
  const jsonWriter = CedarWriters.json().getStrict().getTemplateInstanceWriter();
  const readYaml = (text: string, compact = false) =>
    (compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict()).getTemplateInstanceReader().readFromString(text)
      .instance;

  test.each([false, true])('writes the IRI beside the value and reads it back into the @context (compact=%s)', (compact) => {
    const text = yamlWriter.getAsYamlString(instance(), compact);
    expect(text).toContain(`propertyIri: "${rootIri}"`);
    expect(text).toContain(`propertyIri: "${nestedIri}"`);
    const written: any = jsonWriter.getAsJsonNode(readYaml(text, compact));
    expect(written['@context']['Root attribute']).toBe(rootIri);
    expect(written.Block['@context']['Nested attribute']).toBe(nestedIri);
  });

  test('reads an attribute stating no IRI as one with no term', () => {
    const text = yamlWriter.getAsYamlString(instance()).replace(/^\s*propertyIri: "[^"]*"\n/gm, '');
    const restored = readYaml(text);
    expect(restored.dataContainer.hasIri('Root attribute')).toBe(false);
    expect((jsonWriter.getAsJsonNode(restored) as any)['Root attribute']).toEqual({ '@value': 'at the root' });
  });

  test('refuses an IRI that is not absolute', () => {
    expect(() => readYaml(yamlWriter.getAsYamlString(instance()).replace(rootIri, 'relative/attribute'))).toThrow();
  });

  test("refuses an ordinary field's IRI, which is its template's", () => {
    const text = `type: instance
name: "Instance"
isBasedOn: "https://repo.metadatacenter.org/templates/t1"
children:
  Text:
    value: "plain"
    propertyIri: "https://schema.metadatacenter.org/properties/text"
`;
    expect(() => readYaml(text)).toThrow(/propertyIri/);
  });
});
