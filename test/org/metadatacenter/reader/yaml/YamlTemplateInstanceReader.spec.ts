import { CedarReaders, CedarWriters } from '../../../../../src';

/**
 * The YAML instance reader reads back what the YAML instance writer wrote.
 *
 * An instance is taken in as JSON (so it arrives with a real `@context`), turned
 * into YAML, read back through the new reader, and written to YAML again. The two
 * YAML documents must be identical: everything the YAML serialization carries —
 * literals, typed values, controlled terms, links, a nested element, an
 * attribute-value field — has to survive the reader. `@context` is not among
 * them; it is template data the YAML never held and the writer never emits, so
 * its absence cannot make the round trip differ.
 */
const CONTEXT = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  pav: 'http://purl.org/pav/',
  schema: 'http://schema.org/',
  oslc: 'http://open-services.net/ns/core#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  'rdfs:label': { '@type': 'xsd:string' },
  'schema:isBasedOn': { '@type': '@id' },
  'schema:name': { '@type': 'xsd:string' },
  'schema:description': { '@type': 'xsd:string' },
  _note: 'https://schema.metadatacenter.org/properties/note',
  _count: 'https://schema.metadatacenter.org/properties/count',
  _org: 'https://schema.metadatacenter.org/properties/org',
  _link: 'https://schema.metadatacenter.org/properties/link',
  _addr: 'https://schema.metadatacenter.org/properties/addr',
};

const jsonInstance = {
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  'schema:name': 'My Instance',
  'schema:description': '',
  _note: { '@value': 'hello' },
  _count: { '@value': '42', '@type': 'xsd:decimal' },
  _org: { '@id': 'https://example.org/terms/hs', 'rdfs:label': 'Homo sapiens' },
  _link: { '@id': 'https://example.org/thing' },
  _addr: {
    '@id': 'https://repo.metadatacenter.org/template-element-instances/e1',
    _city: { '@value': 'Palo Alto' },
    '@context': { _city: 'https://schema.metadatacenter.org/properties/city' },
  },
  '@context': CONTEXT,
};

describe('YamlTemplateInstanceReader', () => {
  const jsonReader = CedarReaders.json().getStrict().getTemplateInstanceReader();
  const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
  const yamlReader = CedarReaders.yaml().getStrict().getTemplateInstanceReader();

  const modelFromJson = jsonReader.readFromObject(jsonInstance, undefined as never).instance;
  const yamlOnce = yamlWriter.getAsYamlString(modelFromJson);
  const modelFromYaml = yamlReader.readFromString(yamlOnce).instance;
  const yamlTwice = yamlWriter.getAsYamlString(modelFromYaml);

  test('a YAML instance round-trips write → read → write unchanged', () => {
    expect(yamlTwice).toBe(yamlOnce);
  });

  test('the envelope survives', () => {
    expect(modelFromYaml.schema_name).toBe('My Instance');
    expect(modelFromYaml.schema_isBasedOn.getValue()).toBe('https://repo.metadatacenter.org/templates/t1');
    expect(modelFromYaml.at_id.getValue()).toBe('https://repo.metadatacenter.org/template-instances/i1');
  });

  test('every value kind is present after reading YAML', () => {
    const yaml = yamlWriter.getAsYamlString(modelFromYaml);
    expect(yaml).toContain('value: "hello"'); // literal
    expect(yaml).toContain('datatype: "xsd:decimal"'); // typed
    expect(yaml).toContain('label: "Homo sapiens"'); // controlled term
    expect(yaml).toContain('https://example.org/thing'); // link
    expect(yaml).toContain('value: "Palo Alto"'); // value nested in an element
  });
});
