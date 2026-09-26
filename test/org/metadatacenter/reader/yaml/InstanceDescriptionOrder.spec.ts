import { CedarJsonReaders, CedarYamlReaders, CedarWriters } from '../../../../../src';

const writer = CedarWriters.json().getStrict().getTemplateInstanceWriter();
const baseYaml = 'type: instance\nname: "Example"\nisBasedOn: "https://example.org/template"\nchildren:\n  field:\n    value: "data"\n';

describe('Java instance description insertion order', () => {
  test.each([undefined, null, '', 'Details'])('JSON description %p', (description) => {
    const source = {
      'schema:name': 'Example',
      'schema:isBasedOn': 'https://example.org/template',
      field: { '@value': 'data' },
      ...(description === undefined ? {} : { 'schema:description': description }),
    };
    const instance = CedarJsonReaders.getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source)).instance;
    const result = writer.getAsJsonNode(instance);
    const keys = Object.keys(result);
    expect(result['schema:description']).toBe(description ?? '');
    if (description == null) {
      expect(keys.indexOf('schema:description')).toBe(keys.indexOf('schema:isBasedOn') + 1);
    } else {
      expect(keys.indexOf('schema:description')).toBe(keys.indexOf('schema:name') + 1);
    }
  });

  test.each(['', 'description: null\n', 'description: ""\n', 'description: "Details"\n'])('YAML description %p', (line) => {
    const instance = CedarYamlReaders.getStrict()
      .getTemplateInstanceReader()
      .readFromString(line + baseYaml).instance;
    const keys = Object.keys(writer.getAsJsonNode(instance));
    const after = line === '' || line.includes('null') ? 'schema:isBasedOn' : 'schema:name';
    expect(keys.indexOf('schema:description')).toBe(keys.indexOf(after) + 1);
  });

  test('an edited description is explicit even when absent on read', () => {
    const instance = CedarYamlReaders.getStrict().getTemplateInstanceReader().readFromString(baseYaml).instance;
    instance.schema_description = 'Added later';
    const keys = Object.keys(writer.getAsJsonNode(instance));
    expect(keys.indexOf('schema:description')).toBe(keys.indexOf('schema:name') + 1);
  });
});
