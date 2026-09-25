import { parse } from 'yaml';
import { CedarBuilders, CedarReaders, CedarWriters, SchemaExtensions } from '../src';

const prefixes = { openminds: 'https://openminds.om-i.org/vocab/' };
const properties = {
  'openminds:schemaVersion': 'latest',
  'openminds:generatedAt': '2026-02-02T12:58:16.747364+00:00',
  'openminds:termMappings': { z: null, emptyMap: {}, emptyList: [], a: [true, 5, 'yes'], '12': { label: 'female' }, '2': 'first' },
};

function template() {
  const extensions = new SchemaExtensions(prefixes, properties);
  const field = CedarBuilders.textFieldBuilder().withSchemaName('value').withExtensions(extensions).build();
  const element = CedarBuilders.templateElementBuilder()
    .withSchemaName('subject')
    .withExtensions(extensions)
    .addChild(field, field.createDeploymentBuilder('value').withIri('urn:field:value').build())
    .build();
  return CedarBuilders.templateBuilder()
    .withSchemaName('study')
    .withExtensions(extensions)
    .addChild(element, element.createDeploymentBuilder('subject').withIri('urn:field:subject').build())
    .build();
}

describe('namespace-bound schema extensions', () => {
  test.each([false, true])('all three schema kinds preserve nested metadata through JSON and YAML (compact=%s)', (compact) => {
    const writer = CedarWriters.json().getStrict().getTemplateWriter();
    const original = writer.getAsJsonNode(template());
    const read = CedarReaders.json().getStrict().getTemplateReader().readFromObject(original);
    expect(read.parsingResult.getBlueprintComparisonErrors()).toEqual([]);
    const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(read.template, compact);
    expect(parse(yaml).extensions.properties).toEqual(properties);
    const readers = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
    const restored = readers.getTemplateReader().readFromString(yaml).template;
    const output: any = writer.getAsJsonNode(restored);
    for (const schema of [output, output.properties.subject, output.properties.subject.properties.value]) {
      expect(schema['@context'].openminds).toEqual(prefixes.openminds);
      for (const [key, value] of Object.entries(properties)) expect(schema[key]).toEqual(value);
    }
  });

  test('standalone static and attribute-value fields preserve extensions', () => {
    for (const builder of [CedarBuilders.richTextFieldBuilder(), CedarBuilders.attributeValueFieldBuilder()]) {
      const field = builder.withSchemaName('metadata').withExtensions(new SchemaExtensions(prefixes, properties)).build();
      const json = CedarWriters.json().getStrict().getFieldWriterForField(field).getAsJsonNode(field);
      const read = CedarReaders.json().getStrict().getTemplateFieldReader().readFromObject(json).field;
      expect(read.extensions.properties).toEqual(properties);
      const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(read).getAsYamlString(read);
      const restored = CedarReaders.yaml().getStrict().getTemplateFieldReader().readFromString(yaml).field;
      expect(restored.extensions.properties).toEqual(properties);
    }
  });

  test('extension values and namespace mappings cannot be mutated through constructor inputs or accessors', () => {
    const ns = { ...prefixes };
    const values = { 'openminds:nested': { value: 'original' } };
    const extensions = new SchemaExtensions(ns, values);
    ns.openminds = 'urn:changed';
    values['openminds:nested'].value = 'changed';
    extensions.prefixes.openminds = 'urn:changed';
    (extensions.properties['openminds:nested'] as any).value = 'changed';
    expect(extensions.prefixes).toEqual(prefixes);
    expect(extensions.properties).toEqual({ 'openminds:nested': { value: 'original' } });
  });

  test('canonical properties and unbound properties cannot be smuggled through extensions', () => {
    expect(() => new SchemaExtensions(prefixes, { 'schema:name': 'bad' })).toThrow('Unbound');
    expect(() => new SchemaExtensions({ schema: 'urn:bad' })).toThrow('Invalid');
    expect(() => new SchemaExtensions({ openminds: 'relative' })).toThrow('Invalid');
    expect(() => SchemaExtensions.fromYaml({ extensions: { prefixes } })).toThrow('requires');
  });

  test('ordinary malformed context mappings still produce diagnostics', () => {
    const source: any = CedarWriters.json().getStrict().getTemplateWriter().getAsJsonNode(template());
    source['@context'].unexpected = { '@type': '@id' };
    const read = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source);
    expect(read.parsingResult.getBlueprintComparisonErrors().length).toBeGreaterThan(0);
  });
});
