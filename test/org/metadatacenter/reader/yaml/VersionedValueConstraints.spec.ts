import { parse, stringify } from 'yaml';
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
    expect(yaml).toContain('termType: class');
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

  test("a class pins with a date, and a value set with the source's own version string", () => {
    const yaml = yamlOf(
      field((b) =>
        b.addClass(term().withVersion(new ControlledTermVersion('3c4d5e6f7a8b', '2026-04-20')).build()).addValueSet(
          valueSet()
            .withVersion(new ControlledTermVersion('9e0f1a2b3c4d', null, '2.3'))
            .build(),
        ),
      ),
    );

    expect(yaml).toContain('id: "3c4d5e6f7a8b"');
    expect(yaml).toContain('effectiveDate: "2026-04-20"');
    expect(yaml).toContain('id: "9e0f1a2b3c4d"');
    expect(yaml).toContain('declaredVersion: "2.3"');
  });
});

describe("a pinned version's id", () => {
  // The document a writer produces for a pinned ontology entry, with the entry's id replaced. The field
  // carries a `version` of its own, which is the artifact's, so the id is set on the entry alone.
  const pinnedTo = (id: string): string => {
    const document = parse(yamlOf(field((b) => b.addOntology(ontology().withVersion(new ControlledTermVersion('a1b2c3d4e5f6')).build()))));
    document.values[0].version.id = id;
    return stringify(document);
  };
  const readOntologyFrom = (yaml: string) =>
    (YamlTemplateFieldReader.getStrict().readFromString(yaml).field as ControlledTermFieldImpl).valueConstraints.ontologies[0];

  // Four cases: a space, the five whitespace controls, two information separators, and two Unicode spaces.
  test.each([' ', '\t\n\u000b\f\r', '\u001c\u001f', '\u2003\u3000'])('is refused when it is blank (%j)', (id) => {
    // A blank id identifies no snapshot any more than an empty one does, and Java refuses both.
    expect(() => readOntologyFrom(pinnedTo(id))).toThrow('A pinned version\'s id at "version.id" must not be blank.');
  });

  test('is refused when it is empty, with the message it always gave', () => {
    expect(() => readOntologyFrom(pinnedTo(''))).toThrow('A pinned version needs a non-empty string at "version.id".');
  });

  // Two cases: whitespace around the hash, and the three no-break spaces Java does not count as whitespace.
  test.each([' a1b2c3d4e5f6 ', '\u00a0\u2007\u202f'])('is read when it is not blank in Java (%j)', (id) => {
    expect(readOntologyFrom(pinnedTo(id)).version?.id).toBe(id);
  });

  // A caller that builds a version with an empty or blank id is refused when the version is
  // constructed, so no writer is handed a pin that neither library reads.
  test('cannot be built empty', () => {
    expect(() => field((b) => b.addOntology(ontology().withVersion(new ControlledTermVersion('')).build()))).toThrow(
      'A pinned version requires an id.',
    );
  });

  // Four cases: a space, the five whitespace controls, two information separators, and two Unicode spaces.
  test.each([' ', '\t\n\u000b\f\r', '\u001c\u001f', '\u2003\u3000'])('cannot be built blank (%j)', (id) => {
    expect(() => field((b) => b.addOntology(ontology().withVersion(new ControlledTermVersion(id)).build()))).toThrow(
      "A pinned version's id must not be blank.",
    );
  });

  // Three cases: whitespace around the hash, the three no-break spaces, and a zero-width space, a
  // byte-order mark and a next-line control. Java counts none of the last six as whitespace.
  test.each([' a1b2c3d4e5f6 ', '\u00a0\u2007\u202f', '\u200b\ufeff\u0085'])(
    'is built, written and read back when it is not blank in Java (%j)',
    (id) => {
      const pinned = field((b) => b.addOntology(ontology().withVersion(new ControlledTermVersion(id)).build()));
      expect(readBack(pinned).valueConstraints.ontologies[0].version?.id).toBe(id);
    },
  );

  test('is not invented for "latest", which reads as no version, as an absent one does', () => {
    const document = parse(yamlOf(field((b) => b.addOntology(ontology().build()))));
    document.values[0].version = 'latest';
    const read = readOntologyFrom(stringify(document));

    expect(read.version).toBeNull();
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

describe('ontology service addresses', () => {
  const ontologyField = (acronym: string, uri: string, sourceSystem: string | null) =>
    CedarBuilders.controlledTermFieldBuilder()
      .withSchemaName('Terms')
      .addOntology(
        new ControlledTermOntologyBuilder()
          .withAcronym(acronym)
          .withName('Ontology')
          .withUri(new Iri(uri))
          .withIri(new Iri('http://example.org/ontology'))
          .withSourceSystem(sourceSystem)
          .build(),
      )
      .build();
  const readerFor = (compact: boolean) => (compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict());

  // The reader derives https://data.bioontology.org/ontologies/<acronym> for an entry that states no
  // address, so an address outside BioPortal is stated, in both forms, as Java states it. So is a
  // BioPortal address naming another acronym, which the acronym cannot give.
  test.each<[string, string, string | null]>([
    ['UBERON', 'http://purl.obolibrary.org/obo/uberon.owl', null],
    ['CL', 'https://other.example/ontologies/CL', 'agroportal'],
    ['OBI', 'https://data.bioontology.org/ontologies/OBI-OLD', null],
  ])('keeps %s at %s, which its acronym does not give', (acronym, uri, sourceSystem) => {
    const original = ontologyField(acronym, uri, sourceSystem);
    expect(jsonOf(original)._valueConstraints.ontologies[0].uri).toBe(uri);
    for (const compact of [false, true]) {
      const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(original).getAsYamlString(original, compact);
      expect(yaml).toContain(`sourceUri: "${uri}"`);
      const ontology = (readerFor(compact).readFromString(yaml).field as ControlledTermFieldImpl).valueConstraints.ontologies[0];
      expect(ontology.uri.getValue()).toBe(uri);
      expect(ontology.iri?.getValue()).toBe('http://example.org/ontology');
      expect(ontology.sourceSystem).toBe(sourceSystem);
    }
  });

  // YAML names a BioPortal ontology by its acronym, in whichever form its address was stored.
  test.each([
    'https://data.bioontology.org/ontologies/MESH',
    'http://data.bioontology.org/ontologies/MESH',
    'https://bioportal.bioontology.org/ontologies/MESH',
    'http://bioportal.bioontology.org/ontologies/MESH',
  ])('leaves out %s, and derives the address from the acronym on the way back', (uri) => {
    const original = ontologyField('MESH', uri, null);
    expect(jsonOf(original)._valueConstraints.ontologies[0].uri).toBe(uri);
    for (const compact of [false, true]) {
      const yaml = CedarWriters.yaml().getStrict().getFieldWriterForField(original).getAsYamlString(original, compact);
      expect(yaml).not.toContain('sourceUri:');
      const ontology = (readerFor(compact).readFromString(yaml).field as ControlledTermFieldImpl).valueConstraints.ontologies[0];
      expect(ontology.uri.getValue()).toBe('https://data.bioontology.org/ontologies/MESH');
    }
  });

  it('refuses a stated address that is not an absolute IRI, as Java refuses it', () => {
    const field = ontologyField('DOID', 'https://data.bioontology.org/ontologies/DOID', null);
    const document = parse(CedarWriters.yaml().getStrict().getFieldWriterForField(field).getAsYamlString(field));
    for (const address of ['relative/path', '']) {
      document.values[0].sourceUri = address;
      expect(() => YamlTemplateFieldReader.getStrict().readFromString(stringify(document))).toThrow();
    }
  });
});
