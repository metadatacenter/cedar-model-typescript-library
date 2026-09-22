import { CedarBuilders, CedarReaders, CedarWriters, InstanceInflater, NumberType, TemporalType } from '../../../../../src';

/**
 * A YAML instance, inflated with its template, writes back as a valid JSON
 * instance — the piece the reader alone cannot supply.
 *
 * The YAML has no `@context`; the inflater fills the property IRIs from the
 * template so the emitted JSON `@context` carries a per-property entry for each
 * field, including inside a nested element. Missing children are re-added and
 * child order follows the template.
 */
const id = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const field = (name: string) =>
  CedarBuilders.textFieldBuilder()
    .withAtId(`https://repo.metadatacenter.org/template-fields/${id(name)}`)
    .withSchemaName(name)
    .withSchemaDescription(name)
    .build();

const dep = (artifact: any, prop: string) =>
  artifact
    .createDeploymentBuilder(prop)
    .withIri(`https://schema.metadatacenter.org/properties/${prop.slice(1)}`)
    .build();

const city = field('city');
const element = CedarBuilders.templateElementBuilder()
  .withAtId('https://repo.metadatacenter.org/template-elements/addr')
  .withSchemaName('addr')
  .withSchemaDescription('addr')
  .addChild(city, dep(city, '_city'))
  .build();

const note = field('note');
const count = CedarBuilders.numericFieldBuilder()
  .withAtId('https://repo.metadatacenter.org/template-fields/count')
  .withSchemaName('count')
  .withSchemaDescription('count')
  .withNumberType(NumberType.DECIMAL)
  .build();

const template = CedarBuilders.templateBuilder()
  .withAtId('https://repo.metadatacenter.org/templates/t1')
  .withSchemaName('T')
  .withSchemaDescription('T')
  .addChild(note, dep(note, '_note'))
  .addChild(count, dep(count, '_count'))
  .addChild(element, dep(element, '_addr'))
  .build();

// A sparse YAML instance: values only, no @context, and _count omitted entirely.
const sparseYaml = `type: "instance"
name: "My Instance"
isBasedOn: "https://repo.metadatacenter.org/templates/t1"
children:
  _note:
    value: "hello"
  _addr:
    id: "https://repo.metadatacenter.org/template-element-instances/e1"
    children:
      _city:
        value: "Palo Alto"
`;

describe('InstanceInflater', () => {
  const instance = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(sparseYaml).instance;
  InstanceInflater.inflate(instance, template);
  const json = JSON.parse(CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonString(instance));
  const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getAsYamlString(instance);

  test('the @context gains a property IRI for each template field', () => {
    expect(json['@context']._note).toBe('https://schema.metadatacenter.org/properties/note');
    expect(json['@context']._count).toBe('https://schema.metadatacenter.org/properties/count');
    expect(json['@context']._addr).toBe('https://schema.metadatacenter.org/properties/addr');
  });

  test('a nested element gets its own @context for its children', () => {
    expect(json._addr['@context']._city).toBe('https://schema.metadatacenter.org/properties/city');
  });

  test('values the sparse instance carried are preserved', () => {
    expect(json._note).toEqual({ '@value': 'hello' });
    expect(json._addr._city).toEqual({ '@value': 'Palo Alto' });
  });

  test('an omitted field is re-added and children follow template order', () => {
    expect(Object.hasOwn(json, '_count')).toBe(true);
    const dataKeys = Object.keys(json).filter((k) => k.startsWith('_'));
    expect(dataKeys).toEqual(['_note', '_count', '_addr']);
  });

  test('writing the inflated model back to YAML restores the sparse canonical form', () => {
    expect(yaml).toContain('_note:');
    expect(yaml).toContain('_addr:');
    expect(yaml).not.toContain('_count:');
    expect(yaml).not.toContain('value: null');
  });
});

/**
 * An attribute-value field always uses an array-shaped empty slot.
 *
 * Unlike a single field, its empty representation is a list, not an object.
 * This one is written as a list of the attribute names it holds, so naming none is
 * `[]`, and `{}` is a shape no reader of a CEDAR instance produces for it.
 */
describe('InstanceInflater on an attribute-value field', () => {
  const label = field('label');
  const attributes = CedarBuilders.attributeValueFieldBuilder()
    .withAtId('https://repo.metadatacenter.org/template-fields/attributes')
    .withSchemaName('attributes')
    .withSchemaDescription('attributes')
    .build();
  const avTemplate = CedarBuilders.templateBuilder()
    .withAtId('https://repo.metadatacenter.org/templates/t2')
    .withSchemaName('T2')
    .withSchemaDescription('T2')
    .addChild(label, dep(label, '_label'))
    .addChild(attributes, dep(attributes, '_attributes'))
    .build();

  const jsonWriter = CedarWriters.json().getStrict().getTemplateInstanceWriter();
  const jsonReader = CedarReaders.json().getStrict().getTemplateInstanceReader();

  const inflatedFrom = (yaml: string) => {
    const instance = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(yaml).instance;
    InstanceInflater.inflate(instance, avTemplate);
    return JSON.parse(jsonWriter.getAsJsonString(instance));
  };

  const sparse = `type: "instance"
name: "AV Instance"
isBasedOn: "https://repo.metadatacenter.org/templates/t2"
children:
  _label:
    value: "hello"
`;

  test('an omitted attribute-value field is re-added as an empty list', () => {
    expect(inflatedFrom(sparse)._attributes).toEqual([]);
  });

  test('an inflated empty attribute-value field stays omitted from YAML', () => {
    const instance = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(sparse).instance;
    InstanceInflater.inflate(instance, avTemplate);
    const yaml = CedarWriters.yaml().getStrict().getTemplateInstanceWriter().getAsYamlString(instance);

    expect(yaml).not.toContain('_attributes:');
    expect(yaml).not.toContain('[]');
  });

  test('and not as the empty node an omitted single child gets', () => {
    const out = inflatedFrom(sparse);
    expect(out._label).toEqual({ '@value': 'hello' });
    expect(out._attributes).not.toEqual({});
  });

  /*
   * The property that makes the shape the right one rather than merely a different
   * one: what inflating produces is what reading the result produces, so a document
   * does not change shape by being passed through the two in either order.
   */
  test('the inflated instance reads back unchanged', () => {
    const inflated = inflatedFrom(sparse);
    const reread = JSON.parse(jsonWriter.getAsJsonString(jsonReader.readFromString(JSON.stringify(inflated)).instance));
    expect(reread._attributes).toEqual([]);
  });

  test('attributes the instance already names are preserved', () => {
    const named = {
      ...inflatedFrom(sparse),
      _attributes: ['colour'],
      colour: { '@value': 'red' },
    };
    const instance = jsonReader.readFromString(JSON.stringify(named)).instance;
    InstanceInflater.inflate(instance, avTemplate);
    const out = JSON.parse(jsonWriter.getAsJsonString(instance));

    expect(out._attributes).toEqual(['colour']);
    expect(out.colour).toEqual({ '@value': 'red' });
  });
});

// Missing values must use deployment cardinality at every depth, including
// authority fields that older saved instances omitted altogether.
describe('InstanceInflater missing repeated children', () => {
  test.each([
    ['text', () => CedarBuilders.textFieldBuilder()],
    ['NIH grant', () => CedarBuilders.extNihGrantIdFieldBuilder()],
    ['DOI', () => CedarBuilders.extDoiFieldBuilder()],
  ])('%s preserves array shape through nested elements and repeated inflation', (_name, make) => {
    const child = make().withSchemaName('value').withSchemaDescription('value').build();
    const multiple = child.createDeploymentBuilder('_many').withMultiInstance(true).withMinItems(0).build();
    const nested = CedarBuilders.templateElementBuilder()
      .withSchemaName('nested')
      .withSchemaDescription('nested')
      .addChild(child, multiple)
      .addChild(child, child.createDeploymentBuilder('_single').build())
      .build();
    const parent = CedarBuilders.templateElementBuilder()
      .withSchemaName('parent')
      .withSchemaDescription('parent')
      .addChild(nested, nested.createDeploymentBuilder('_nested').withMultiInstance(true).build())
      .build();
    const schema = CedarBuilders.templateBuilder()
      .withSchemaName('test')
      .withSchemaDescription('test')
      .addChild(child, multiple)
      .addChild(nested, nested.createDeploymentBuilder('_absentElements').withMultiInstance(true).build())
      .addChild(parent, parent.createDeploymentBuilder('_parent').build())
      .build();
    const instance = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(`type: instance
name: Sparse
isBasedOn: https://repo.metadatacenter.org/templates/t1
children:
  _parent:
    children:
      _nested:
        - children: {}
        - children: {}
`).instance;
    const writer = CedarWriters.json().getStrict().getTemplateInstanceWriter();
    InstanceInflater.inflate(instance, schema);
    const first = JSON.parse(writer.getAsJsonString(instance));
    expect(first._many).toEqual([]);
    expect(first._absentElements).toEqual([]);
    expect(first._parent._nested).toHaveLength(2);
    for (const occurrence of first._parent._nested) {
      expect(occurrence._many).toEqual([]);
      expect(occurrence._single).toEqual(_name === 'text' ? { '@value': null } : {});
    }
    InstanceInflater.inflate(instance, schema);
    expect(JSON.parse(writer.getAsJsonString(instance))).toEqual(first);
  });
});

describe('InstanceInflater empty single-field shapes', () => {
  test('restores literal types and recursively creates missing single elements like Java', () => {
    const number = CedarBuilders.numericFieldBuilder().withSchemaName('number').withNumberType(NumberType.INT).build();
    const date = CedarBuilders.temporalFieldBuilder().withSchemaName('date').withTemporalType(TemporalType.DATE).build();
    const element = CedarBuilders.templateElementBuilder()
      .withSchemaName('element')
      .addChild(number, number.createDeploymentBuilder('_number').build())
      .addChild(date, date.createDeploymentBuilder('_date').build())
      .build();
    const schema = CedarBuilders.templateBuilder()
      .withSchemaName('test')
      .addChild(element, element.createDeploymentBuilder('_element').build())
      .build();
    const instance = CedarReaders.yaml().getStrict().getTemplateInstanceReader().readFromString(`type: instance
name: Sparse
isBasedOn: https://repo.metadatacenter.org/templates/t1
children: {}
`).instance;
    InstanceInflater.inflate(instance, schema);
    const json = JSON.parse(CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonString(instance));
    expect(json._element._number).toEqual({ '@value': null, '@type': 'xsd:int' });
    expect(json._element._date).toEqual({ '@value': null, '@type': 'xsd:date' });
  });
});
