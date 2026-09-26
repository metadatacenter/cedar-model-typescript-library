import { parse, stringify } from 'yaml';
import { CedarBuilders, CedarReaders, CedarWriters } from '../src';

const names = ['true', 'false', 'yes', 'no', 'on', 'off', 'null', '~', '<<', '=', '123', '2026-09-25', 'type', 'name', 'key', 'children', 'value', 'description'];

function templateWithNames() {
  const builder = CedarBuilders.templateBuilder().withSchemaName('Keyword field names');
  names.forEach((name, index) => {
    const field = CedarBuilders.textFieldBuilder().withSchemaName(name).build();
    builder.addChild(field, field.createDeploymentBuilder(name).withIri(`urn:field:${index}`).build());
  });
  return builder.build();
}

describe('reserved child schema names', () => {
  test.each(['@value', '@id', '@context', 'schema:name', '_annotations', 'rdfs:label', 'skos:notation'])('%s rejects actual child schemas, including arrays', (key) => {
    for (const array of [false, true]) {
      for (const typeArray of [false, true]) {
        const parent = JSON.parse(CedarWriters.json().getStrict().getTemplateWriter().getAsJsonString(templateWithNames()));
        const child = parent.properties.value;
        if (typeArray) child['@type'] = [child['@type']];
        parent.properties[key] = array ? { type: 'array', items: child } : child;
        expect(() => CedarReaders.json().getStrict().getTemplateReader().readFromObject(parent)).toThrow('reserved instance property name');
        expect(() => CedarReaders.json().getStrict().getTemplateElementReader().readFromObject(parent)).toThrow('reserved instance property name');
      }
    }
  });

  test.each(['@value', '@id', 'schema:name', 'rdfs:label'])('YAML also rejects %s', (name) => {
    const source = parse(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(templateWithNames()));
    source.children[0].key = name;
    expect(() => CedarReaders.yaml().getStrict().getTemplateReader().readFromObject(source)).toThrow('reserved instance property name');
    expect(() => CedarReaders.yaml().getStrict().getTemplateElementReader().readFromString(stringify({ ...source, type: 'element' }))).toThrow('reserved instance property name');
  });

  test.each([true, false, 123])('YAML child keys must remain strings: %s', (name) => {
    const source = parse(CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(templateWithNames()));
    source.children[0].key = name;
    expect(() => CedarReaders.yaml().getStrict().getTemplateReader().readFromString(stringify(source))).toThrow('Child key must be a string');
  });

  test('YAML scalar keywords and CEDAR YAML structural names remain distinct child names', () => {
    const template = templateWithNames();
    const writer = CedarWriters.json().getStrict().getTemplateWriter();
    const source = JSON.parse(writer.getAsJsonString(template));
    const read = CedarReaders.json().getStrict().getTemplateReader().readFromObject(source).template;
    const yaml = CedarWriters.yaml().getStrict().getTemplateWriter().getAsYamlString(read);
    const restored = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;
    const result = JSON.parse(writer.getAsJsonString(restored));
    for (const name of names) {
      expect(result.properties[name]['schema:name']).toBe(name);
      expect(result.properties['@context'].properties[name]).toEqual(source.properties['@context'].properties[name]);
    }
    expect(result._ui.order).toEqual(names);
    expect(yaml).toContain('key: "true"');
    expect(yaml).toContain('key: "null"');
  });
});
