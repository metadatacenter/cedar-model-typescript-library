import { CedarWriters, JsonTemplateFieldReader } from '../../../../../src';
import { ControlledTermFieldImpl } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/ControlledTermFieldImpl';
import { TemplateField } from '../../../../../src/org/metadatacenter/model/cedar/field/TemplateField';

/**
 * The source-explicit keys, read from JSON.
 *
 * `iri`, `sourceSystem` and `version` are optional on every controlled-term constraint: `iri` is the
 * source ontology's canonical identity, `sourceSystem` names the system serving it, and `version` pins
 * one snapshot. A constraint written before they existed carries none of them and must read as it
 * always did. The YAML side of this is covered by the versioned-constraint spec; this is the JSON
 * reader, which is what a stored artifact arrives through.
 */
const CONSTRAINED = (extra: Record<string, unknown>) => ({
  '@id': 'https://repo.metadatacenter.org/template-fields/f1',
  '@type': 'https://schema.metadatacenter.org/core/TemplateField',
  '@context': {},
  type: 'object',
  title: 'Cell Type field schema',
  description: 'd',
  _ui: { inputType: 'textfield' },
  _valueConstraints: {
    requiredValue: false,
    ontologies: [
      {
        uri: 'https://data.bioontology.org/ontologies/CL',
        acronym: 'CL',
        name: 'Cell Ontology',
        numTerms: 2757,
        ...extra,
      },
    ],
  },
  'schema:name': 'Cell Type',
  'schema:description': 'd',
});

const readOntology = (source: object) => {
  const read: TemplateField = JsonTemplateFieldReader.getStrict().readFromString(JSON.stringify(source)).field;
  if (!(read instanceof ControlledTermFieldImpl)) {
    throw new Error(`a controlled-term field read back as ${read.constructor.name}`);
  }
  return read.valueConstraints.ontologies[0];
};

describe('a controlled-term constraint read from JSON', () => {
  test('carries the source-explicit keys when the document states them', () => {
    const ontology = readOntology(
      CONSTRAINED({
        iri: 'http://purl.obolibrary.org/obo/cl',
        sourceSystem: 'bioportal',
        version: { id: 'a1b2c3d4e5f6', effectiveDate: '2026-06-15', declaredVersion: '2026-06-15' },
      }),
    );

    expect(ontology.iri?.getValue()).toBe('http://purl.obolibrary.org/obo/cl');
    expect(ontology.sourceSystem).toBe('bioportal');
    expect(ontology.version?.id).toBe('a1b2c3d4e5f6');
    expect(ontology.version?.effectiveDate).toBe('2026-06-15');
    expect(ontology.version?.declaredVersion).toBe('2026-06-15');
  });

  test('a pinned version may name the snapshot and nothing else', () => {
    const ontology = readOntology(CONSTRAINED({ version: { id: 'a1b2c3d4e5f6' } }));

    expect(ontology.version?.id).toBe('a1b2c3d4e5f6');
    expect(ontology.version?.effectiveDate).toBeNull();
    expect(ontology.version?.declaredVersion).toBeNull();
  });

  test('carries none of them when the document states none', () => {
    const ontology = readOntology(CONSTRAINED({}));

    expect(ontology.iri).toBeNull();
    expect(ontology.sourceSystem).toBeNull();
    expect(ontology.version).toBeNull();
  });

  test('and writes back what it read', () => {
    const source = CONSTRAINED({
      iri: 'http://purl.obolibrary.org/obo/cl',
      sourceSystem: 'bioportal',
      version: { id: 'a1b2c3d4e5f6', effectiveDate: '2026-06-15' },
    });
    const read = JsonTemplateFieldReader.getStrict().readFromString(JSON.stringify(source)).field;
    const written = JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(read).getAsJsonString(read));

    expect(written['_valueConstraints']['ontologies'][0]).toStrictEqual({
      uri: 'https://data.bioontology.org/ontologies/CL',
      acronym: 'CL',
      name: 'Cell Ontology',
      numTerms: 2757,
      iri: 'http://purl.obolibrary.org/obo/cl',
      sourceSystem: 'bioportal',
      version: { id: 'a1b2c3d4e5f6', effectiveDate: '2026-06-15' },
    });
  });
});
