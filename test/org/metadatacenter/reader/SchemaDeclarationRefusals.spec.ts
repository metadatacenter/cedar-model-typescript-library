import {
  BioportalTermType,
  CedarBuilders,
  CedarReaders,
  CedarWriters,
  ControlledTermActionBuilder,
  ControlledTermBranchBuilder,
  ControlledTermClassBuilder,
  ControlledTermField,
  ControlledTermOntologyBuilder,
  ControlledTermValueSetBuilder,
  Iri,
  JsonNode,
  TemplateElement,
  YamlTemplateElementReader,
  YamlTemplateFieldReader,
  YamlTemplateReader,
} from '../../../../src';

/**
 * What a schema artifact declares about itself, held to the Java JSON reader's rules.
 *
 * A schema artifact says what it is (`@type`), which JSON Schema it is written in (`$schema`), what
 * JSON Schema type it is (`type`), which model it follows (`schema:schemaVersion`) and what state it
 * is in (`bibo:status`). A controlled-term field's classes and actions say what kind of term each
 * names, and each action says what it does. Java refuses an artifact that declares any of these
 * wrongly. These readers recorded a difference, or read nothing, and the writers then wrote the
 * expected value back, so a document Java refuses was read, and written as one it accepts. Java reads
 * a status and a term type ignoring case, and these readers now do too.
 */
const T = 'https://schema.metadatacenter.org/core/';
const DRAFT_04 = 'http://json-schema.org/draft-04/schema#';
const READERS = { strict: CedarReaders.json().getStrict(), 'February 2024': CedarReaders.json().getFebruary2024() };
type Behavior = keyof typeof READERS;
type Kind = 'field' | 'element' | 'template';

const text = (name: string) =>
  CedarBuilders.textFieldBuilder().withSchemaName(name).withAtId(`https://repo.metadatacenter.org/template-fields/${name}`).build();
const element = () => {
  const d = text('D');
  return CedarBuilders.templateElementBuilder()
    .withSchemaName('E')
    .withAtId('https://repo.metadatacenter.org/template-elements/e1')
    .addChild(d, d.createDeploymentBuilder('D').build())
    .build();
};
const template = () => {
  const c = text('C');
  const e = element();
  const m = text('M');
  return CedarBuilders.templateBuilder()
    .withSchemaName('T')
    .withAtId('https://repo.metadatacenter.org/templates/t1')
    .addChild(c, c.createDeploymentBuilder('C').build())
    .addChild(e, e.createDeploymentBuilder('E').build())
    .addChild(m, m.createDeploymentBuilder('M').withMultiInstance(true).withMinItems(0).build())
    .build();
};
const controlledTerm = () =>
  CedarBuilders.controlledTermFieldBuilder()
    .withSchemaName('K')
    .withAtId('https://repo.metadatacenter.org/template-fields/k1')
    .addOntology(
      new ControlledTermOntologyBuilder()
        .withAcronym('DOID')
        .withName('Human Disease Ontology')
        .withUri(new Iri('https://data.bioontology.org/ontologies/DOID'))
        .build(),
    )
    .addClass(
      new ControlledTermClassBuilder()
        .withUri(new Iri('http://purl.obolibrary.org/obo/DOID_4'))
        .withSource('DOID')
        .withLabel('disease')
        .withPrefLabel('disease')
        .withType(BioportalTermType.ONTOLOGY_CLASS)
        .build(),
    )
    .addAction(
      new ControlledTermActionBuilder()
        .withAction('delete')
        .withSource('DOID')
        .withType(BioportalTermType.ONTOLOGY_CLASS)
        .withTermUri(new Iri('http://purl.obolibrary.org/obo/DOID_4'))
        .withSourceUri(new Iri('https://data.bioontology.org/ontologies/DOID'))
        .build(),
    )
    .build();

const json = CedarWriters.json().getStrict();
const plain = (node: unknown): JsonNode => JSON.parse(JSON.stringify(node));
const SOURCES: Record<Kind, () => JsonNode> = {
  field: () => plain(json.getFieldWriterForField(text('F')).getAsJsonNode(text('F'))),
  element: () => plain(json.getTemplateElementWriter().getAsJsonNode(element())),
  template: () => plain(json.getTemplateWriter().getAsJsonNode(template())),
};

/** Where a schema artifact can stand: the document it is read from, and the path to its node there. */
const PLACES: Record<string, [Kind, string[]]> = {
  'a field': ['field', []],
  'an element': ['element', []],
  'a template': ['template', []],
  'a child field': ['template', ['properties', 'C']],
  'a child element': ['template', ['properties', 'E']],
  'a field in a child element': ['template', ['properties', 'E', 'properties', 'D']],
  'a multiple-instance child field': ['template', ['properties', 'M', 'items']],
};
const NESTED = Object.keys(PLACES).filter((place) => PLACES[place][1].length > 0);

const nodeAt = (document: JsonNode, path: string[]): JsonNode => path.reduce((node, key) => node[key] as JsonNode, document);
/** Set `key` in `node` to `value`, or remove the key when `value` is undefined. */
const put = (node: JsonNode, key: string, value: unknown): void => {
  if (value === undefined) {
    delete node[key];
  } else {
    node[key] = value as JsonNode;
  }
};
const read = (kind: Kind, document: JsonNode, behavior: Behavior = 'strict') => {
  const readers = READERS[behavior];
  if (kind === 'field') return readers.getTemplateFieldReader().readFromObject(document).field;
  if (kind === 'element') return readers.getTemplateElementReader().readFromObject(document).element;
  return readers.getTemplateReader().readFromObject(document).template;
};
const written = (kind: Kind, artifact: unknown): JsonNode => {
  if (kind === 'field') return plain(json.getFieldWriterForField(artifact as never).getAsJsonNode(artifact as never));
  if (kind === 'element') return plain(json.getTemplateElementWriter().getAsJsonNode(artifact as never));
  return plain(json.getTemplateWriter().getAsJsonNode(artifact as never));
};
/** The document for `place` with `key` set to `value` at the artifact standing there. */
const declaring = (place: string, key: string, value: unknown): [Kind, JsonNode, string[]] => {
  const [kind, path] = PLACES[place];
  const document = SOURCES[kind]();
  put(nodeAt(document, path), key, value);
  return [kind, document, path];
};

describe.each(Object.keys(READERS) as Behavior[])('the %s JSON reader', (behavior: Behavior) => {
  describe.each(Object.keys(PLACES))('in %s', (place: string) => {
    test.each([
      ['bibo:draft', 'bibo:draft'],
      ['bibo:published', 'bibo:published'],
      ['bibo:Draft', 'bibo:draft'],
      ['BIBO:PUBLISHED', 'bibo:published'],
    ])('a bibo:status of %s reads as %s', (spelling: string, status: string) => {
      const [kind, document, path] = declaring(place, 'bibo:status', spelling);
      expect(nodeAt(written(kind, read(kind, document, behavior)), path)['bibo:status']).toBe(status);
    });

    test.each([
      ['draft', 'draft'],
      ['bibo:bogus', 'bibo:bogus'],
      ['', ''],
      [' bibo:draft', ' bibo:draft'],
      [42, '42'],
    ])('a bibo:status of %j is refused', (value: unknown, shown: string) => {
      const [kind, document] = declaring(place, 'bibo:status', value);
      expect(() => read(kind, document, behavior)).toThrow(`No status constant with text ${shown} found`);
    });

    test.each([['1.5.0'], ['1.6.1'], ['2.0.0'], [42], [null]])('a schema:schemaVersion of %j is refused', (value: unknown) => {
      const [kind, document] = declaring(place, 'schema:schemaVersion', value);
      const shown = value === null ? 'none' : String(value);
      expect(() => read(kind, document, behavior)).toThrow(`Expecting model version 1.6.0, got ${shown}`);
    });

    test.each([['http://json-schema.org/draft-07/schema#'], ['http://json-schema.org/draft-04/schema'], [''], [42], [null]])(
      'a $schema of %j is refused',
      (value: unknown) => {
        const [kind, document] = declaring(place, '$schema', value);
        expect(() => read(kind, document, behavior)).toThrow(`Expecting ${DRAFT_04}, got ${value === null ? 'null' : String(value)}`);
      },
    );

    test.each([
      [`${T}Bogus`],
      [`${T}templatefield`],
      [`${T}TEMPLATEELEMENT`],
      ['TemplateField'],
      [''],
      [[`${T}TemplateField`, `${T}TemplateField`]],
      [[]],
      [42],
      [null],
    ])('an @type of %j is refused', (value: unknown) => {
      const [kind, document] = declaring(place, '@type', value);
      expect(() => read(kind, document, behavior)).toThrow(/JSON-LD @type/);
    });
  });

  test.each([
    ['a field', `${T}TemplateElement`],
    ['a field', `${T}Template`],
    ['an element', `${T}TemplateField`],
    ['an element', `${T}Template`],
    ['a template', `${T}TemplateElement`],
    ['a template', `${T}TemplateField`],
    ['a child field', `${T}Template`],
    ['a child element', `${T}Template`],
    ['a field in a child element', `${T}Template`],
  ])('%s declaring itself %s is refused', (place: string, type: string) => {
    const [kind, document] = declaring(place, '@type', type);
    expect(() => read(kind, document, behavior)).toThrow(/JSON-LD @type|Invalid nesting of template schema artifact/);
  });

  test.each([
    ['a template', 'Object'],
    ['a template', 'array'],
    ['an element', 'OBJECT'],
    ['an element', 'string'],
    ['an element', null],
  ])('%s of JSON Schema type %j is refused', (place: string, value: unknown) => {
    const [kind, document] = declaring(place, 'type', value);
    const shown = value === undefined ? 'none' : String(value);
    expect(() => read(kind, document, behavior)).toThrow(`Expecting artifact JSON Schema type object, got ${shown}`);
  });

  test.each([
    ['a child field', 'Object'],
    ['a child field', 'string'],
    ['a child field', ''],
    ['a child field', 42],
    ['a child field', null],
    ['a child element', 'Object'],
    ['a child element', null],
    ['a field in a child element', 'OBJECT'],
  ])('%s of JSON Schema type %j is refused', (place: string, value: unknown) => {
    const [kind, document] = declaring(place, 'type', value);
    const shown = value === undefined ? 'none' : String(value);
    expect(() => read(kind, document, behavior)).toThrow(`Expecting array or object, got ${shown}`);
  });

  describe("a controlled-term field's term types and actions", () => {
    const source = () => plain(json.getFieldWriterForField(controlledTerm()).getAsJsonNode(controlledTerm()));
    const entry = (document: JsonNode, list: 'classes' | 'actions'): JsonNode =>
      ((document._valueConstraints as JsonNode)[list] as JsonNode[])[0];
    const readField = (document: JsonNode) => written('field', read('field', document, behavior));

    test.each([
      ['classes', 'OntologyClass', 'OntologyClass'],
      ['classes', 'Value', 'Value'],
      ['classes', 'ontologyclass', 'OntologyClass'],
      ['classes', 'VALUE', 'Value'],
      ['actions', 'OntologyClass', 'OntologyClass'],
      ['actions', 'value', 'Value'],
    ])('a type in %s of %s reads as %s', (list: string, spelling: string, type: string) => {
      const document = source();
      entry(document, list as 'classes').type = spelling;
      expect(entry(readField(document), list as 'classes').type).toBe(type);
    });

    test.each([
      ['classes', 'Ontology Class', 'No value type constant with name Ontology Class found'],
      ['classes', 'class', 'No value type constant with name class found'],
      ['classes', '', 'No value type constant with name  found'],
      ['classes', 42, 'No value type constant with name 42 found'],
      ['classes', null, 'A class constraint requires a term type.'],
      ['classes', undefined, 'A class constraint requires a term type.'],
      ['actions', 'bogus', 'No value type constant with name bogus found'],
      ['actions', null, 'A controlled-term action requires a term type.'],
      ['actions', undefined, 'A controlled-term action requires a term type.'],
    ])('a type in %s of %j is refused', (list: string, value: unknown, refusal: string) => {
      const document = source();
      put(entry(document, list as 'classes'), 'type', value);
      expect(() => read('field', document, behavior)).toThrow(refusal);
    });

    test.each([
      ['Delete', 'No value constraints action type constant with text Delete found'],
      ['MOVE', 'No value constraints action type constant with text MOVE found'],
      ['remove', 'No value constraints action type constant with text remove found'],
      ['', 'No value constraints action type constant with text  found'],
      [42, 'No value constraints action type constant with text 42 found'],
      [null, 'A controlled-term action requires an action.'],
      [undefined, 'A controlled-term action requires an action.'],
    ])('an action of %j is refused', (value: unknown, refusal: string) => {
      const document = source();
      put(entry(document, 'actions'), 'action', value);
      expect(() => read('field', document, behavior)).toThrow(refusal);
    });

    test('an action of delete or move reads', () => {
      const document = source();
      expect(entry(readField(document), 'actions').action).toBe('delete');
      entry(document, 'actions').action = 'move';
      entry(document, 'actions').to = 0;
      expect(entry(readField(document), 'actions').action).toBe('move');
    });
  });
});

/**
 * A declaration left out. A strict reader refuses it, as Java does. The compatibility reader, which
 * CEE opens a host's template with, still opens it, as it always has: CEE reads a template that
 * states nothing but its properties. It refuses a declaration that is there and wrong.
 */
describe('a declaration left out', () => {
  const ROOTS = ['a field', 'an element', 'a template'];
  const cases: [string, string, string][] = [
    ...Object.keys(PLACES).map((place): [string, string, string] => [
      place,
      'schema:schemaVersion',
      'Expecting model version 1.6.0, got none',
    ]),
    ...Object.keys(PLACES).map((place): [string, string, string] => [place, '@type', 'A schema artifact must declare a JSON-LD @type']),
    ...ROOTS.map((place): [string, string, string] => [place, '$schema', `Expecting ${DRAFT_04}, got none`]),
    ['a template', 'type', 'Expecting artifact JSON Schema type object, got none'],
    ['an element', 'type', 'Expecting artifact JSON Schema type object, got none'],
    ['a child element', 'type', 'Expecting array or object, got none'],
    ['a child field', 'type', 'Expecting array or object, got none'],
  ];

  test.each(cases)('in %s, a missing %s is refused by the strict reader', (place: string, key: string, refusal: string) => {
    const [kind, document] = declaring(place, key, undefined);
    expect(() => read(kind, document, 'strict')).toThrow(refusal);
  });

  test.each(cases)('in %s, a missing %s still opens in the compatibility reader', (place: string, key: string) => {
    const [kind, document] = declaring(place, key, undefined);
    expect(() => read(kind, document, 'February 2024')).not.toThrow();
  });

  test.each(NESTED)('in %s, a missing $schema is not refused, as in Java', (place: string) => {
    const [kind, document] = declaring(place, '$schema', undefined);
    expect(() => read(kind, document, 'strict')).not.toThrow();
  });

  test('the compatibility reader opens a template that states nothing but its properties', () => {
    expect(() => READERS['February 2024'].getTemplateReader().readFromObject({ properties: {} })).not.toThrow();
    expect(() => READERS.strict.getTemplateReader().readFromObject({ properties: {} })).toThrow(/JSON-LD @type/);
  });
});

/**
 * An `@type` given as a list. Java reads a list of one IRI as that IRI, in an artifact read on its own
 * and in a child, and refuses a list of any other length. The field readers took the type as a string,
 * so a field declared with a list read as a field of no known type, which no writer could write, and a
 * template or an element recorded a blueprint difference.
 */
describe('an @type given as a list', () => {
  const pageBreak = () =>
    CedarBuilders.pageBreakFieldBuilder().withSchemaName('P').withAtId('https://repo.metadatacenter.org/template-fields/P').build();
  const withStaticAndMultiple = () => {
    const p = pageBreak();
    const e = element();
    return CedarBuilders.templateBuilder()
      .withSchemaName('T')
      .withAtId('https://repo.metadatacenter.org/templates/t2')
      .addChild(p, p.createDeploymentBuilder('P').build())
      .addChild(e, e.createDeploymentBuilder('E').withMultiInstance(true).withMinItems(1).build())
      .build();
  };
  const LIST_SOURCES: Record<string, [Kind, () => JsonNode]> = {
    ...Object.fromEntries(Object.entries(SOURCES).map(([kind, source]) => [kind, [kind as Kind, source]])),
    'static field': ['field', () => plain(json.getFieldWriterForField(pageBreak()).getAsJsonNode(pageBreak()))],
    'static and multiple': ['template', () => plain(json.getTemplateWriter().getAsJsonNode(withStaticAndMultiple()))],
  };
  const LIST_PLACES: Record<string, [string, string[]]> = {
    ...PLACES,
    'a static field': ['static field', []],
    'a child static field': ['static and multiple', ['properties', 'P']],
    'a multiple-instance child element': ['static and multiple', ['properties', 'E', 'items']],
    'a field in an element read alone': ['element', ['properties', 'D']],
  };
  const readWithResult = (kind: Kind, document: JsonNode, behavior: Behavior) => {
    const readers = READERS[behavior];
    if (kind === 'field') {
      const result = readers.getTemplateFieldReader().readFromObject(document);
      return { written: written(kind, result.field), errors: result.parsingResult.getBlueprintComparisonErrors() };
    }
    if (kind === 'element') {
      const result = readers.getTemplateElementReader().readFromObject(document);
      return { written: written(kind, result.element), errors: result.parsingResult.getBlueprintComparisonErrors() };
    }
    const result = readers.getTemplateReader().readFromObject(document);
    return { written: written(kind, result.template), errors: result.parsingResult.getBlueprintComparisonErrors() };
  };
  /** The document for `place`, with the type it declares there replaced by what `retype` makes of it. */
  const retyped = (place: string, retype: (type: string) => unknown): [Kind, JsonNode] => {
    const [source, path] = LIST_PLACES[place];
    const [kind, build] = LIST_SOURCES[source];
    const document = build();
    const node = nodeAt(document, path);
    node['@type'] = retype(node['@type'] as string) as JsonNode;
    return [kind, document];
  };

  describe.each(Object.keys(READERS) as Behavior[])('in the %s JSON reader', (behavior: Behavior) => {
    test.each(Object.keys(LIST_PLACES))('%s declared with a list of one reads as that type', (place: string) => {
      const [kind, asString] = retyped(place, (type) => type);
      const [, asList] = retyped(place, (type) => [type]);
      const expected = readWithResult(kind, asString, behavior);
      const actual = readWithResult(kind, asList, behavior);
      expect(actual.written).toEqual(expected.written);
      expect(actual.errors).toEqual(expected.errors);
    });

    test.each(
      Object.keys(LIST_PLACES).flatMap((place): [string, string, (type: string) => unknown, string][] => [
        [place, 'no entry', () => [], 'A schema artifact must declare a JSON-LD @type'],
        [place, 'two entries', (type) => [type, type], 'Expecting a single JSON-LD @type for a schema artifact, got 2'],
        [place, 'three entries', (type) => [type, `${T}TemplateField`, `${T}StaticTemplateField`], 'got 3'],
      ]),
    )('%s declared with a list of %s is refused', (place: string, _size: string, retype: (type: string) => unknown, refusal: string) => {
      const [kind, document] = retyped(place, retype);
      expect(() => readWithResult(kind, document, behavior)).toThrow(refusal);
    });
  });
});

describe('a YAML action is delete or move, exactly', () => {
  const yaml = CedarWriters.yaml().getStrict();
  const respell = (document: string, value: string) => document.replace(/^(\s*- )action: delete$/m, `$1action: ${value}`);

  test.each([false, true])('standalone and as a child (compact=%s)', (compact: boolean) => {
    const field = controlledTerm();
    const holder = CedarBuilders.templateBuilder().withSchemaName('T').addChild(field, field.createDeploymentBuilder('K').build()).build();
    const fieldYaml = yaml.getFieldWriterForField(field).getAsYamlString(field, compact);
    const templateYaml = yaml.getTemplateWriter().getAsYamlString(holder, compact);
    const fieldReader = compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict();
    const templateReader = compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict();
    for (const [value, shown] of [
      ['"Delete"', 'Delete'],
      ['MOVE', 'MOVE'],
      ['remove', 'remove'],
      ['42', '42'],
    ]) {
      const refusal = `No value constraints action type constant with text ${shown} found`;
      expect(() => fieldReader.readFromString(respell(fieldYaml, value))).toThrow(refusal);
      expect(() => templateReader.readFromString(respell(templateYaml, value))).toThrow(refusal);
    }
    expect(fieldReader.readFromString(fieldYaml).field).toBeDefined();
    expect(templateReader.readFromString(templateYaml).template.getChild('K')).not.toBeNull();
  });
});

/**
 * A YAML `values:` entry states which kind of constraint it is in `type`, spelled as the writer spells
 * it: ontology, class, branch or valueSet. The reader passed over an entry of any other spelling, so
 * `type: Class` read as a field with no class, and the constraint was lost. Java refuses it, and so
 * does this reader. A literal entry states no type, and is passed over as before.
 */
describe('a YAML values entry is an ontology, a class, a branch or a value set, exactly', () => {
  const yaml = CedarWriters.yaml().getStrict();
  const everyKind = () =>
    CedarBuilders.controlledTermFieldBuilder()
      .withSchemaName('Disease')
      .withAtId('https://repo.metadatacenter.org/template-fields/d1')
      .addOntology(
        new ControlledTermOntologyBuilder()
          .withAcronym('DOID')
          .withName('Human Disease Ontology')
          .withUri(new Iri('https://data.bioontology.org/ontologies/DOID'))
          .build(),
      )
      .addClass(
        new ControlledTermClassBuilder()
          .withUri(new Iri('http://purl.obolibrary.org/obo/DOID_530'))
          .withSource('DOID')
          .withLabel('eyelid disease')
          .withPrefLabel('eyelid disease')
          .withType(BioportalTermType.ONTOLOGY_CLASS)
          .build(),
      )
      .addBranch(
        new ControlledTermBranchBuilder()
          .withUri(new Iri('http://purl.obolibrary.org/obo/DOID_4'))
          .withSource('Human Disease Ontology')
          .withAcronym('DOID')
          .withName('disease')
          .withMaxDepth(3)
          .build(),
      )
      .addValueSet(
        new ControlledTermValueSetBuilder()
          .withUri(new Iri('https://example.org/value-sets/colours'))
          .withVsCollection('VS')
          .withName('Colours')
          .build(),
      )
      .build();
  const element = () => {
    const field = everyKind();
    return CedarBuilders.templateElementBuilder()
      .withSchemaName('E')
      .withAtId('https://repo.metadatacenter.org/template-elements/e1')
      .addChild(field, field.createDeploymentBuilder('Disease').build())
      .build();
  };
  const template = () => {
    const holder = element();
    return CedarBuilders.templateBuilder()
      .withSchemaName('T')
      .withAtId('https://repo.metadatacenter.org/templates/t1')
      .addChild(holder, holder.createDeploymentBuilder('E').build())
      .build();
  };
  /** Each place the field can stand: its YAML, how to read the field back, and where the field is. */
  const PLACES: Record<string, [(compact: boolean) => string, (source: string, compact: boolean) => unknown, string]> = {
    standalone: [
      (compact) => yaml.getFieldWriterForField(everyKind()).getAsYamlString(everyKind(), compact),
      (source, compact) =>
        (compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict()).readFromString(source).field,
      '',
    ],
    'a child of an element': [
      (compact) => yaml.getTemplateElementWriter().getAsYamlString(element(), compact),
      (source, compact) =>
        (compact ? YamlTemplateElementReader.getStrictForCompact() : YamlTemplateElementReader.getStrict())
          .readFromString(source)
          .element.getChild('Disease'),
      '/children/Disease',
    ],
    "a child of a template's element": [
      (compact) => yaml.getTemplateWriter().getAsYamlString(template(), compact),
      (source, compact) => {
        const holder = (compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict())
          .readFromString(source)
          .template.getChild('E');
        return holder instanceof TemplateElement ? holder.getChild('Disease') : null;
      },
      '/children/E/children/Disease',
    ],
  };
  const INDEX: Record<string, number> = { ontology: 0, class: 1, branch: 2, valueSet: 3 };
  const respell = (document: string, kind: string, value: string): string => {
    const pattern = new RegExp(`^(\\s*- )type: ${kind}$`, 'gm');
    expect(document.match(pattern)).toHaveLength(1);
    return document.replace(pattern, `$1type: ${value}`);
  };
  const constraints = (field: unknown) => {
    const { ontologies, classes, branches, valueSets } = (field as ControlledTermField).valueConstraints;
    return [ontologies.length, classes.length, branches.length, valueSets.length];
  };

  describe.each([false, true])('compact=%s', (compact: boolean) => {
    test.each(Object.keys(PLACES))('%s: each kind as the writer spells it reads back, and so does a literal entry', (place: string) => {
      const [write, readField] = PLACES[place];
      const document = write(compact);
      expect(constraints(readField(document, compact))).toEqual([1, 1, 1, 1]);
      for (const kind of Object.keys(INDEX)) {
        expect(constraints(readField(respell(document, kind, kind), compact))).toEqual([1, 1, 1, 1]);
      }
      const withLiteral = document.replace(/^(\s*)values:\n/m, '$1values:\n$1  - literal: "x"\n');
      expect(withLiteral).not.toBe(document);
      expect(constraints(readField(withLiteral, compact))).toEqual([1, 1, 1, 1]);
    });

    test.each(
      Object.keys(PLACES).flatMap((place): [string, string, string, string][] =>
        [
          ['ontology', '"Ontology"', 'Ontology'],
          ['ontology', 'ONTOLOGY', 'ONTOLOGY'],
          ['ontology', 'ontologies', 'ontologies'],
          ['class', '"Class"', 'Class'],
          ['class', 'CLASS', 'CLASS'],
          ['class', 'term', 'term'],
          ['class', 'literal', 'literal'],
          ['class', '""', ''],
          ['class', '"class "', 'class '],
          ['class', '[class]', '["class"]'],
          ['branch', 'Branch', 'Branch'],
          ['branch', 'tree', 'tree'],
          ['branch', '1', '1'],
          ['branch', 'true', 'true'],
          ['valueSet', 'valueset', 'valueset'],
          ['valueSet', 'ValueSet', 'ValueSet'],
          ['valueSet', 'value-set', 'value-set'],
        ].map(([kind, written, shown]): [string, string, string, string] => [place, kind, written, shown]),
      ),
    )('%s: a %s entry of type %s is refused', (place: string, kind: string, written: string, shown: string) => {
      const [write, readField, at] = PLACES[place];
      const refusal =
        `Invalid value constraint type "${shown}" at ${at}/values/${INDEX[kind]}/type. ` +
        'A value constraint type is one of ontology, class, branch or valueSet.';
      expect(() => readField(respell(write(compact), kind, written), compact)).toThrow(refusal);
    });
  });
});
