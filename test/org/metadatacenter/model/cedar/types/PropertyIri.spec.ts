import { PropertyIri } from '../../../../../../src';

/**
 * The namespace a property IRI belongs to, which is all this class now says.
 *
 * It used to derive an IRI from a property's name, percent-encoded as a path segment, and a table of
 * names and their encodings was pinned here and in the Java library so the two could not drift. The
 * derivation is gone: an IRI is identity and the repository assigns it, so a name — which an author
 * can change — cannot be what it is built from.
 */
const NAMESPACE = 'https://schema.metadatacenter.org/properties/';

describe('a property IRI', () => {
  test('belongs to the namespace CEDAR assigns them in', () => {
    expect(PropertyIri.namespace).toBe(NAMESPACE);
  });
});
