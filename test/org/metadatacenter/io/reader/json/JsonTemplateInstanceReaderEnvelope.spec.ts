import { CedarReaders, JsonNode } from '../../../../../../src';

/**
 * The envelope an instance carries around its data, and what it means when a
 * document arrives without it.
 *
 * The reader's `knownKeys` listed `@id`, `schema:isBasedOn`, `@context` and the
 * provenance keys, and nothing consulted the list. So the reader skipped them as
 * "known" and never asked whether they were present: an instance with none of
 * them read as clean, which is
 * https://github.com/metadatacenter/cedar-model-typescript-library/issues/2.
 *
 * They are reported as warnings rather than errors because a document without
 * them is incomplete, not malformed. 29 of the corpus's 121 instances carry no
 * envelope: an instance has no `@id` or provenance until it is saved, and the
 * CEDAR Embeddable Editor's "extract" form strips `@context`. So the two
 * verdicts split it — `wasSuccessful` stays true because the values are usable,
 * `adheresToBlueprint` turns false because this is not a complete instance.
 */
const parseOf = (source: object) =>
  CedarReaders.json()
    .getFebruary2024()
    .getTemplateInstanceReader()
    .readFromObject(source as JsonNode, undefined as never).parsingResult;

const warningsOf = (source: object) =>
  parseOf(source)
    .getBlueprintComparisonWarnings()
    .map((w) => JSON.stringify(w.errorPath));

const COMPLETE = {
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  '@context': { schema: 'http://schema.org/' },
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  'schema:name': 'An instance',
  'schema:description': '',
  'pav:createdOn': '2026-01-01T00:00:00-07:00',
  'pav:createdBy': 'https://metadatacenter.org/users/1',
  'pav:lastUpdatedOn': '2026-01-01T00:00:00-07:00',
  'oslc:modifiedBy': 'https://metadatacenter.org/users/1',
  field: { '@value': 'x' },
};

describe('a complete instance', () => {
  it('reports nothing about its envelope', () => {
    expect(warningsOf(COMPLETE)).toStrictEqual([]);
  });

  it('both reads successfully and adheres', () => {
    const result = parseOf(COMPLETE);
    expect(result.wasSuccessful()).toBe(true);
    expect(result.adheresToBlueprint()).toBe(true);
  });
});

describe('a missing envelope key', () => {
  const keys = ['@context', '@id', 'schema:isBasedOn', 'pav:createdOn', 'pav:createdBy', 'oslc:modifiedBy', 'pav:lastUpdatedOn'];

  it.each(keys)('%s is reported when absent', (key) => {
    const source: Record<string, unknown> = { ...COMPLETE };
    delete source[key];
    expect(warningsOf(source).filter((path) => path.includes(key))).toHaveLength(1);
  });

  it.each(keys)('%s is reported when present but null', (key) => {
    expect(warningsOf({ ...COMPLETE, [key]: null }).filter((path) => path.includes(key))).toHaveLength(1);
  });

  /**
   * An `@context` of `{}` binds no child name to an IRI, so it is no more
   * complete than an absent one. This is the shape named in the issue.
   */
  it('an empty @context is reported', () => {
    expect(warningsOf({ ...COMPLETE, '@context': {} }).filter((path) => path.includes('@context'))).toHaveLength(1);
  });
});

/**
 * `"@context": null` used to take the reader down rather than parse.
 *
 * Reading the context map begins with `Object.hasOwn`, which throws on null, and
 * the key being present was the only thing checked before walking it — the same
 * trap a null child sprang in `parseNode`. Found by asking this spec to report a
 * null `@context`, which it cannot do from inside a stack trace.
 */
describe('a null @context', () => {
  const source = { ...COMPLETE, '@context': null };

  it('parses instead of throwing', () => {
    expect(() => parseOf(source)).not.toThrow();
  });

  it('is reported', () => {
    expect(warningsOf(source).filter((path) => path.includes('@context'))).toHaveLength(1);
  });

  it('still reads the values', () => {
    const container = CedarReaders.json()
      .getFebruary2024()
      .getTemplateInstanceReader()
      .readFromObject(source as unknown as JsonNode, undefined as never).instance.dataContainer;
    expect(Object.hasOwn(container.values, 'field')).toBe(true);
  });
});

/**
 * The issue's own example: an instance with no `@id`, no `schema:isBasedOn`, no
 * provenance and an empty `@context`. It used to come back adhering to the
 * blueprint.
 */
describe('an instance with no envelope at all', () => {
  const bare = { '@context': {}, field: { '@value': 'x' } };

  it('no longer claims to adhere to the blueprint', () => {
    expect(parseOf(bare).adheresToBlueprint()).toBe(false);
  });

  it('still reads successfully, because the values are usable', () => {
    expect(parseOf(bare).wasSuccessful()).toBe(true);
  });

  it('reports no errors, only warnings', () => {
    const result = parseOf(bare);
    expect(result.getBlueprintComparisonErrorCount()).toBe(0);
    expect(result.getBlueprintComparisonWarningCount()).toBeGreaterThan(0);
  });

  it('names every key it is missing', () => {
    const warnings = warningsOf(bare);
    for (const key of ['@context', '@id', 'schema:isBasedOn', 'pav:createdOn', 'pav:createdBy', 'oslc:modifiedBy', 'pav:lastUpdatedOn']) {
      expect(warnings.filter((path) => path.includes(key))).toHaveLength(1);
    }
  });

  /**
   * The data is still read. The envelope verdict is a statement about the
   * document, not a reason to stop parsing it.
   */
  it('still reads the values', () => {
    const container = CedarReaders.json()
      .getFebruary2024()
      .getTemplateInstanceReader()
      .readFromObject(bare as JsonNode, undefined as never).instance.dataContainer;
    expect(Object.hasOwn(container.values, 'field')).toBe(true);
  });
});
