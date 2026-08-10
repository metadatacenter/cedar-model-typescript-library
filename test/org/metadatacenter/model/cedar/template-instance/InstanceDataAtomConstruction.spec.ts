import {
  CedarReaders,
  CedarWriters,
  InstanceDataControlledAtom,
  InstanceDataLinkAtom,
  InstanceDataStringAtom,
  InstanceDataTypedAtom,
  JsonNode,
} from '../../../../../../src';

/**
 * What the builders refuse, and why the readers do not.
 *
 * The rule was only ever written down in one direction. `reportNullIri` has held
 * since it was added that `{"@id": null}` is malformed — JSON-LD requires an IRI
 * and CEDAR's templates declare one with no null branch — so the reader names it
 * in the parsing verdict. Nothing said the same thing about *building* one, and
 * the atoms took `string | null` throughout, so a consumer could compose the
 * document the reader would go on to complain about, and the writer would emit
 * it without a word.
 *
 * The 693 tests in place at the time all passed, and would have passed after any
 * change here, because every one of them constructs a valid atom. The gap was
 * not a regression that slipped through; it was an invariant asserted on the
 * parse side and never mirrored on the build side. These are the mirror.
 */
describe('an atom a consumer builds', () => {
  test.each([
    ['null', null],
    ['undefined', undefined],
    ['the empty string', ''],
  ])('a link refuses %s for its IRI', (_label, id) => {
    expect(() => new InstanceDataLinkAtom(id as unknown as string)).toThrow(/requires an IRI/);
  });

  test.each([
    ['null', null],
    ['the empty string', ''],
  ])('a controlled term refuses %s for its IRI', (_label, id) => {
    expect(() => new InstanceDataControlledAtom(id as unknown as string, 'One')).toThrow(/requires an IRI/);
  });

  /**
   * The shape CEE was hand-writing into fixtures because it could not ask for
   * one: a label with nothing to label. It is not a term, and the reader makes
   * an empty atom of it rather than a controlled one.
   */
  test.each([
    ['null', null],
    ['the empty string', ''],
  ])('a controlled term refuses %s for its label', (_label, label) => {
    expect(() => new InstanceDataControlledAtom('https://x/1', label as unknown as string)).toThrow(/requires a label/);
  });

  test('a typed literal refuses a missing type, which would make it a string atom', () => {
    expect(() => new InstanceDataTypedAtom('7', null as unknown as string)).toThrow(/requires a type/);
  });

  /** A literal's value may be null. That is how an unfilled field is written. */
  test('a literal accepts a null value', () => {
    expect(new InstanceDataStringAtom(null).value).toBeNull();
    expect(new InstanceDataTypedAtom(null, 'xsd:date').value).toBeNull();
  });

  test('the valid constructions still build', () => {
    expect(new InstanceDataLinkAtom('https://x/1').id).toBe('https://x/1');
    const term = new InstanceDataControlledAtom('https://x/1', 'One');
    expect([term.id, term.label]).toEqual(['https://x/1', 'One']);
  });
});

/**
 * The reader's side of the same rule.
 *
 * Refusing at construction must not turn a malformed document into an exception
 * on the way in. Fidelity to what a host actually sent is worth more than a tidy
 * model: a consumer cannot report which field lost what if the library repairs
 * it in passing. So the reader preserves the node, reports it, and the writer
 * gives it back unchanged.
 */
describe('an atom a reader parses', () => {
  const instanceWith = (node: JsonNode): JsonNode =>
    ({
      '@id': 'https://repo.metadatacenter.org/template-instances/1',
      'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/1',
      _f: node,
    }) as unknown as JsonNode;

  const read = (node: JsonNode) => CedarReaders.json().getFebruary2024().getTemplateInstanceReader().readFromObject(instanceWith(node));

  test('a null IRI survives parsing rather than throwing', () => {
    const parsed = read({ '@id': null } as unknown as JsonNode);
    const atom = parsed.instance.dataContainer.values['_f'];
    expect(atom).toBeInstanceOf(InstanceDataLinkAtom);
    expect((atom as InstanceDataLinkAtom).id).toBeNull();
  });

  test('a term with a null IRI survives too, label and all', () => {
    const parsed = read({ '@id': null, 'rdfs:label': 'One' } as unknown as JsonNode);
    const atom = parsed.instance.dataContainer.values['_f'];
    expect(atom).toBeInstanceOf(InstanceDataControlledAtom);
    expect((atom as InstanceDataControlledAtom).id).toBeNull();
    expect((atom as InstanceDataControlledAtom).label).toBe('One');
  });

  test('and the writer hands it back as it arrived', () => {
    const parsed = read({ '@id': null } as unknown as JsonNode);
    const written = CedarWriters.json().getFebruary2024().getTemplateInstanceWriter().getAsJsonNode(parsed.instance);
    expect((written as unknown as Record<string, unknown>)['_f']).toEqual({ '@id': null });
  });
});
