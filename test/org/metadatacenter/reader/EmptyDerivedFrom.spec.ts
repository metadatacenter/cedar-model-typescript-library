import { CedarReaders, CedarWriters } from '../../../../src';

/**
 * `pav:derivedFrom` written as an empty string.
 *
 * It names the artifact this one was copied from, and it is optional: an artifact derived from
 * nothing leaves the key out. An empty string says neither — it is not an identifier, and it is not
 * the absence of one. The production inventory nevertheless found it throughout legacy schema
 * cohorts, including artifacts that developers must still be able to open in Designer.
 *
 * The meta-schema types the key as a string with `format: uri` and the validator does assert that
 * format, rejecting `"not a uri at all"`. What it accepts is `""`, because an empty relative
 * reference is a well-formed URI. Persistence validation therefore enforces the rule for new writes,
 * while readers treat the legacy spelling as absence and writers omit it on a round trip.
 */
const TEMPLATE = (derivedFrom: unknown) => ({
  '@id': 'https://repo.metadatacenter.org/templates/t1',
  '@type': 'https://schema.metadatacenter.org/core/Template',
  '@context': {},
  type: 'object',
  title: 'T',
  description: 'd',
  _ui: { order: [], propertyLabels: {}, propertyDescriptions: {} },
  properties: {},
  required: [],
  'schema:name': 'T',
  'schema:description': 'd',
  'schema:schemaVersion': '1.6.0',
  ...(derivedFrom === undefined ? {} : { 'pav:derivedFrom': derivedFrom }),
});

const INSTANCE = (derivedFrom: unknown) => ({
  '@id': 'https://repo.metadatacenter.org/template-instances/i1',
  '@context': {},
  'schema:name': 'I',
  'schema:description': '',
  'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
  ...(derivedFrom === undefined ? {} : { 'pav:derivedFrom': derivedFrom }),
});

const readTemplate = (source: object) => CedarReaders.json().getStrict().getTemplateReader().readFromString(JSON.stringify(source));
const readInstance = (source: object) =>
  CedarReaders.json().getStrict().getTemplateInstanceReader().readFromString(JSON.stringify(source));

describe('pav:derivedFrom as an empty string', () => {
  const DERIVED = 'https://repo.metadatacenter.org/templates/t0';

  test('loads a legacy empty value on a schema artifact and omits it when written', () => {
    const template = readTemplate(TEMPLATE('')).template;

    expect(template.pav_derivedFrom?.getValue()).toBeNull();
    const written = JSON.parse(CedarWriters.json().getStrict().getTemplateWriter().getAsJsonString(template));
    expect(written).not.toHaveProperty('pav:derivedFrom');
  });

  test('loads a legacy empty value on an instance and omits it when written', () => {
    const instance = readInstance(INSTANCE('')).instance;

    expect(instance.pav_derivedFrom?.getValue()).toBeNull();
    const written = JSON.parse(CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonString(instance));
    expect(written).not.toHaveProperty('pav:derivedFrom');
  });

  test('loads the legacy empty spelling in YAML as absence', () => {
    const yaml = 'type: "template"\nname: "T"\nmodelVersion: "1.6.0"\nderivedFrom: ""\n';
    const template = CedarReaders.yaml().getStrict().getTemplateReader().readFromString(yaml).template;

    expect(template.pav_derivedFrom?.getValue()).toBeNull();
  });

  test('a named source reads, and an absent key stays absent', () => {
    expect(readTemplate(TEMPLATE(DERIVED)).template.pav_derivedFrom?.getValue()).toBe(DERIVED);
    expect(readTemplate(TEMPLATE(undefined)).template.pav_derivedFrom?.getValue()).toBeNull();
  });

  /**
   * The writer emitted an instance's `pav:derivedFrom` and no reader took it back in, so a document
   * naming what it was copied from lost that on the way through. The YAML instance reader always read
   * it; this is the JSON side.
   */
  test('an instance carries what it was derived from back out', () => {
    const instance = readInstance(INSTANCE(DERIVED)).instance;

    expect(instance.pav_derivedFrom?.getValue()).toBe(DERIVED);
    const written = JSON.parse(CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonString(instance));
    expect(written['pav:derivedFrom']).toBe(DERIVED);
  });
});
