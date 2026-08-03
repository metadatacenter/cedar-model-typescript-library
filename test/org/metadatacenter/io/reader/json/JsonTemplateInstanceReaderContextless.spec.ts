import { CedarReaders, JsonNode, JsonTemplateInstanceReader } from '../../../../../../src';
import { InstanceDataContainer } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataLinkAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataControlledAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';
import { InstanceDataEmptyNode } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataEmptyNode';

/**
 * Telling an element apart from an IRI-valued field, when the element has not
 * written its `@context`.
 *
 * `parseNode` used to ask three questions in order: `@value` means a literal,
 * `@context` means an element, `@id` means an IRI. That works for the canonical
 * serialisation, where every element carries a `@context`. It does not work for
 * the reduced forms real consumers pass around — the CEDAR Embeddable Editor
 * keeps an "extract" copy of every instance with the `@context` maps stripped,
 * and its elements still carry the `@id` it stamped on them. Every one of those
 * came back as a link atom, and the entire subtree under it was lost.
 *
 * The node is now judged by its whole key set: a value carries only value keys,
 * so anything holding a child property is an element whatever else it has.
 */
const read = (source: JsonNode): InstanceDataContainer =>
  CedarReaders.json().getFebruary2024().getTemplateInstanceReader().readFromObject(source, undefined as never)
    .instance.dataContainer;

describe('reading an instance whose elements have no @context', () => {
  test('an element carrying only @id is still an element', () => {
    const container = read({
      '@id': 'https://repo.metadatacenter.org/template-instances/1',
      element: {
        '@id': 'https://repo.metadatacenter.org/template-element-instances/1',
        field: { '@value': 'inside' },
      },
    });

    const element = container.values['element'];
    expect(element instanceof InstanceDataContainer).toBe(true);
    const inner = (element as InstanceDataContainer).values['field'];
    expect(inner instanceof InstanceDataStringAtom).toBe(true);
    expect((inner as InstanceDataStringAtom).value).toBe('inside');
  });

  test('an element with no @id and no @context is still an element', () => {
    const container = read({ element: { field: { '@value': 'inside' } } });
    expect(container.values['element'] instanceof InstanceDataContainer).toBe(true);
  });

  test('every occurrence of a multi element is read, not just counted', () => {
    const container = read({
      element: [
        { '@id': 'https://example.org/e/1', field: { '@value': 'one' } },
        { '@id': 'https://example.org/e/2', field: { '@value': 'two' } },
      ],
    });

    const occurrences = container.values['element'] as unknown as InstanceDataContainer[];
    expect(occurrences).toHaveLength(2);
    expect((occurrences[0].values['field'] as InstanceDataStringAtom).value).toBe('one');
    expect((occurrences[1].values['field'] as InstanceDataStringAtom).value).toBe('two');
  });

  /**
   * The other half: a genuine IRI-valued field must not become an element now
   * that `@id` alone no longer settles it. A link is `@id` and nothing else; a
   * controlled term adds `rdfs:label`. Both are only value keys.
   */
  test('a link value is still a value', () => {
    const container = read({ link: { '@id': 'https://example.org/thing' } });
    expect(container.values['link'] instanceof InstanceDataLinkAtom).toBe(true);
  });

  test('a controlled term is still a value', () => {
    const container = read({
      term: { '@id': 'https://example.org/term', 'rdfs:label': 'Term' },
    });
    const term = container.values['term'];
    expect(term instanceof InstanceDataControlledAtom).toBe(true);
    expect((term as InstanceDataControlledAtom).label).toBe('Term');
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
    const container = read({ element: [null, { field: { '@value': 'v' } }] } as unknown as JsonNode);
    const list = container.values['element'] as unknown as unknown[];
    expect(list[0] instanceof InstanceDataEmptyNode).toBe(true);
    expect(list[1] instanceof InstanceDataContainer).toBe(true);
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
