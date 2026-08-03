import { CedarReaders, JsonNode } from '../../../../../../src';
import { InstanceDataContainer } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataContainer';
import { InstanceDataLinkAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataLinkAtom';
import { InstanceDataControlledAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataControlledAtom';
import { InstanceDataStringAtom } from '../../../../../../src/org/metadatacenter/model/cedar/template-instance/InstanceDataStringAtom';

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
