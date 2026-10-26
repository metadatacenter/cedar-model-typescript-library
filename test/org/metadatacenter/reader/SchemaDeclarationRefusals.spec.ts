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
  TemplateField,
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
    test.each(Object.keys(PLACES))('%s: each kind as the writer spells it reads back, and an untyped entry is refused', (place: string) => {
      const [write, readField, at] = PLACES[place];
      const document = write(compact);
      expect(constraints(readField(document, compact))).toEqual([1, 1, 1, 1]);
      for (const kind of Object.keys(INDEX)) {
        expect(constraints(readField(respell(document, kind, kind), compact))).toEqual([1, 1, 1, 1]);
      }
      const withLiteral = document.replace(/^(\s*)values:\n/m, '$1values:\n$1  - literal: "x"\n');
      expect(withLiteral).not.toBe(document);
      // An entry that states no type is none of the four, and nothing of it is read, as in Java's reader.
      expect(() => readField(withLiteral, compact)).toThrow(`Unknown key "literal" at ${at}/values[0]/literal`);
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

/**
 * A choice field's `values:` holds its options, and an option states no type. Java's reader reads every
 * field's `values:` for constraints too, so an entry that states a `type` is read as the constraint it
 * names. A type of another spelling is refused, and so is a constraint the entry does not complete. A
 * complete one is read and has no effect, since a choice field holds no constraint. These readers took
 * the option and passed over its type.
 */
describe('a YAML choice-field option is a label and a selection, as in Java', () => {
  const yaml = CedarWriters.yaml().getStrict();
  const id = (name: string) => `https://repo.metadatacenter.org/template-fields/${name}`;
  const FIELDS: Record<string, () => TemplateField> = {
    radio: () => CedarBuilders.radioFieldBuilder().withSchemaName('F').withAtId(id('r')).addRadioOption('a').addRadioOption('b').build(),
    checkbox: () =>
      CedarBuilders.checkboxFieldBuilder().withSchemaName('F').withAtId(id('c')).addCheckboxOption('a').addCheckboxOption('b').build(),
    'single-choice list': () =>
      CedarBuilders.singleChoiceListFieldBuilder().withSchemaName('F').withAtId(id('l')).addListOption('a').addListOption('b').build(),
    'multiple-choice list': () =>
      CedarBuilders.multipleChoiceListFieldBuilder().withSchemaName('F').withAtId(id('m')).addListOption('a').addListOption('b').build(),
  };
  const element = (field: TemplateField) =>
    CedarBuilders.templateElementBuilder()
      .withSchemaName('E')
      .withAtId('https://repo.metadatacenter.org/template-elements/e1')
      .addChild(field, field.createDeploymentBuilder('F').build())
      .build();
  const template = (field: TemplateField) => {
    const holder = element(field);
    return CedarBuilders.templateBuilder()
      .withSchemaName('T')
      .withAtId('https://repo.metadatacenter.org/templates/t1')
      .addChild(holder, holder.createDeploymentBuilder('E').build())
      .build();
  };
  /** Each place the field can stand: its YAML, the JSON written from reading it back, and where the field is. */
  const PLACES: Record<
    string,
    [(field: TemplateField, compact: boolean) => string, (source: string, compact: boolean) => JsonNode, string]
  > = {
    standalone: [
      (field, compact) => yaml.getFieldWriterForField(field).getAsYamlString(field, compact),
      (source, compact) => {
        const field = (compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict()).readFromString(
          source,
        ).field;
        return plain(json.getFieldWriterForField(field).getAsJsonNode(field));
      },
      '',
    ],
    'a child of an element': [
      (field, compact) => yaml.getTemplateElementWriter().getAsYamlString(element(field), compact),
      (source, compact) =>
        plain(
          json
            .getTemplateElementWriter()
            .getAsJsonNode(
              (compact ? YamlTemplateElementReader.getStrictForCompact() : YamlTemplateElementReader.getStrict()).readFromString(source)
                .element,
            ),
        ),
      '/children/F',
    ],
    "a child of a template's element": [
      (field, compact) => yaml.getTemplateWriter().getAsYamlString(template(field), compact),
      (source, compact) =>
        plain(
          json
            .getTemplateWriter()
            .getAsJsonNode(
              (compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict()).readFromString(source).template,
            ),
        ),
      '/children/E/children/F',
    ],
  };
  const CLASS = [
    'sourceAcronym: "DOID"',
    'termIri: "http://purl.obolibrary.org/obo/DOID_530"',
    'termType: class',
    'termLabel: "eyelid disease"',
  ];
  /** The document with `lines` added to the first option, which the writer spells `- label: "a"`. */
  const amendFirstOption = (document: string, lines: string[]): string => {
    const pattern = /^(\s*)- label: "a"$/gm;
    expect(document.match(pattern)).toHaveLength(1);
    return document.replace(pattern, (option: string, indent: string) => [option, ...lines.map((line) => `${indent}  ${line}`)].join('\n'));
  };
  const CASES = Object.keys(FIELDS).flatMap((field) => Object.keys(PLACES).map((place): [string, string] => [field, place]));
  /** Each spelling of a stated type, with the lines of a constraint the entry completes or does not. */
  const STATED: [string, string[]][] = [
    ['class', CLASS],
    ['ontology', ['sourceAcronym: "DOID"', 'sourceName: "Human Disease Ontology"']],
    ['branch', []],
    ['valueSet', []],
    ['"Class"', []],
    ['literal', []],
    ['""', []],
    ['1', []],
  ];

  describe.each([false, true])('compact=%s', (compact: boolean) => {
    test.each(CASES)('a %s, %s: the options as written read back', (fieldKind: string, place: string) => {
      const [write, read] = PLACES[place];
      const document = write(FIELDS[fieldKind](), compact);
      expect(() => read(document, compact)).not.toThrow();
    });

    test.each(
      CASES.flatMap(([fieldKind, place]) =>
        STATED.map(([type, lines]): [string, string, string, string[]] => [fieldKind, place, type, lines]),
      ),
    )(
      'a %s, %s: an option that states the type %s is refused for it',
      (fieldKind: string, place: string, type: string, lines: string[]) => {
        const [write, read, at] = PLACES[place];
        const amended = amendFirstOption(write(FIELDS[fieldKind](), compact), [`type: ${type}`, ...lines]);
        expect(() => read(amended, compact)).toThrow(
          `Unknown key "type" at ${at}/values[0]/type; it is not part of this artifact's YAML form.`,
        );
      },
    );

    test.each(CASES)('a %s, %s: an option without a label is refused for what it states', (fieldKind: string, place: string) => {
      const [write, read, at] = PLACES[place];
      const document = write(FIELDS[fieldKind](), compact).replace(/^(\s*)- label: "a"$/m, '$1- selected: true');
      expect(() => read(document, compact)).toThrow(`Unknown key "selected" at ${at}/values[0]/selected`);
    });
  });
});

/**
 * An ontology's and a value set's term count and a branch's maximum depth are Java `int`s. Java's
 * readers hold one only where the source typed an integer, from -2147483648 to 2147483647, so they
 * refuse a fraction, a number written as a decimal such as `3.0`, a number past that range, a string,
 * a boolean, a list and a mapping. These readers took any of them. YAML spells the keys `termCount`
 * and `termMaxDepth`, and JSON `numTerms` and `maxDepth`.
 */
describe('a term count and a maximum depth are Java integers', () => {
  const yaml = CedarWriters.yaml().getStrict();
  const constrained = () =>
    CedarBuilders.controlledTermFieldBuilder()
      .withSchemaName('K')
      .withAtId('https://repo.metadatacenter.org/template-fields/k1')
      .addOntology(
        new ControlledTermOntologyBuilder()
          .withAcronym('DOID')
          .withName('Human Disease Ontology')
          .withUri(new Iri('https://data.bioontology.org/ontologies/DOID'))
          .withNumTerms(5)
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
          .withNumTerms(4)
          .build(),
      )
      .build();
  const holding = (field: TemplateField) => {
    const holder = CedarBuilders.templateElementBuilder()
      .withSchemaName('E')
      .withAtId('https://repo.metadatacenter.org/template-elements/e1')
      .addChild(field, field.createDeploymentBuilder(field.schema_name ?? '').build())
      .build();
    return CedarBuilders.templateBuilder()
      .withSchemaName('T')
      .withAtId('https://repo.metadatacenter.org/templates/t1')
      .addChild(holder, holder.createDeploymentBuilder('E').build())
      .build();
  };
  const fieldIn = (template: { getChild(name: string): unknown }, name: string): TemplateField => {
    const holder = template.getChild('E');
    if (!(holder instanceof TemplateElement)) throw new Error('No element E');
    return holder.getChild(name) as TemplateField;
  };
  /** Each constraint's count or depth, in the order ontology, branch, value set. */
  const stated = (field: TemplateField) => {
    const { ontologies, branches, valueSets } = (field as ControlledTermField).valueConstraints;
    return [ontologies[0].numTerms, branches[0].maxDepth, valueSets[0].numTerms];
  };
  const refusal = (key: string, shown: string, at: string) =>
    `Invalid ${key} ${shown} at ${at}/${key}. Expected an integer from -2147483648 to 2147483647.`;
  /** The document with the one `key: was` line respelled as `key: now`. */
  const respell = (document: string, pattern: string, replacement: string): string => {
    const occurrences = document.split(pattern).length - 1;
    expect(occurrences).toBe(1);
    return document.replace(pattern, replacement);
  };

  /** Each key, how the writer spells the value it holds, and which value the field read from it holds. */
  const YAML_KEYS: [string, string, number, number][] = [
    ['termCount', 'termCount: 5', 0, 0],
    ['termMaxDepth', 'termMaxDepth: 3', 1, 1],
    ['termCount', 'termCount: 4', 2, 2],
  ];
  const YAML_REFUSED: [string, string][] = [
    ['2.5', '2.5'],
    ['3.0', '3.0'],
    ['3e0', '3e0'],
    ['"3"', '"3"'],
    ["'3'", '"3"'],
    ['true', 'true'],
    ['2147483648', '2147483648'],
    ['-2147483649', '-2147483649'],
    ['[3]', '[3]'],
    ['{n: 3}', '{"n":3}'],
  ];
  const YAML_READ: [string, number][] = [
    ['0', 0],
    ['7', 7],
    ['-1', -1],
    ['+4', 4],
    ['0x10', 16],
    ['0o17', 15],
    ['!!int 5', 5],
    ['2147483647', 2147483647],
    ['-2147483648', -2147483648],
  ];
  /** Each place a controlled-term field can stand in YAML: its document, how to read the field back, and where it is. */
  const YAML_PLACES: Record<string, [(compact: boolean) => string, (source: string, compact: boolean) => TemplateField, string]> = {
    standalone: [
      (compact) => yaml.getFieldWriterForField(constrained()).getAsYamlString(constrained(), compact),
      (source, compact) =>
        (compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict()).readFromString(source).field,
      '',
    ],
    "a child of a template's element": [
      (compact) => yaml.getTemplateWriter().getAsYamlString(holding(constrained()), compact),
      (source, compact) =>
        fieldIn((compact ? YamlTemplateReader.getStrictForCompact() : YamlTemplateReader.getStrict()).readFromString(source).template, 'K'),
      '/children/E/children/K',
    ],
  };

  describe.each([false, true])('in YAML, compact=%s', (compact: boolean) => {
    test.each(Object.keys(YAML_PLACES))('%s: a controlled-term field states integers, and they read back', (place: string) => {
      const [write, readField] = YAML_PLACES[place];
      const document = write(compact);
      expect(stated(readField(document, compact))).toEqual([5, 3, 4]);
      for (const [key, line, , position] of YAML_KEYS) {
        for (const [spelling, value] of YAML_READ) {
          const expected = [5, 3, 4];
          expected[position] = value;
          expect(stated(readField(respell(document, line, `${key}: ${spelling}`), compact))).toEqual(expected);
        }
      }
    });

    test.each(
      Object.keys(YAML_PLACES).flatMap((place) =>
        YAML_KEYS.map(([key, line, index]): [string, string, string, number] => [place, key, line, index]),
      ),
    )('%s: a controlled-term field whose %s is not an integer is refused', (place: string, key: string, line: string, index: number) => {
      const [write, readField, at] = YAML_PLACES[place];
      const document = write(compact);
      for (const [spelling, shown] of YAML_REFUSED) {
        expect(() => readField(respell(document, line, `${key}: ${spelling}`), compact)).toThrow(
          refusal(key, shown, `${at}/values/${index}`),
        );
      }
    });
  });

  /** Each JSON key, how the writer spells the value it holds, where it is, and which value the field read from it holds. */
  const JSON_KEYS: [string, string, string, number][] = [
    ['numTerms', '"numTerms": 5', 'ontologies/0', 0],
    ['maxDepth', '"maxDepth": 3', 'branches/0', 1],
    ['numTerms', '"numTerms": 4', 'valueSets/0', 2],
  ];
  const JSON_REFUSED: [string, string][] = [
    ['2.5', '2.5'],
    ['3.0', '3.0'],
    ['3e0', '3e0'],
    ['1E2', '1E2'],
    ['"3"', '"3"'],
    ['true', 'true'],
    ['2147483648', '2147483648'],
    ['-2147483649', '-2147483649'],
    ['[3]', '[3]'],
    ['{}', '{}'],
  ];
  const JSON_READ: [string, number][] = [
    ['0', 0],
    ['7', 7],
    ['-1', -1],
    ['2147483647', 2147483647],
    ['-2147483648', -2147483648],
  ];
  /** Each place a controlled-term field can stand in JSON: its document, how to read the field back, and where it is. */
  const JSON_PLACES: Record<string, [() => string, (source: string, behavior: Behavior) => TemplateField, string]> = {
    standalone: [
      () => json.getFieldWriterForField(constrained()).getAsJsonString(constrained()),
      (source, behavior) => READERS[behavior].getTemplateFieldReader().readFromString(source).field,
      '',
    ],
    "a child of a template's element": [
      () => json.getTemplateWriter().getAsJsonString(holding(constrained())),
      (source, behavior) => fieldIn(READERS[behavior].getTemplateReader().readFromString(source).template, 'K'),
      '/properties/E/properties/K',
    ],
  };

  describe.each(Object.keys(READERS) as Behavior[])('in JSON, the %s reader', (behavior: Behavior) => {
    test.each(Object.keys(JSON_PLACES))('%s: a controlled-term field states integers, and they read back', (place: string) => {
      const [write, readField] = JSON_PLACES[place];
      const document = write();
      expect(stated(readField(document, behavior))).toEqual([5, 3, 4]);
      for (const [key, line, , position] of JSON_KEYS) {
        for (const [spelling, value] of JSON_READ) {
          const expected = [5, 3, 4];
          expected[position] = value;
          expect(stated(readField(respell(document, line, `"${key}": ${spelling}`), behavior))).toEqual(expected);
        }
      }
    });

    test.each(
      Object.keys(JSON_PLACES).flatMap((place) =>
        JSON_KEYS.map(([key, line, at]): [string, string, string, string] => [place, key, line, at]),
      ),
    )('%s: a controlled-term field whose %s is not an integer is refused', (place: string, key: string, line: string, entry: string) => {
      const [write, readField, at] = JSON_PLACES[place];
      const document = write();
      for (const [spelling, shown] of JSON_REFUSED) {
        expect(() => readField(respell(document, line, `"${key}": ${spelling}`), behavior)).toThrow(
          refusal(key, shown, `${at}/_valueConstraints/${entry}`),
        );
      }
    });

    test.each(Object.keys(JSON_PLACES))('%s: a null term count reads as none, and a null depth is refused', (place: string) => {
      const [write, readField, at] = JSON_PLACES[place];
      const document = write();
      const withNullCounts = respell(respell(document, '"numTerms": 5', '"numTerms": null'), '"numTerms": 4', '"numTerms": null');
      expect(stated(readField(withNullCounts, behavior))).toEqual([null, 3, null]);
      expect(() => readField(respell(document, '"maxDepth": 3', '"maxDepth": null'), behavior)).toThrow(
        refusal('maxDepth', 'null', `${at}/_valueConstraints/branches/0`),
      );
    });

    /**
     * Java reads a JSON branch's depth with `readRequiredInt`, so it refuses a branch that states none.
     * These readers read one as depth 0. Nothing the estate writes omits it: this library's JSON writer,
     * the designer and the term picker all state a depth, and the artifact server reads every write
     * with Java's reader, so no stored branch omits one either.
     */
    test.each(Object.keys(JSON_PLACES))('%s: a branch that states no depth is refused', (place: string) => {
      const [write, readField, at] = JSON_PLACES[place];
      // The writer states the depth last, after the branch's name.
      const withoutDepth = respell(respell(write(), '"name": "disease",', '"name": "disease"'), '"maxDepth": 3', '');
      expect(withoutDepth).not.toContain('"maxDepth"');
      expect(() => readField(withoutDepth, behavior)).toThrow(
        `Missing maxDepth at ${at}/_valueConstraints/branches/0/maxDepth. Expected an integer from -2147483648 to 2147483647.`,
      );
    });
  });

  test('a JSON branch built by a caller with no depth, or an undefined one, is refused', () => {
    const document = plain(json.getFieldWriterForField(constrained()).getAsJsonNode(constrained()));
    const branch = ((document._valueConstraints as JsonNode).branches as JsonNode[])[0];
    const missing = 'Missing maxDepth at /_valueConstraints/branches/0/maxDepth. Expected an integer from -2147483648 to 2147483647.';
    for (const reader of Object.values(READERS)) {
      delete branch.maxDepth;
      expect(() => reader.getTemplateFieldReader().readFromObject(document)).toThrow(missing);
      branch.maxDepth = undefined;
      expect(() => reader.getTemplateFieldReader().readFromObject(document)).toThrow(missing);
    }
  });

  test.each([false, true])(
    'a YAML branch that states no depth still reads as depth 0, as Java reads it, compact=%s',
    (compact: boolean) => {
      const document = yaml.getFieldWriterForField(constrained()).getAsYamlString(constrained(), compact);
      const withoutDepth = document
        .split('\n')
        .filter((line) => line.trim() !== 'termMaxDepth: 3')
        .join('\n');
      expect(document).toContain('termMaxDepth: 3');
      expect(withoutDepth).not.toContain('termMaxDepth');
      const reader = compact ? YamlTemplateFieldReader.getStrictForCompact() : YamlTemplateFieldReader.getStrict();
      expect(stated(reader.readFromString(withoutDepth).field)).toEqual([5, 0, 4]);
    },
  );

  test('a JSON object built by a caller rather than parsed from text is judged by its values', () => {
    const document = plain(json.getFieldWriterForField(constrained()).getAsJsonNode(constrained()));
    const ontology = ((document._valueConstraints as JsonNode).ontologies as JsonNode[])[0];
    ontology.numTerms = 3.0;
    expect(stated(READERS.strict.getTemplateFieldReader().readFromObject(document).field)).toEqual([3, 3, 4]);
    ontology.numTerms = 2.5;
    expect(() => READERS.strict.getTemplateFieldReader().readFromObject(document)).toThrow(
      refusal('numTerms', '2.5', '/_valueConstraints/ontologies/0'),
    );
  });
});
