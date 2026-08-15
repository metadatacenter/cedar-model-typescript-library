import {
  BioportalTermType,
  CedarBuilders,
  CedarWriters,
  ControlledTermBranchBuilder,
  ControlledTermClassBuilder,
  ControlledTermOntologyBuilder,
  ControlledTermValueSetBuilder,
  ControlledTermVersion,
  Iri,
  YamlTemplateFieldReader,
} from '../../../../../src';
import { ControlledTermFieldImpl } from '../../../../../src/org/metadatacenter/model/cedar/field/dynamic/controlled-term/ControlledTermFieldImpl';
import { TemplateField } from '../../../../../src/org/metadatacenter/model/cedar/field/TemplateField';

/**
 * The keys a controlled-term field's `values` entry is written with, and what they carry.
 *
 * An entry names a vocabulary and a term within it, and the two groups of keys say which: `source*`
 * is the vocabulary, `term*` the term or branch. The keys were once `acronym`, `ontologyName`, `iri`,
 * `valueSetName`, `maxDepth` and `numTerms`, where `iri` identified an ontology in one entry kind, a
 * branch root in another and a value set in a third, and where no key said which system served the
 * vocabulary or which snapshot of it was meant. The Java library writes the keys asserted here, so a
 * document either library writes is one the other reads.
 *
 * Three of them are new rather than renamed. `sourceSystem` names the system serving the vocabulary
 * and its absence means BioPortal; `sourceIri` is the ontology's canonical identity, which holds
 * whichever system serves it; and `version` pins one snapshot, its absence meaning the latest.
 */
const ONTOLOGY_ADDRESS = new Iri('https://data.bioontology.org/ontologies/CL');
const ONTOLOGY_IDENTITY = new Iri('http://purl.obolibrary.org/obo/cl');
const TERM = new Iri('http://purl.obolibrary.org/obo/CL_0000000');

const field = (build: (builder: any) => any) =>
  build(
    CedarBuilders.controlledTermFieldBuilder()
      .withAtId('https://repo.metadatacenter.org/template-fields/00000000-0000-0000-0000-000000000000')
      .withTitle('Cell Type')
      .withDescription('d')
      .withSchemaName('Cell Type')
      .withSchemaDescription('d'),
  ).build();

const yamlOf = (f: any) => CedarWriters.yaml().getStrict().getFieldWriterForField(f).getAsYamlString(f);
const jsonOf = (f: any) => JSON.parse(CedarWriters.json().getStrict().getFieldWriterForField(f).getAsJsonString(f));
const readBack = (f: any): ControlledTermFieldImpl => {
  const read: TemplateField = YamlTemplateFieldReader.getStrict().readFromString(yamlOf(f)).field;
  if (!(read instanceof ControlledTermFieldImpl)) {
    throw new Error(`a controlled-term field read back as ${read.constructor.name}`);
  }
  return read;
};

const ontology = () =>
  new ControlledTermOntologyBuilder().withAcronym('CL').withName('Cell Ontology').withUri(ONTOLOGY_ADDRESS).withNumTerms(2757);

const branch = () =>
  new ControlledTermBranchBuilder()
    .withAcronym('UBERON')
    .withSource('Uber Anatomy Ontology')
    .withName('organ')
    .withMaxDepth(0)
    .withUri(TERM);

const term = () =>
  new ControlledTermClassBuilder()
    .withLabel('cell')
    .withPrefLabel('cell')
    .withSource('CL')
    .withType(BioportalTermType.ONTOLOGY_CLASS)
    .withUri(TERM);

const valueSet = () =>
  new ControlledTermValueSetBuilder().withVsCollection('HRAVS').withName('Analyte class').withNumTerms(37).withUri(TERM);

describe('a value-constraint entry names its source and its term', () => {
  test('an ontology entry', () => {
    const yaml = yamlOf(field((b) => b.addOntology(ontology().build())));
    expect(yaml).toContain('sourceAcronym: "CL"');
    expect(yaml).toContain('sourceName: "Cell Ontology"');
    expect(yaml).toContain('termCount: 2757');
  });

  test('a branch entry', () => {
    const yaml = yamlOf(field((b) => b.addBranch(branch().build())));
    expect(yaml).toContain('sourceAcronym: "UBERON"');
    expect(yaml).toContain('sourceName: "Uber Anatomy Ontology"');
    expect(yaml).toContain(`termBaseIri: "${TERM.getValue()}"`);
    expect(yaml).toContain('termBaseLabel: "organ"');
    expect(yaml).toContain('termMaxDepth: 0');
  });

  test('a class entry', () => {
    const yaml = yamlOf(field((b) => b.addClass(term().build())));
    expect(yaml).toContain('sourceAcronym: "CL"');
    expect(yaml).toContain(`termIri: "${TERM.getValue()}"`);
    expect(yaml).toContain('termType: "class"');
    expect(yaml).toContain('termLabel: "cell"');
  });

  test('a value-set entry', () => {
    const yaml = yamlOf(field((b) => b.addValueSet(valueSet().build())));
    expect(yaml).toContain('sourceAcronym: "HRAVS"');
    expect(yaml).toContain(`termBaseIri: "${TERM.getValue()}"`);
    expect(yaml).toContain('termBaseLabel: "Analyte class"');
    expect(yaml).toContain('termCount: 37');
  });

  test('none of the keys it replaced survive', () => {
    const everything = field((b) =>
      b.addOntology(ontology().build()).addBranch(branch().build()).addClass(term().build()).addValueSet(valueSet().build()),
    );
    const yaml = yamlOf(everything);
    ['acronym:', 'ontologyName:', 'valueSetName:', 'maxDepth:', 'numTerms:', 'iri:'].forEach((key) => {
      expect(yaml).not.toContain(key);
    });
  });
});

describe('the source-explicit keys', () => {
  test('are written when the constraint carries them, and read back', () => {
    const pinned = field((b) =>
      b.addOntology(
        ontology()
          .withIri(ONTOLOGY_IDENTITY)
          .withSourceSystem('bioportal')
          .withVersion(new ControlledTermVersion('a1b2c3d4e5f6', '2026-06-15', '2026-06-15'))
          .build(),
      ),
    );
    const yaml = yamlOf(pinned);
    expect(yaml).toContain('sourceSystem: "bioportal"');
    expect(yaml).toContain(`sourceIri: "${ONTOLOGY_IDENTITY.getValue()}"`);
    expect(yaml).toContain('id: "a1b2c3d4e5f6"');
    expect(yaml).toContain('effectiveDate: "2026-06-15"');
    expect(yaml).toContain('declaredVersion: "2026-06-15"');

    const [readOntology] = readBack(pinned).valueConstraints.ontologies;
    expect(readOntology.sourceSystem).toBe('bioportal');
    expect(readOntology.iri?.getValue()).toBe(ONTOLOGY_IDENTITY.getValue());
    expect(readOntology.version?.id).toBe('a1b2c3d4e5f6');
    expect(readOntology.version?.effectiveDate).toBe('2026-06-15');
    expect(readOntology.version?.declaredVersion).toBe('2026-06-15');
  });

  test('are omitted by a constraint that carries none, which resolves against the latest', () => {
    const unpinned = field((b) => b.addOntology(ontology().build()));
    // The entry alone: the field around it carries a `version` of its own, which is the artifact's.
    const entry = yamlOf(unpinned).slice(yamlOf(unpinned).indexOf('values:'));
    expect(entry).not.toContain('sourceSystem');
    expect(entry).not.toContain('sourceIri');
    expect(entry).not.toContain('version:');

    const [readOntology] = readBack(unpinned).valueConstraints.ontologies;
    expect(readOntology.version).toBeNull();
    expect(readOntology.sourceSystem).toBeNull();
    expect(readOntology.iri).toBeNull();
  });

  test('keep their JSON names, which this rename does not touch', () => {
    const pinned = jsonOf(
      field((b) =>
        b.addOntology(
          ontology()
            .withIri(ONTOLOGY_IDENTITY)
            .withSourceSystem('bioportal')
            .withVersion(new ControlledTermVersion('a1b2c3d4e5f6', '2026-06-15', null))
            .build(),
        ),
      ),
    )['_valueConstraints']['ontologies'][0];
    expect(pinned).toStrictEqual({
      uri: ONTOLOGY_ADDRESS.getValue(),
      acronym: 'CL',
      name: 'Cell Ontology',
      numTerms: 2757,
      iri: ONTOLOGY_IDENTITY.getValue(),
      sourceSystem: 'bioportal',
      version: { id: 'a1b2c3d4e5f6', effectiveDate: '2026-06-15' },
    });
  });
});

describe('value recommendation', () => {
  // The one field-level key a controlled-term field carries beyond its constraints, and the writer
  // states it only when it is on.
  test('is written when the field asks for it, and left out when it does not', () => {
    const asking = field((b) => b.addOntology(ontology().build()));
    (asking as ControlledTermFieldImpl).valueRecommendationEnabled = true;

    expect(yamlOf(asking)).toContain('valueRecommendation: true');
    expect(yamlOf(field((b) => b.addOntology(ontology().build())))).not.toContain('valueRecommendation');
  });
});

describe('a pinned version on the other entry kinds', () => {
  // The ontology case above pins all three parts. These cover the rest: a version naming only the
  // snapshot, on the kinds whose writers take their own path through the shared version block.
  test('a branch pins with the snapshot alone', () => {
    const yaml = yamlOf(field((b) => b.addBranch(branch().withVersion(new ControlledTermVersion('7a8b9c0d1e2f')).build())));

    expect(yaml).toContain('id: "7a8b9c0d1e2f"');
    expect(yaml).not.toContain('effectiveDate');
    expect(yaml).not.toContain('declaredVersion');
  });

  test('a class pins with a date, and a value set with the source\'s own version string', () => {
    const yaml = yamlOf(
      field((b) =>
        b
          .addClass(term().withVersion(new ControlledTermVersion('3c4d5e6f7a8b', '2026-04-20')).build())
          .addValueSet(valueSet().withVersion(new ControlledTermVersion('9e0f1a2b3c4d', null, '2.3')).build()),
      ),
    );

    expect(yaml).toContain('id: "3c4d5e6f7a8b"');
    expect(yaml).toContain('effectiveDate: "2026-04-20"');
    expect(yaml).toContain('id: "9e0f1a2b3c4d"');
    expect(yaml).toContain('declaredVersion: "2.3"');
  });
});

describe('what the entry carries once, and what it no longer carries', () => {
  test("an ontology's address is reconstructed from its acronym", () => {
    const yaml = yamlOf(field((b) => b.addOntology(ontology().build())));
    expect(yaml).not.toContain(ONTOLOGY_ADDRESS.getValue());
    expect(readBack(field((b) => b.addOntology(ontology().build()))).valueConstraints.ontologies[0].uri.getValue()).toBe(
      ONTOLOGY_ADDRESS.getValue(),
    );
  });

  test('a class says what the ontology calls the term, and what the template calls it', () => {
    const displayLabelDiffers = field((b) => b.addClass(term().withLabel('Cell (as the author named it)').build()));
    const yaml = yamlOf(displayLabelDiffers);
    expect(yaml).toContain('termLabel: "cell"');
    expect(yaml).toContain('termDisplayLabel: "Cell (as the author named it)"');

    const [readClass] = readBack(displayLabelDiffers).valueConstraints.classes;
    expect(readClass.prefLabel).toBe('cell');
    expect(readClass.label).toBe('Cell (as the author named it)');
  });

  test('a class whose labels agree says so once', () => {
    const sameLabel = field((b) => b.addClass(term().build()));
    expect(yamlOf(sameLabel)).not.toContain('termDisplayLabel');

    const [readClass] = readBack(sameLabel).valueConstraints.classes;
    expect(readClass.prefLabel).toBe('cell');
    expect(readClass.label).toBe('cell');
  });
});
