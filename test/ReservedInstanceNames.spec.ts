import { CedarReaders, CedarWriters, InstanceDataContainer, InstanceDataStringAtom } from '../src';

const keys = ['__proto__', 'constructor', 'prototype', '@anything', 'rdfs:label'];

describe('reserved instance names are refused before dictionary insertion', () => {
  test.each(keys)('rejects ordinary JSON and YAML child %s at root and inside repeated elements', (key) => {
    for (const nested of [false, true]) {
      const child = JSON.parse(`{${JSON.stringify(key)}:{"@value":"KEEP"}}`);
      const json = {
        'schema:name': 'Audit',
        'schema:isBasedOn': 'https://example.org/t',
        ...(nested ? { Element: [{ '@context': {}, ...child }] } : child),
      };
      expect(() => CedarReaders.json().getStrict().getTemplateInstanceReader().readFromObject(json)).toThrow('reserved');
      const values = JSON.parse(`{${JSON.stringify(key)}:{"value":"KEEP"}}`);
      const yaml = {
        type: 'instance',
        name: 'Audit',
        isBasedOn: 'https://example.org/t',
        children: nested ? { Element: [{ children: values }] } : values,
      };
      expect(() => CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromObject(yaml)).toThrow('reserved');
    }
  });

  test('refuses prototype-named attribute groups and attributes before they disappear', () => {
    for (const group of [JSON.parse('{"__proto__":{"x":{"value":"KEEP"}}}'), JSON.parse('{"Attributes":{"__proto__":{"value":"KEEP"}}}')]) {
      expect(() =>
        CedarReaders.yaml()
          .getStrict()
          .getTemplateInstanceReader()
          .readFromObject({
            type: 'instance',
            name: 'Audit',
            isBasedOn: 'https://example.org/t',
            ...group,
          }),
      ).toThrow('reserved');
    }
  });

  test('dictionary bypass cannot silently discard a forbidden child', () => {
    const container = new InstanceDataContainer();
    container.values['__proto__'] = new InstanceDataStringAtom('KEEP');
    expect(Object.hasOwn(container.values, '__proto__')).toBe(true);
    expect(() => container.setValue('__proto__', new InstanceDataStringAtom('KEEP'))).toThrow('reserved');
    expect(() => {
      container.values = JSON.parse('{"__proto__":{}}');
    }).toThrow('reserved');
  });

  test('ordinary YAML keywords and prototype method names retain their literal data', () => {
    const source = {
      'schema:name': 'Audit',
      'schema:isBasedOn': 'https://example.org/t',
      type: { '@value': 'KEEP' },
      name: { '@value': 'KEEP' },
      toString: { '@value': 'KEEP' },
    };
    const instance = CedarReaders.json().getStrict().getTemplateInstanceReader().readFromObject(source).instance;
    const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getAsYamlString(instance);
    const restored = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(yaml).instance;
    const json = JSON.parse(CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonString(restored));
    for (const key of ['type', 'name', 'toString']) expect(json[key]).toEqual({ '@value': 'KEEP' });
  });
});
