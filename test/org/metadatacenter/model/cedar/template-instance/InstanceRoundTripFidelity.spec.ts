import { CedarJsonReaders, CedarWriters } from '../../../../../../src';

/**
 * Instance round-trip fidelity: read an instance, write it, lose nothing.
 *
 * Both of these were found by diffing this library's output against the Java
 * artifact library's over the shared cedar-test-artifacts corpus. In each case
 * the Java library preserved something this one dropped, so a document that
 * survived one library did not survive the other.
 */
describe('instance round-trip fidelity', () => {
  const roundTrip = (source: object): any => {
    const result = CedarJsonReaders.getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source));
    return CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(result.instance);
  };

  const CONTEXT = {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    pav: 'http://purl.org/pav/',
    schema: 'http://schema.org/',
    oslc: 'http://open-services.net/ns/core#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
  };

  /**
   * An empty controlled-term field is `{}` — present but unfilled, which is
   * different from absent. The reader classified it correctly as an empty atom;
   * the writer had no branch for that type, fell through to `return null`, and
   * the caller then skipped the key. So the field vanished.
   */
  describe('empty values', () => {
    const withValues = (values: object) => ({
      '@id': 'https://repo.metadatacenter.org/template-instances/0001',
      '@context': { ...CONTEXT },
      'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/0001',
      'schema:name': 'An instance',
      'schema:description': '',
      ...values,
    });

    it('keeps an empty controlled-term field', () => {
      const out = roundTrip(withValues({ 'Contributor Role': {} }));
      expect(Object.hasOwn(out, 'Contributor Role')).toBe(true);
      expect(out['Contributor Role']).toStrictEqual({});
    });

    it('keeps an empty literal field, distinct from an empty controlled term', () => {
      // The two shapes mean different things and must not be collapsed into
      // each other, in either direction.
      const out = roundTrip(withValues({ Literal: { '@value': null }, Controlled: {} }));
      expect(out['Literal']).toStrictEqual({ '@value': null });
      expect(out['Controlled']).toStrictEqual({});
    });

    it('keeps empty entries inside a repeated field', () => {
      const out = roundTrip(withValues({ Repeated: [{}, {}] }));
      expect(out['Repeated']).toStrictEqual([{}, {}]);
    });

    it('keeps an empty field nested in an element', () => {
      // A nested element carries its own `@context`; that is what marks it as a
      // container rather than a value. Without one, `parseNode` sees the `@id`
      // and reads the whole element as a link atom, losing its children.
      const out = roundTrip(
        withValues({
          Element: {
            '@context': { Inner: 'https://schema.metadatacenter.org/properties/3333' },
            '@id': 'https://repo.metadatacenter.org/template-element-instances/1',
            Inner: {},
          },
        }),
      );
      expect(out['Element']['Inner']).toStrictEqual({});
    });
  });

  /**
   * A template may declare more children than an instance populates. Their
   * `@context` entries were dropped because the reader only walked the keys
   * present in the body, which made a round trip non-idempotent for any such
   * instance.
   */
  describe('@context', () => {
    const base = {
      '@id': 'https://repo.metadatacenter.org/template-instances/0002',
      '@context': {
        ...CONTEXT,
        'Populated Field': 'https://schema.metadatacenter.org/properties/1111',
        'Absent Element': 'https://schema.metadatacenter.org/properties/2222',
      },
      'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/0002',
      'schema:name': 'An instance',
      'schema:description': '',
      'Populated Field': { '@value': 'something' },
    };

    it('keeps the mapping for a child that carries no data', () => {
      const out = roundTrip(base);
      expect(out['@context']['Absent Element']).toBe('https://schema.metadatacenter.org/properties/2222');
    });

    it('still keeps the mapping for a child that does', () => {
      const out = roundTrip(base);
      expect(out['@context']['Populated Field']).toBe('https://schema.metadatacenter.org/properties/1111');
    });

    it('is idempotent — a second pass changes nothing', () => {
      const once = roundTrip(base);
      const twice = roundTrip(once);
      expect(twice).toStrictEqual(once);
    });

    it('does not duplicate or drop the standard prefixes', () => {
      const out = roundTrip(base);
      for (const prefix of Object.keys(CONTEXT)) {
        expect(out['@context'][prefix]).toBe(CONTEXT[prefix as keyof typeof CONTEXT]);
      }
      // The typed entries the writer always supplies.
      expect(out['@context']['rdfs:label']).toStrictEqual({ '@type': 'xsd:string' });
    });
  });
});
