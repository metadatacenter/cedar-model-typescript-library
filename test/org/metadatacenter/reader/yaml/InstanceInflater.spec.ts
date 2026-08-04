import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  InstanceInflater,
  NumberType,
} from '../../../../../src';

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
  artifact.createDeploymentBuilder(prop).withIri(`https://schema.metadatacenter.org/properties/${prop.slice(1)}`).build();

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
});
