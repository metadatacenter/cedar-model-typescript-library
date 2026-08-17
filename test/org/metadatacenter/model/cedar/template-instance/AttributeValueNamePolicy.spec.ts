import {
  AttributeValueNamePolicy,
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  InstanceDataAttributeValueField,
  InstanceDataAttributeValueFieldName,
  InstanceDataContainer,
  InstanceDataStringAtom,
  InstanceValidator,
  TemplateInstanceBuilder,
} from '../../../../../../src';

const instanceWith = (container: InstanceDataContainer) =>
  new TemplateInstanceBuilder()
    .withSchemaIsBasedOn('https://repo.metadatacenter.org/templates/collisions')
    .withDataContainer(container)
    .build();

const collidingContainer = (): InstanceDataContainer => {
  const container = new InstanceDataContainer();
  container.setValue('_title', new InstanceDataStringAtom('ordinary'));
  const attributes = new InstanceDataAttributeValueField('_attributes');
  attributes.addValue('_title', new InstanceDataStringAtom('attribute'));
  container.setValue('_attributes', attributes);
  return container;
};

const jsonInstance = (values: object) => ({
  '@id': 'https://repo.metadatacenter.org/template-instances/collisions',
  '@context': {},
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/collisions',
  'schema:name': 'Collisions',
  'schema:description': '',
  ...values,
});

describe('attribute-value name policy', () => {
  it('finds a collision with an ordinary sibling', () => {
    expect(AttributeValueNamePolicy.findConflicts(collidingContainer())).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'sibling', name: '_title', groupName: '_attributes' })]),
    );
  });

  it('finds reserved JSON-LD and CEDAR instance names', () => {
    for (const name of ['@context', '@anything', 'schema:name', 'pav:createdOn', '_annotations']) {
      expect(AttributeValueNamePolicy.isReserved(name)).toBe(true);
    }
  });

  it('finds one attribute name used by two AV fields', () => {
    const container = new InstanceDataContainer();
    for (const groupName of ['_first', '_second']) {
      const group = new InstanceDataAttributeValueField(groupName);
      group.addValue('shared', new InstanceDataStringAtom(groupName));
      container.setValue(groupName, group);
    }
    expect(AttributeValueNamePolicy.findConflicts(container)).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'duplicate', name: 'shared', groupName: '_second' })]),
    );
  });

  it('checks nested containers independently', () => {
    const root = new InstanceDataContainer();
    root.setValue('_element', collidingContainer());
    expect(AttributeValueNamePolicy.findConflicts(root)).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '_title', path: ['_element'] })]),
    );
  });
});

describe('assertValid says which conflict it refused, and where', () => {
  it('names a reserved attribute', () => {
    const container = new InstanceDataContainer();
    const attributes = new InstanceDataAttributeValueField('_attributes');
    attributes.addValue('@context', new InstanceDataStringAtom('reserved'));
    container.setValue('_attributes', attributes);

    expect(() => AttributeValueNamePolicy.assertValid(container)).toThrow(
      /"@context" at \/_attributes\/@context is reserved for instance metadata/,
    );
  });

  it('names a collision with an ordinary sibling', () => {
    expect(() => AttributeValueNamePolicy.assertValid(collidingContainer())).toThrow(
      /"_title" at \/_attributes\/_title collides with another child in the same object/,
    );
  });

  it('names the other field an attribute is already used by', () => {
    const container = new InstanceDataContainer();
    for (const groupName of ['_first', '_second']) {
      const group = new InstanceDataAttributeValueField(groupName);
      group.addValue('shared', new InstanceDataStringAtom(groupName));
      container.setValue(groupName, group);
    }

    expect(() => AttributeValueNamePolicy.assertValid(container)).toThrow(
      /"shared" at \/_second\/shared is also used by attribute-value field "_first"/,
    );
  });

  it('passes a container that holds no conflict', () => {
    const container = new InstanceDataContainer();
    const attributes = new InstanceDataAttributeValueField('_attributes');
    attributes.addValue('colour', new InstanceDataStringAtom('blue'));
    container.setValue('_attributes', attributes);

    expect(() => AttributeValueNamePolicy.assertValid(container)).not.toThrow();
  });
});

describe('writers fail before a collision can overwrite data', () => {
  it.each([
    ['JSON', () => CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instanceWith(collidingContainer()))],
    ['YAML', () => CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getYamlAsJsonNode(instanceWith(collidingContainer()))],
  ])('%s rejects the conflicting model', (_format, write) => {
    expect(write).toThrow(/_title.*collides/);
  });
});

describe('writers keep pending attribute rows out of artifacts', () => {
  it('omits an unnamed slot while retaining named attributes', () => {
    const container = new InstanceDataContainer();
    container.setValue('_attributes', [
      new InstanceDataAttributeValueFieldName(''),
      new InstanceDataAttributeValueFieldName('   '),
      new InstanceDataAttributeValueFieldName('colour'),
    ]);
    container.setValue('colour', new InstanceDataStringAtom('blue'));

    const written = CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instanceWith(container));

    expect(written._attributes).toEqual(['colour']);
    expect(written.colour).toEqual({'@value': 'blue'});

    const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getYamlAsJsonNode(instanceWith(container));
    expect(yaml._attributes).toEqual({colour: {value: 'blue'}});
  });
});

describe('readers report names that cannot safely convert to JSON', () => {
  it('reports a reserved attribute name in JSON', () => {
    const result = CedarReaders.json()
      .getStrict()
      .getTemplateInstanceReader()
      .readFromObject(jsonInstance({ _attributes: ['@context'] }) as never);
    expect(result.parsingResult.wasSuccessful()).toBe(false);
  });

  it('reports duplicate names in a JSON AV list', () => {
    const result = CedarReaders.json()
      .getStrict()
      .getTemplateInstanceReader()
      .readFromObject(jsonInstance({ _attributes: ['colour', 'colour'], colour: { '@value': 'blue' } }) as never);
    expect(result.parsingResult.wasSuccessful()).toBe(false);
  });

  it('reports a YAML attribute that collides with a child', () => {
    const result = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(`
type: template-instance
isBasedOn: https://repo.metadatacenter.org/templates/collisions
children:
  _title:
    value: ordinary
_attributes:
  _title:
    value: attribute
`);
    expect(result.parsingResult.wasSuccessful()).toBe(false);
  });
});

describe('template-aware validation resolves JSON ambiguity', () => {
  it('reports an AV name that is also a declared ordinary field', () => {
    const title = CedarBuilders.textFieldBuilder().withSchemaName('Title').withSchemaDescription('').build();
    const attributes = CedarBuilders.attributeValueFieldBuilder().withSchemaName('Attributes').withSchemaDescription('').build();
    const attributeDeployment = attributes.createDeploymentBuilder('_attributes').build();
    const template = CedarBuilders.templateBuilder()
      .withSchemaName('Collision template')
      .withSchemaDescription('')
      .addChild(title, title.createDeploymentBuilder('_title').build())
      .addChild(attributes, attributeDeployment as never)
      .build();
    const parsed = CedarReaders.json()
      .getStrict()
      .getTemplateInstanceReader()
      .readFromObject(jsonInstance({ _attributes: ['_title'], _title: { '@value': 'ambiguous' } }) as never).instance;

    expect(InstanceValidator.validate(parsed, template).adheresToBlueprint()).toBe(false);
  });
});
