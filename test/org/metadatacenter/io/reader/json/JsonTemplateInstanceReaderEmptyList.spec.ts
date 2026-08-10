import { CedarJsonReaders, CedarWriters, JsonNode } from '../../../../../../src';
import { InstanceDataAttributeValueField } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataAttributeValueField';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';

/**
 * Telling an empty list apart from an empty attribute-value field.
 *
 * Both are written `[]`, so the reader has to choose. What identifies an
 * attribute-value field is that its slots hold attribute *names* — but "every
 * entry is a name" is vacuously true of an empty array, and that alone was
 * folding `[]` into an attribute-value field. Every multi child the user had
 * simply not filled came back as one, and a consumer holding the template then
 * saw a cardinality mismatch on each of them. `InstanceValidator` carried a
 * workaround that converted such a field back to `[]` before counting, which is
 * the shape of the bug rather than a fix for it.
 *
 * The empty list is now read as the empty list it is. Both shapes still
 * serialize to `[]`, so nothing about round-trip fidelity turns on the choice.
 */
const CONTEXT = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  pav: 'http://purl.org/pav/',
  schema: 'http://schema.org/',
  oslc: 'http://open-services.net/ns/core#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
};

const instanceWith = (values: object) => ({
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  '@context': { ...CONTEXT },
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  'schema:name': 'An instance',
  'schema:description': '',
  ...values,
});

const read = (values: object) =>
  CedarJsonReaders.getStrict()
    .getTemplateInstanceReader()
    .readFromString(JSON.stringify(instanceWith(values))).instance.dataContainer;

const roundTrip = (values: object): JsonNode => {
  const result = CedarJsonReaders.getStrict()
    .getTemplateInstanceReader()
    .readFromString(JSON.stringify(instanceWith(values)));
  return CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(result.instance);
};

describe('an empty list', () => {
  it('is read as a list, not as an attribute-value field', () => {
    const value = read({ _tags: [] }).values['_tags'];
    expect(Array.isArray(value)).toBe(true);
    expect(value).toStrictEqual([]);
    expect(value instanceof InstanceDataAttributeValueField).toBe(false);
  });

  it('survives the round trip as an empty list', () => {
    expect(roundTrip({ _tags: [] })['_tags']).toStrictEqual([]);
  });
});

/**
 * The other half. A list that does hold names is still an attribute-value
 * field, and its named properties are still folded into it — the fix must not
 * have bought the empty case at the cost of the populated one.
 */
describe('a list of attribute names', () => {
  const populated = {
    _av: ['colour', 'size'],
    colour: { '@value': 'red' },
    size: { '@value': 'L' },
  };

  it('is read as an attribute-value field', () => {
    const value = read(populated).values['_av'];
    expect(value instanceof InstanceDataAttributeValueField).toBe(true);
  });

  it('carries the named attributes and their values', () => {
    const field = read(populated).values['_av'] as unknown as InstanceDataAttributeValueField;
    expect(Object.keys(field.values).sort()).toStrictEqual(['colour', 'size']);
    expect((field.values['colour'] as InstanceDataStringAtom).value).toBe('red');
  });

  it('does not leave the named properties behind as siblings', () => {
    const container = read(populated);
    expect(Object.hasOwn(container.values, 'colour')).toBe(false);
    expect(Object.hasOwn(container.values, 'size')).toBe(false);
  });

  it('survives the round trip as its list of names', () => {
    const out = roundTrip(populated);
    expect((out['_av'] as unknown as string[]).sort()).toStrictEqual(['colour', 'size']);
    expect(out['colour']).toStrictEqual({ '@value': 'red' });
  });
});
