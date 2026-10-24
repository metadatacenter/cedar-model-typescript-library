import {
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ControlledTermField,
  JsonNode,
  TemplateField,
  TemporalGranularity,
  TemporalType,
} from '../../../../src';

/**
 * Java's JSON reader judges a field's term constraints on every kind of field, and these readers now
 * give its verdict.
 *
 * Java reads `ontologies`, `valueSets`, `classes` and `branches` wherever a field states
 * `_valueConstraints`, and refuses a malformed entry whatever kind of field carries it. Only a
 * textfield keeps them, as a controlled-term field. Every other kind drops them, so Java writes its
 * JSON without them. These readers read term constraints only on a controlled-term field and ignored
 * them on every other kind, so they accepted a document Java refuses.
 */
const READERS = { strict: CedarReaders.json().getStrict(), 'February 2024': CedarReaders.json().getFebruary2024() };
type Behavior = keyof typeof READERS;
const json = CedarWriters.json().getStrict();
const plain = (node: unknown): JsonNode => JSON.parse(JSON.stringify(node));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const id = (name: string) => `https://repo.metadatacenter.org/template-fields/${name}`;

/** Each kind of field that is not a controlled-term field, built complete. */
const KINDS: Record<string, () => TemplateField> = {
  textarea: () => CedarBuilders.textAreaBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'phone-number': () => CedarBuilders.phoneNumberFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  email: () => CedarBuilders.emailFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  radio: () => CedarBuilders.radioFieldBuilder().withSchemaName('F').withAtId(id('f')).addRadioOption('a').addRadioOption('b').build(),
  checkbox: () =>
    CedarBuilders.checkboxFieldBuilder().withSchemaName('F').withAtId(id('f')).addCheckboxOption('a').addCheckboxOption('b').build(),
  'single-choice list': () =>
    CedarBuilders.singleChoiceListFieldBuilder().withSchemaName('F').withAtId(id('f')).addListOption('a').addListOption('b').build(),
  'multiple-choice list': () =>
    CedarBuilders.multipleChoiceListFieldBuilder().withSchemaName('F').withAtId(id('f')).addListOption('a').addListOption('b').build(),
  numeric: () => CedarBuilders.numericFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  temporal: () =>
    CedarBuilders.temporalFieldBuilder()
      .withSchemaName('F')
      .withAtId(id('f'))
      .withTemporalType(TemporalType.forValue('xsd:date'))
      .withTemporalGranularity(TemporalGranularity.forValue('day'))
      .build(),
  link: () => CedarBuilders.linkFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-ror': () => CedarBuilders.extRorFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-orcid': () => CedarBuilders.extOrcidFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-pfas': () => CedarBuilders.extPfasFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-pubmed': () => CedarBuilders.extPubmedFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-rrid': () => CedarBuilders.extRridFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-nih-grant-id': () => CedarBuilders.extNihGrantIdFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'ext-doi': () => CedarBuilders.extDoiFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'attribute-value': () => CedarBuilders.attributeValueFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'page-break': () => CedarBuilders.pageBreakFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'section-break': () => CedarBuilders.sectionBreakFieldBuilder().withSchemaName('F').withAtId(id('f')).build(),
  'rich-text': () => CedarBuilders.richTextFieldBuilder().withSchemaName('F').withAtId(id('f')).withContent('<p>x</p>').build(),
  image: () => CedarBuilders.imageFieldBuilder().withSchemaName('F').withAtId(id('f')).withContent('https://example.org/i.png').build(),
  youtube: () => CedarBuilders.youtubeFieldBuilder().withSchemaName('F').withAtId(id('f')).withVideoId('abc').build(),
};

/** A well-formed entry of each list, stating every key its kind requires. */
const WELL_FORMED: Record<string, JsonNode> = {
  ontologies: { uri: 'https://data.bioontology.org/ontologies/DOID', acronym: 'DOID', name: 'Human Disease Ontology', numTerms: 5 },
  valueSets: { uri: 'https://example.org/value-sets/colours', vsCollection: 'VS', name: 'Colours', numTerms: 4 },
  classes: { uri: 'http://purl.obolibrary.org/obo/DOID_4', prefLabel: 'disease', type: 'OntologyClass', label: 'disease', source: 'DOID' },
  branches: {
    uri: 'http://purl.obolibrary.org/obo/DOID_4',
    source: 'Human Disease Ontology',
    acronym: 'DOID',
    name: 'disease',
    maxDepth: 3,
  },
};
const LISTS = Object.keys(WELL_FORMED);
const INTEGER = 'Expected an integer from -2147483648 to 2147483647.';

/** The well-formed entry with `key` set to `value`, or removed where `value` is undefined. */
const amended = (list: string, key: string, value: unknown): JsonNode => {
  const entry = clone(WELL_FORMED[list]);
  if (value === undefined) delete entry[key];
  else entry[key] = value as JsonNode;
  return entry;
};

/**
 * Each malformed value of a list that Java refuses, with its refusal. A refusal names the key and the
 * path, and is built from the path to the list.
 */
const refused = (list: string): [string, unknown, (at: string) => string][] => {
  const w = WELL_FORMED[list];
  const cases: [string, unknown, (at: string) => string][] = [
    ['an entry that is a string', ['x'], (at) => `Invalid ${list} entry "x" at ${at}/0. Expected an object.`],
    ['an entry that is null', [null], (at) => `Invalid ${list} entry null at ${at}/0. Expected an object.`],
    ['an entry that is a list', [[]], (at) => `Invalid ${list} entry [] at ${at}/0. Expected an object.`],
    ['a malformed second entry', [w, 7], (at) => `Invalid ${list} entry 7 at ${at}/1. Expected an object.`],
    ['an empty entry', [{}], (at) => `Missing uri at ${at}/0/uri. Expected an absolute IRI.`],
    ['a null uri', [amended(list, 'uri', null)], (at) => `Invalid uri null at ${at}/0/uri. Expected an absolute IRI.`],
    ['an empty uri', [amended(list, 'uri', '')], (at) => `Invalid uri "" at ${at}/0/uri. Expected an absolute IRI.`],
    ['a relative uri', [amended(list, 'uri', 'DOID')], (at) => `Invalid URI at "${at}/0/uri": an identifier must be an absolute IRI.`],
    ['an iri that is a number', [amended(list, 'iri', 5)], (at) => `Invalid iri 5 at ${at}/0/iri. Expected a URI.`],
    [
      'an iri with a space',
      [amended(list, 'iri', 'http://example.org/a b')],
      (at) => `Invalid URI/IRI at "${at}/0/iri": unescaped space, control or forbidden character.`,
    ],
    [
      'a sourceSystem that is not a string',
      [amended(list, 'sourceSystem', true)],
      (at) => `Invalid sourceSystem true at ${at}/0/sourceSystem. Expected a string.`,
    ],
    ['a version with no id', [amended(list, 'version', {})], (at) => `Missing id at ${at}/0/version/id. Expected a string.`],
    [
      'a version with an empty id',
      [amended(list, 'version', { id: '' })],
      (at) => `Invalid id "" at ${at}/0/version/id. Expected a non-empty string.`,
    ],
    [
      'a version with a blank id',
      [amended(list, 'version', { id: ' \t' })],
      (at) => `Invalid id " \\t" at ${at}/0/version/id. Expected a string that is not blank.`,
    ],
    [
      'a version with an effectiveDate that is not a string',
      [amended(list, 'version', { id: 'v1', effectiveDate: 20240101 })],
      (at) => `Invalid effectiveDate 20240101 at ${at}/0/version/effectiveDate. Expected a string.`,
    ],
  ];
  const required = Object.keys(w).filter((key) => key !== 'uri' && key !== 'numTerms' && key !== 'type' && key !== 'maxDepth');
  for (const key of required) {
    cases.push([`a missing ${key}`, [amended(list, key, undefined)], (at) => `Missing ${key} at ${at}/0/${key}. Expected a string.`]);
    cases.push([`a null ${key}`, [amended(list, key, null)], (at) => `Invalid ${key} null at ${at}/0/${key}. Expected a string.`]);
    cases.push([`a ${key} that is a number`, [amended(list, key, 5)], (at) => `Invalid ${key} 5 at ${at}/0/${key}. Expected a string.`]);
  }
  if (list === 'ontologies' || list === 'valueSets') {
    cases.push(['a fractional numTerms', [amended(list, 'numTerms', 2.5)], (at) => `Invalid numTerms 2.5 at ${at}/0/numTerms. ${INTEGER}`]);
    cases.push([
      'a numTerms that is a string',
      [amended(list, 'numTerms', '3')],
      (at) => `Invalid numTerms "3" at ${at}/0/numTerms. ${INTEGER}`,
    ]);
  }
  if (list === 'classes') {
    const expected = 'Expected OntologyClass or Value.';
    cases.push(['a missing type', [amended(list, 'type', undefined)], (at) => `Missing type at ${at}/0/type. ${expected}`]);
    cases.push(['an unknown type', [amended(list, 'type', 'bogus')], (at) => `Invalid type "bogus" at ${at}/0/type. ${expected}`]);
    cases.push(['a type that is not a string', [amended(list, 'type', 1)], (at) => `Invalid type 1 at ${at}/0/type. ${expected}`]);
  }
  if (list === 'branches') {
    cases.push(['a missing maxDepth', [amended(list, 'maxDepth', undefined)], (at) => `Missing maxDepth at ${at}/0/maxDepth. ${INTEGER}`]);
    cases.push(['a null maxDepth', [amended(list, 'maxDepth', null)], (at) => `Invalid maxDepth null at ${at}/0/maxDepth. ${INTEGER}`]);
    cases.push(['a fractional maxDepth', [amended(list, 'maxDepth', 2.5)], (at) => `Invalid maxDepth 2.5 at ${at}/0/maxDepth. ${INTEGER}`]);
  }
  return cases;
};

/**
 * The malformed values the controlled-term reader refuses as it reads them, each with the message it
 * always gave, which other specs pin. Java refuses each of them too.
 */
const REFUSED_AS_READ = new Set([
  'an empty entry',
  'a null uri',
  'an empty uri',
  'a relative uri',
  'an iri that is a number',
  'an iri with a space',
  'a version with no id',
  'a version with an empty id',
  'a version with a blank id',
  'a missing type',
  'an unknown type',
  'a type that is not a string',
]);

/**
 * Each value of a list that Java reads, and the list Java writes from it on a controlled-term field.
 * A value that states no constraint leaves a textfield a textfield, and Java writes no list for it.
 */
const read = (list: string): [string, unknown, unknown][] => {
  const w = WELL_FORMED[list];
  const pinned = { ...w, iri: 'http://purl.obolibrary.org/obo/doid.owl', sourceSystem: 'bioportal', version: { id: 'v1' } };
  const emptyName = amended(list, list === 'classes' ? 'label' : 'name', '');
  return [
    ['one well-formed entry', [w], [w]],
    ['two well-formed entries', [w, w], [w, w]],
    ['no entries', [], null],
    ['null', null, null],
    ['a string', 'x', null],
    ['an object', {}, null],
    ['an entry stating its source and a pinned version', [pinned], [pinned]],
    ['an entry whose version is latest', [amended(list, 'version', 'latest')], [w]],
    ['an entry whose version is not an object', [amended(list, 'version', 5)], [w]],
    ['an entry with an empty iri', [amended(list, 'iri', '')], [w]],
    ['an entry with an empty name', [emptyName], [emptyName]],
    ...(list === 'classes'
      ? ([['an entry whose type is spelled in lower case', [amended(list, 'type', 'value')], [amended(list, 'type', 'Value')]]] as [
          string,
          unknown,
          unknown,
        ][])
      : []),
  ];
};

/** For each place a field can stand, how to write its document, how to read one back and write it again, and where the field is in one. */
type Place = [(field: TemplateField) => JsonNode, (document: JsonNode, behavior: Behavior) => JsonNode, (document: JsonNode) => JsonNode];
const PLACES: Record<string, Place> = {
  standalone: [
    (field) => plain(json.getFieldWriterForField(field).getAsJsonNode(field)),
    (document, behavior) => {
      const field = READERS[behavior].getTemplateFieldReader().readFromObject(document).field;
      return plain(json.getFieldWriterForField(field).getAsJsonNode(field));
    },
    (document) => (document.type === 'array' ? (document.items as JsonNode) : document),
  ],
  'a child of a template': [
    (field) =>
      plain(
        json
          .getTemplateWriter()
          .getAsJsonNode(
            CedarBuilders.templateBuilder()
              .withSchemaName('T')
              .withAtId('https://repo.metadatacenter.org/templates/t1')
              .addChild(field, field.createDeploymentBuilder('F').build())
              .build(),
          ),
      ),
    (document, behavior) =>
      plain(json.getTemplateWriter().getAsJsonNode(READERS[behavior].getTemplateReader().readFromObject(document).template)),
    (document) => {
      const child = (document.properties as JsonNode).F as JsonNode;
      return child.type === 'array' ? (child.items as JsonNode) : child;
    },
  ],
};
/** The path to the field in `document`, as a reader names it. */
const pathOf = (place: string, document: JsonNode): string => {
  if (place === 'standalone') return '';
  return ((document.properties as JsonNode).F as JsonNode).type === 'array' ? '/properties/F/items' : '/properties/F';
};
/** `document` with the field's `list` set to `value`, adding `_valueConstraints` where the field states none. */
const stating = (place: string, document: JsonNode, list: string, value: unknown): JsonNode => {
  const copy = clone(document);
  const field = PLACES[place][2](copy);
  if (!Object.hasOwn(field, '_valueConstraints')) field._valueConstraints = {};
  (field._valueConstraints as JsonNode)[list] = value as JsonNode;
  return copy;
};

describe.each(Object.keys(READERS) as Behavior[])('the %s JSON reader', (behavior: Behavior) => {
  describe.each(Object.keys(KINDS))('a %s field', (kind: string) => {
    describe.each(Object.keys(PLACES))('%s', (place: string) => {
      const [write, readBack] = PLACES[place];
      const document = write(KINDS[kind]());

      test.each(LISTS)('refuses a malformed %s constraint, naming the key and the path', (list: string) => {
        const at = `${pathOf(place, document)}/_valueConstraints/${list}`;
        for (const [, value, refusal] of refused(list)) {
          expect(() => readBack(stating(place, document, list, value), behavior)).toThrow(refusal(at));
        }
      });

      test.each(LISTS)('reads a well-formed %s constraint and drops it, as Java does', (list: string) => {
        const expected = readBack(document, behavior);
        for (const [, value] of read(list)) {
          expect(readBack(stating(place, document, list, value), behavior)).toEqual(expected);
        }
      });
    });
  });

  /**
   * A textfield that states a constraint is a controlled-term field, which keeps it. Its reader refuses
   * what Java refuses. Where it refused a value before, it gives the message it always gave.
   */
  describe('a textfield, which a stated constraint makes a controlled-term field', () => {
    describe.each(Object.keys(PLACES))('%s', (place: string) => {
      const [write, readBack, fieldIn] = PLACES[place];
      const document = write(CedarBuilders.textFieldBuilder().withSchemaName('F').withAtId(id('f')).build());

      test.each(LISTS)('refuses a malformed %s constraint, as Java does', (list: string) => {
        const at = `${pathOf(place, document)}/_valueConstraints/${list}`;
        for (const [name, value, refusal] of refused(list)) {
          const reading = () => readBack(stating(place, document, list, value), behavior);
          if (REFUSED_AS_READ.has(name)) expect(reading).toThrow();
          else expect(reading).toThrow(refusal(at));
        }
      });

      test.each(LISTS)('reads a well-formed %s constraint and writes it as Java does', (list: string) => {
        const unconstrained = readBack(document, behavior);
        for (const [, value, kept] of read(list)) {
          const written = readBack(stating(place, document, list, value), behavior);
          if (kept === null) {
            expect(written).toEqual(unconstrained);
          } else {
            expect(((fieldIn(written)._valueConstraints as JsonNode) ?? {})[list]).toEqual(kept);
            expect((fieldIn(written)._ui as JsonNode).inputType).toBe('textfield');
          }
        }
      });
    });

    test.each(LISTS)('reads a well-formed %s constraint into the controlled-term model', (list: string) => {
      const text = CedarBuilders.textFieldBuilder().withSchemaName('F').withAtId(id('f')).build();
      const document = stating('standalone', PLACES.standalone[0](text), list, [WELL_FORMED[list]]);
      const field = READERS[behavior].getTemplateFieldReader().readFromObject(document).field as ControlledTermField;
      expect(field.valueConstraints[list as 'ontologies']).toHaveLength(1);
    });
  });
});
