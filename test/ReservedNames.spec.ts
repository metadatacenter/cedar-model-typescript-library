import { CedarBuilders, CedarReaders, ReservedNames } from '../src';

describe('ReservedNames', () => {
  test.each([
    '@id',
    '@anything',
    'schema:name',
    'schema:isBasedOn',
    'pav:derivedFrom',
    'oslc:modifiedBy',
    'rdfs:label',
    'skos:altLabel',
    '_annotations',
    '__proto__',
    'constructor',
    'prototype',
  ])('reserves %s for every child and attribute', (name) => {
    expect(ReservedNames.isReservedName(name)).toBe(true);
  });

  test.each(['type', 'name', 'children', 'Channel type', 'label'])('leaves %s to ordinary children', (name) => {
    expect(ReservedNames.isReservedName(name)).toBe(false);
  });

  test('reserves every template-instance YAML key for an attribute-value field of a template', () => {
    for (const name of ReservedNames.TEMPLATE_INSTANCE_YAML_KEYS) {
      expect(ReservedNames.isReservedAttributeValueFieldName(name, 'template')).toBe(true);
    }
    expect(ReservedNames.isReservedAttributeValueFieldName('Channel type', 'template')).toBe(false);
  });

  test('reserves only type, id and children for an attribute-value field of an element', () => {
    for (const name of ['type', 'id', 'children', 'schema:name']) {
      expect(ReservedNames.isReservedAttributeValueFieldName(name, 'element')).toBe(true);
    }
    for (const name of ['name', 'description', 'isBasedOn']) {
      expect(ReservedNames.isReservedAttributeValueFieldName(name, 'element')).toBe(false);
    }
  });
});

describe('reserved child names in the schema model', () => {
  const attributeValue = (name: string) => {
    const field = CedarBuilders.attributeValueFieldBuilder().withSchemaName(name).build();
    return [field, field.createDeploymentBuilder(name).build()] as const;
  };

  test.each(['type', 'name'])('a template refuses an attribute-value field named %s', (name) => {
    expect(() =>
      CedarBuilders.templateBuilder()
        .addChild(...attributeValue(name))
        .build(),
    ).toThrow('reserved for CEDAR instance metadata');
  });

  test('an ordinary field may take a YAML key name', () => {
    const field = CedarBuilders.textFieldBuilder().withSchemaName('type').build();
    expect(() => CedarBuilders.templateBuilder().addChild(field, field.createDeploymentBuilder('type').build()).build()).not.toThrow();
  });

  test('an element reserves only the nested YAML keys', () => {
    expect(() =>
      CedarBuilders.templateElementBuilder()
        .addChild(...attributeValue('type'))
        .build(),
    ).toThrow('reserved for CEDAR instance metadata');
    expect(() =>
      CedarBuilders.templateElementBuilder()
        .addChild(...attributeValue('name'))
        .build(),
    ).not.toThrow();
  });

  test('no child may take a reserved name', () => {
    const field = CedarBuilders.textFieldBuilder().withSchemaName('constructor').build();
    expect(() => CedarBuilders.templateBuilder().addChild(field, field.createDeploymentBuilder('constructor').build()).build()).toThrow(
      'reserved for CEDAR instance metadata',
    );
  });
});

describe('reserved attribute-value field names in instances', () => {
  const read = (source: object) =>
    CedarReaders.json()
      .getStrict()
      .getTemplateInstanceReader()
      .readFromObject(source as never);

  test('the JSON reader reports a template instance whose attribute-value group is named type', () => {
    const result = read({
      'schema:name': 'Example',
      'schema:isBasedOn': 'https://example.org/t',
      type: ['qeeq'],
      qeeq: { '@value': 'x' },
    });
    expect(result.parsingResult.wasSuccessful()).toBe(false);
  });

  test('the JSON reader accepts an attribute-value group named name inside an element', () => {
    const result = read({
      'schema:name': 'Example',
      'schema:isBasedOn': 'https://example.org/t',
      Element: { '@context': {}, '@id': 'https://example.org/e', name: ['given'], given: { '@value': 'x' } },
    });
    expect(result.parsingResult.wasSuccessful()).toBe(true);
  });
});
