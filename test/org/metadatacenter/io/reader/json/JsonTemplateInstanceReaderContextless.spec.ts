import { CedarReaders, CedarWriters, JsonNode, JsonTemplateInstanceReader } from '../../../../../../src';
import { InstanceDataContainer } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataLinkAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataControlledAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataEmptyNode } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataEmptyNode';

/**
 * An element written without its `@context`, refused rather than guessed at.
 *
 * `@context` is what marks an element value. The reader once judged a node by
 * its whole key set and read any object holding a child key as an element, so
 * that an instance with every `@context` stripped still opened. No CEDAR host
 * passes that form, and production stores no such element, so both this reader
 * and the Java artifact library's now refuse an object without `@context` that
 * carries a key a child could take. The error names the key and its path.
 *
 * What holds only field-value keys reads as before: `{}`, an `@id` alone, an
 * `@value` alone and the other value shapes. So does an empty or
 * identifier-only entry in a list where another entry carries `@context`, which
 * is still an occurrence of the element.
 */
const read = (source: JsonNode): InstanceDataContainer =>
  CedarReaders.json()
    .getFebruary2024()
    .getTemplateInstanceReader()
    .readFromObject(source, undefined as never).instance.dataContainer;

const refusal = (key: string, pointer: string): string =>
  `An element value must carry @context, and an object without one cannot carry the child key "${key}" at ${pointer}.`;

describe('an object without @context that carries a child key', () => {
  const element = { '@context': { field: 'https://example.org/field' }, field: { '@value': 'inside' } };

  test.each([
    ['an element carrying only @id', { element: { '@id': 'https://example.org/e/1', field: { '@value': 'inside' } } }, '/element/field'],
    ['an element with no @id', { element: { field: { '@value': 'inside' } } }, '/element/field'],
    ['a value carrying a child key', { element: { '@value': 'x', field: { '@value': 'inside' } } }, '/element/field'],
    [
      'every entry of a list without a context-bearing entry',
      { element: [{ '@id': 'https://example.org/e/1', field: { '@value': 'one' } }] },
      '/element/0/field',
    ],
    ['an entry after a context-bearing one', { element: [element, { field: { '@value': 'two' } }] }, '/element/1/field'],
    [
      'an entry before a context-bearing one',
      { element: [{ '@id': 'https://example.org/e/1', field: [{ '@value': 'one' }] }, element] },
      '/element/0/field',
    ],
    [
      'an element nested in one that carries @context',
      { outer: { '@context': {}, inner: { field: { '@value': 'x' } } } },
      '/outer/inner/field',
    ],
  ] as [string, JsonNode, string][])('%s is refused', (_label, source, pointer) => {
    const key = pointer.split('/').pop() as string;
    expect(() => read(source)).toThrow(refusal(key, pointer));
  });

  test('the strict reader refuses it too', () => {
    const strict = CedarReaders.json().getStrict().getTemplateInstanceReader();
    expect(() => strict.readFromObject({ element: { field: { '@value': 'inside' } } } as JsonNode)).toThrow(
      refusal('field', '/element/field'),
    );
  });
});

describe('an object without @context that holds only field-value keys', () => {
  test('{} is an empty node', () => {
    expect(read({ element: {} }).values['element'] instanceof InstanceDataEmptyNode).toBe(true);
  });

  test('an @id alone is a link value', () => {
    const container = read({ link: { '@id': 'https://example.org/thing' } });
    expect(container.values['link'] instanceof InstanceDataLinkAtom).toBe(true);
  });

  test('an @id with a type is a link value', () => {
    const container = read({ link: { '@id': 'https://example.org/thing', '@type': 'xsd:anyURI' } });
    expect(container.values['link'] instanceof InstanceDataLinkAtom).toBe(true);
  });

  test('an @value alone is a literal', () => {
    const atom = read({ literal: { '@value': 'x' } }).values['literal'];
    expect(atom instanceof InstanceDataStringAtom).toBe(true);
    expect((atom as InstanceDataStringAtom).value).toBe('x');
  });

  test('a controlled term is a value', () => {
    const container = read({
      term: { '@id': 'https://example.org/term', 'rdfs:label': 'Term' },
    });
    const term = container.values['term'];
    expect(term instanceof InstanceDataControlledAtom).toBe(true);
    expect((term as InstanceDataControlledAtom).label).toBe('Term');
  });

  test('a legacy _valueLabel beside a value is not a child', () => {
    const atom = read({ literal: { '@value': 'x', _valueLabel: 'X' } }).values['literal'];
    expect(atom instanceof InstanceDataStringAtom).toBe(true);
  });

  /**
   * One production instance holds a repeated element whose entries are an
   * identifier-only occurrence and occurrences that carry `@context`.
   */
  test('beside a context-bearing entry, an identifier-only or empty entry is an occurrence of the element', () => {
    const container = read({
      element: [
        { '@id': 'https://example.org/e/1' },
        { '@context': { field: 'https://example.org/field' }, field: { '@value': 'two' } },
        {},
      ],
    });

    const occurrences = container.values['element'] as unknown as InstanceDataContainer[];
    expect(occurrences).toHaveLength(3);
    occurrences.forEach((occurrence) => expect(occurrence instanceof InstanceDataContainer).toBe(true));
    expect(occurrences[0].id).toBe('https://example.org/e/1');
    expect((occurrences[1].values['field'] as InstanceDataStringAtom).value).toBe('two');
  });
});

/**
 * A production compatibility boundary, not permission to create a new defect.
 *
 * Older CEDAR clients wrote an empty string while an element occurrence waited
 * for the repository to assign its identity. CEE uses the February 2024 reader,
 * so throwing here would make those stored instances impossible to open and
 * repair. The compatibility reader retains and reports the old spelling; its
 * writer emits null, and the artifact server mints the real IRI on update.
 * STRICT remains covered by YamlTemplateInstanceEdgeCases.spec.ts and refuses
 * the same JSON shape.
 */
describe('reading a legacy unassigned element occurrence identifier', () => {
  const source = {
    '@id': 'https://repo.metadatacenter.org/template-instances/1',
    '@context': { schema: 'http://schema.org/' },
    'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/1',
    element: {
      '@context': {},
      '@id': '',
      field: { '@value': 'inside' },
    },
  } as JsonNode;

  test('the compatibility reader opens it, records it, and writes the server-minting form', () => {
    const result = CedarReaders.json().getFebruary2024().getTemplateInstanceReader().readFromObject(source);
    const element = result.instance.dataContainer.values['element'] as InstanceDataContainer;

    expect(element.id).toBe('');
    expect(
      result.parsingResult
        .getBlueprintComparisonWarnings()
        .some((warning) => JSON.stringify(warning.errorPath).includes('element') && JSON.stringify(warning.errorPath).includes('@id')),
    ).toBe(true);

    const written = CedarWriters.json().getFebruary2024().getTemplateInstanceWriter().getAsJsonNode(result.instance);
    expect((written['element'] as JsonNode)['@id']).toBeNull();
  });
});

/**
 * `null` is how an element with no occurrences is written. Every branch of
 * `parseNode` began with `Object.hasOwn`, which throws on it, so an instance
 * carrying one took the reader down instead of parsing.
 */
describe('reading an instance containing nulls', () => {
  test('a null child parses as an empty node', () => {
    const container = read({ '@id': 'https://example.org/i/1', element: null } as unknown as JsonNode);
    expect(container.values['element'] instanceof InstanceDataEmptyNode).toBe(true);
  });

  test('a null inside a list parses as an empty node', () => {
    const container = read({ field: [null, { '@value': 'v' }] } as unknown as JsonNode);
    const list = container.values['field'] as unknown as unknown[];
    expect(list[0] instanceof InstanceDataEmptyNode).toBe(true);
    expect(list[1] instanceof InstanceDataStringAtom).toBe(true);
  });

  test('a value of null is still a value', () => {
    const container = read({ field: { '@value': null } } as unknown as JsonNode);
    const atom = container.values['field'] as InstanceDataStringAtom;
    expect(atom instanceof InstanceDataStringAtom).toBe(true);
    expect(atom.value).toBeNull();
  });
});

/**
 * Classifying one node on its own.
 *
 * The same question the reader answers while walking an instance, asked
 * directly. Consumers holding a bare node kept re-deriving it from the keys and
 * kept getting it subtly different — CEE had three rules, one of which matched
 * on exact key counts and so deleted the `@id` of any controlled term or link
 * that also carried a `@type`.
 */
describe('classifying a node on its own', () => {
  const reader = () => CedarReaders.json().getFebruary2024().getTemplateInstanceReader();

  test.each([
    ['a literal', { '@value': 'x' }, true],
    ['a literal with a type', { '@value': '1', '@type': 'xsd:int' }, true],
    ['a link', { '@id': 'https://example.org/x' }, true],
    ['a link with a type', { '@id': 'https://example.org/x', '@type': 'xsd:anyURI' }, true],
    ['a controlled term', { '@id': 'https://example.org/x', 'rdfs:label': 'X' }, true],
    ['a controlled term with a notation', { '@id': 'https://example.org/x', 'rdfs:label': 'X', 'skos:notation': 'N' }, true],
    ['an element', { field: { '@value': 'x' } }, false],
    ['an element carrying an @id', { '@id': 'https://example.org/e', field: { '@value': 'x' } }, false],
    ['an element carrying a @context', { '@context': {}, field: { '@value': 'x' } }, false],
    ['an empty object', {}, false],
  ] as [string, JsonNode, boolean][])('%s is a value node: %j -> %s', (_label, node, expected) => {
    expect(JsonTemplateInstanceReader.isValueNode(node)).toBe(expected);
  });

  test('null is not a value node', () => {
    expect(JsonTemplateInstanceReader.isValueNode(null)).toBe(false);
  });

  test('an attribute name is a value node', () => {
    expect(JsonTemplateInstanceReader.isValueNode('colour')).toBe(true);
  });

  test('readValueNode gives the type, and the type gives the value', () => {
    expect((reader() && JsonTemplateInstanceReader.readValueNode({ '@value': 'x' })) instanceof InstanceDataStringAtom).toBe(true);
    const link = JsonTemplateInstanceReader.readValueNode({ '@id': 'https://example.org/x', '@type': 'xsd:anyURI' });
    expect(link instanceof InstanceDataLinkAtom).toBe(true);
    expect((link as InstanceDataLinkAtom).id).toBe('https://example.org/x');
    const term = JsonTemplateInstanceReader.readValueNode({ '@id': 'https://example.org/x', 'rdfs:label': 'X' });
    expect(term instanceof InstanceDataControlledAtom).toBe(true);
    expect((term as InstanceDataControlledAtom).label).toBe('X');
  });

  test('an element is not read as a value', () => {
    expect(JsonTemplateInstanceReader.readValueNode({ field: { '@value': 'x' } }) instanceof InstanceDataEmptyNode).toBe(true);
  });
});

/**
 * A malformed `@id`, reported rather than passed through.
 *
 * `@value` and `@id` are not symmetrical. A literal's `@value` may be null —
 * JSON-LD permits it, and CEDAR declares the property `["string", "null"]`,
 * which is how an unfilled literal is written. An `@id` may not: JSON-LD
 * requires an IRI, and CEDAR's templates declare it
 * `{"type": "string", "format": "uri"}` with no null branch. An unfilled link or
 * controlled-term field is written `{}`.
 *
 * The round trip is what made this invisible: the reader took `{"@id": null}` as
 * a link atom with a null id and the writer emitted it straight back, so the
 * document survived intact and no stage objected. The node is still parsed and
 * preserved — that fidelity is deliberate — but the verdict now says it is
 * wrong.
 *
 * This is also the first thing the instance reader reports at all. Its
 * `parsingResult` was constructed and returned without a single write, so
 * `adheresToBlueprint()` answered true for every instance ever passed to it.
 */
const parseOf = (source: JsonNode) =>
  CedarReaders.json()
    .getFebruary2024()
    .getTemplateInstanceReader()
    .readFromObject(source, undefined as never).parsingResult;

/**
 * A complete instance, envelope included, so these tests answer only the
 * question they are about. An `@context` of `{}` and absent provenance are
 * themselves reported now, and this fixture used to carry both — which made
 * `adheresToBlueprint` false here for reasons that have nothing to do with an
 * `@id`. See `JsonTemplateInstanceReaderEnvelope.spec.ts` for those.
 */
const instanceWith = (values: object): JsonNode =>
  ({
    '@id': 'https://repo.metadatacenter.org/template-instances/1',
    '@context': { schema: 'http://schema.org/' },
    'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/1',
    'schema:name': 'n',
    'schema:description': '',
    'pav:createdOn': '2026-01-01T00:00:00-07:00',
    'pav:createdBy': 'https://metadatacenter.org/users/1',
    'pav:lastUpdatedOn': '2026-01-01T00:00:00-07:00',
    'oslc:modifiedBy': 'https://metadatacenter.org/users/1',
    ...values,
  }) as JsonNode;

describe('a null @id', () => {
  test('is reported', () => {
    const result = parseOf(instanceWith({ link: { '@id': null } }));
    expect(result.getBlueprintComparisonErrorCount()).toBe(1);
    expect(result.adheresToBlueprint()).toBe(false);
  });

  test('names the field and @id in its path', () => {
    const error = parseOf(instanceWith({ link: { '@id': null } })).getBlueprintComparisonErrors()[0];
    expect(JSON.stringify(error.errorPath)).toContain('link');
    expect(JSON.stringify(error.errorPath)).toContain('@id');
  });

  test('is still parsed and preserved, not dropped', () => {
    const container = read(instanceWith({ link: { '@id': null } }));
    const atom = container.values['link'];
    expect(atom instanceof InstanceDataLinkAtom).toBe(true);
    expect((atom as InstanceDataLinkAtom).id).toBeNull();
  });

  test('is reported inside a list, at its index', () => {
    const result = parseOf(instanceWith({ links: [{ '@id': 'https://example.org/a' }, { '@id': null }] }));
    expect(result.getBlueprintComparisonErrorCount()).toBe(1);
    expect(JSON.stringify(result.getBlueprintComparisonErrors()[0].errorPath)).toContain('1');
  });

  test('is reported inside an element', () => {
    const result = parseOf(instanceWith({ el: { '@context': { child: 'https://example.org/child' }, child: { '@id': null } } }));
    expect(result.getBlueprintComparisonErrorCount()).toBe(1);
    expect(JSON.stringify(result.getBlueprintComparisonErrors()[0].errorPath)).toContain('child');
  });
});

describe('what a null @id is not', () => {
  test('a null @value is legal and is not reported', () => {
    expect(parseOf(instanceWith({ literal: { '@value': null } })).getBlueprintComparisonErrorCount()).toBe(0);
  });

  test('{} is how an unfilled link is written, and is not reported', () => {
    expect(parseOf(instanceWith({ link: {} })).getBlueprintComparisonErrorCount()).toBe(0);
  });

  test('a real IRI is not reported', () => {
    expect(parseOf(instanceWith({ link: { '@id': 'https://example.org/a' } })).getBlueprintComparisonErrorCount()).toBe(0);
  });

  test('a correct instance still adheres', () => {
    expect(parseOf(instanceWith({ literal: { '@value': 'x' } })).adheresToBlueprint()).toBe(true);
  });
});
