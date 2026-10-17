import {
  BioportalTermType,
  ControlledTermActionBuilder,
  ControlledTermBranchBuilder,
  ControlledTermClassBuilder,
  ControlledTermDefaultValueBuilder,
  ControlledTermOntologyBuilder,
  ControlledTermValueSetBuilder,
  ControlledTermVersion,
  Iri,
} from '../../../../../../../../src';

/**
 * A constraint that points at nothing is not a constraint.
 *
 * Every field of these six builders was declared with an empty default — `''`
 * or `Iri.empty()` — so `build()` succeeded on whatever the caller happened to
 * have set, and an ontology constraint naming no ontology serialized as
 * `{"uri": "", "acronym": "DOID", "name": "Disease"}`. That document reaches the
 * terminology server as a request it cannot answer, and nothing between the
 * caller and the server would have said so.
 *
 * Which fields are required is measured, not assumed: across the 437 artifacts
 * in `cedar-test-artifacts`, each field checked here is present on every
 * occurrence of its constraint and empty on none. The two that measurement shows
 * are optional — an ontology's `numTerms` and an action's `to` — are left alone,
 * and are asserted below to still build without them.
 */
const IRI = new Iri('http://purl.obolibrary.org/obo/DOID_4');
const SOURCE_IRI = new Iri('https://data.bioontology.org/ontologies/DOID');

describe('a controlled-term constraint refuses to be built incomplete', () => {
  test('an ontology needs its URI, acronym and name', () => {
    const full = () => new ControlledTermOntologyBuilder().withAcronym('DOID').withName('Disease').withUri(SOURCE_IRI);
    expect(() => new ControlledTermOntologyBuilder().withAcronym('DOID').withName('Disease').build()).toThrow(/requires a URI/);
    expect(() => full().withAcronym('').build()).toThrow(/requires an acronym/);
    expect(() => full().withName('').build()).toThrow(/requires a name/);
    expect(full().build().uri.getValue()).toBe(SOURCE_IRI.getValue());
  });

  test('a branch needs its URI, source, acronym and name', () => {
    const full = () => new ControlledTermBranchBuilder().withSource('DOID').withAcronym('DOID').withName('disease').withUri(IRI);
    expect(() => new ControlledTermBranchBuilder().withName('disease').build()).toThrow(/requires a URI/);
    expect(() => full().withSource('').build()).toThrow(/requires a source/);
    expect(full().build().name).toBe('disease');
  });

  test('a class needs its URI, both labels, source and type', () => {
    const full = () =>
      new ControlledTermClassBuilder()
        .withLabel('disease')
        .withPrefLabel('disease')
        .withSource('DOID')
        .withType(BioportalTermType.ONTOLOGY_CLASS)
        .withUri(IRI);
    expect(() => new ControlledTermClassBuilder().withLabel('disease').build()).toThrow(/requires a URI/);
    expect(() => full().withPrefLabel('').build()).toThrow(/requires a preferred label/);
    expect(() => full().withType(BioportalTermType.NULL).build()).toThrow(/requires a term type/);
    expect(full().build().label).toBe('disease');
  });

  test('a value set needs its URI, collection and name', () => {
    const full = () => new ControlledTermValueSetBuilder().withVsCollection('CEDARVS').withName('values').withUri(SOURCE_IRI);
    expect(() => new ControlledTermValueSetBuilder().withName('values').build()).toThrow(/requires a URI/);
    expect(() => full().withVsCollection('').build()).toThrow(/requires a value-set collection/);
    expect(full().build().name).toBe('values');
  });

  test('an action needs both URIs, its action, source and type', () => {
    const full = () =>
      new ControlledTermActionBuilder()
        .withAction('delete')
        .withSource('DOID')
        .withType(BioportalTermType.ONTOLOGY_CLASS)
        .withTermUri(IRI)
        .withSourceUri(SOURCE_IRI);
    expect(() => new ControlledTermActionBuilder().withAction('delete').build()).toThrow(/requires a term URI/);
    expect(() => full().withSourceUri(Iri.empty()).build()).toThrow(/requires a source URI/);
    expect(full().build().action).toBe('delete');
  });

  test('a default value needs its term URI and label', () => {
    expect(() => new ControlledTermDefaultValueBuilder().withRdfsLabel('disease').build()).toThrow(/requires a term URI/);
    expect(() => new ControlledTermDefaultValueBuilder().withTermUri(IRI).build()).toThrow(/requires a label/);
    expect(new ControlledTermDefaultValueBuilder().withTermUri(IRI).withRdfsLabel('disease').build().rdfsLabel).toBe('disease');
  });
});

/** The fields measurement shows are genuinely optional stay optional. */
describe('what a constraint may leave out', () => {
  test('an ontology builds without numTerms, which only some ontologies carry', () => {
    const ontology = new ControlledTermOntologyBuilder().withAcronym('DOID').withName('Disease').withUri(SOURCE_IRI).build();
    expect(ontology.numTerms).toBeNull();
  });

  test('an action builds without a destination', () => {
    const action = new ControlledTermActionBuilder()
      .withAction('delete')
      .withSource('DOID')
      .withType(BioportalTermType.ONTOLOGY_CLASS)
      .withTermUri(IRI)
      .withSourceUri(SOURCE_IRI)
      .build();
    expect(action.to).toBeNull();
  });
});

/**
 * A pinned version must identify a snapshot.
 *
 * The id is the snapshot's content hash and the only part resolution reads, so an empty id and one
 * made only of whitespace identify nothing. Java's `VersionSpec` refuses both. Blank is Java's
 * `String.isBlank`, whose whitespace is not what JavaScript's `trim` removes. The readers refuse
 * such an id before they construct a version, so these cases reach the constructor only from a
 * caller that builds a version itself.
 */
describe('a pinned version refuses an id that identifies no snapshot', () => {
  test('an empty id', () => {
    expect(() => new ControlledTermVersion('')).toThrow('A pinned version requires an id.');
  });

  test('an id an untyped caller leaves out', () => {
    expect(() => new ControlledTermVersion(undefined as unknown as string)).toThrow('A pinned version requires an id.');
  });

  // Five cases: a space, the five whitespace controls, two information separators, two Unicode spaces,
  // and the ogham space mark, line separator, paragraph separator and medium mathematical space.
  test.each([' ', '\t\n\u000b\f\r', '\u001c\u001f', '\u2003\u3000', '\u1680\u2028\u2029\u205f'])(
    'an id made only of Java whitespace (%j)',
    (id) => {
      expect(() => new ControlledTermVersion(id)).toThrow("A pinned version's id must not be blank.");
    },
  );

  // Three cases: whitespace around the hash, the three no-break spaces, and a zero-width space, a
  // byte-order mark and a next-line control. Java counts none of the last six as whitespace.
  test.each([' a1b2c3d4e5f6 ', '\u00a0\u2007\u202f', '\u200b\ufeff\u0085'])('accepts an id that is not blank in Java (%j)', (id) => {
    const ontology = new ControlledTermOntologyBuilder()
      .withAcronym('DOID')
      .withName('Disease')
      .withUri(SOURCE_IRI)
      .withVersion(new ControlledTermVersion(id))
      .build();
    expect(ontology.version?.id).toBe(id);
  });
});
