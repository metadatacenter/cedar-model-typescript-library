import {
  CedarJsonReaders,
  CedarWriters,
  CedarYamlReaders,
  InstanceDataControlledAtom,
  InstanceDataLabelAtom,
  InstanceDataLinkAtom,
  InstanceDataNotationAtom,
  InstanceDataTypedAtom,
  JsonTemplateInstanceWriter,
} from '../../../../../src';
import { TemplateInstance } from '../../../../../src/org/metadatacenter/model/cedar/template-instance/TemplateInstance';

/**
 * A value's datatype is written as the Java library writes it. An IRI in the XSD namespace with a
 * local name is written as `xsd:` and that name, whether or not the library has a constant for it.
 * Any other IRI is written as it was read: the namespace IRI itself, which has no local name, and an
 * IRI that only begins as the namespace does. The two writers spell a datatype the same way, so JSON
 * and YAML agree. In YAML the name is plain only when the plain-scalar policy lists it, as in Java.
 */
const XSD = 'http://www.w3.org/2001/XMLSchema#';

const SHAPES: Record<string, { json: Record<string, string>; yaml: string }> = {
  literal: { json: { '@value': '42' }, yaml: '    value: "42"\n' },
  'controlled term': {
    json: { '@id': 'https://example.org/x', 'rdfs:label': 'X' },
    yaml: '    id: "https://example.org/x"\n    label: "X"\n',
  },
  link: { json: { '@id': 'https://example.org/x' }, yaml: '    id: "https://example.org/x"\n' },
  label: { json: { 'rdfs:label': 'X' }, yaml: '    label: "X"\n' },
  notation: { json: { 'skos:notation': 'n' }, yaml: '    notation: "n"\n' },
};

/** A field is a child of the instance; an attribute value is a member of the group A. */
const POSITIONS = ['field', 'attribute'] as const;
type Position = (typeof POSITIONS)[number];

const fromJson = (type: string, shape: string, position: Position): TemplateInstance =>
  CedarJsonReaders.getStrict()
    .getTemplateInstanceReader()
    .readFromObject({
      'schema:name': 'Typed',
      'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/t1',
      ...(position === 'attribute' ? { A: ['F'] } : {}),
      F: { ...SHAPES[shape].json, '@type': type },
    }).instance;

const fromYaml = (type: string, shape: string, position: Position): TemplateInstance =>
  CedarYamlReaders.getStrict()
    .getTemplateInstanceReader()
    .readFromString(
      'type: instance\nname: Typed\nisBasedOn: "https://repo.metadatacenter.org/templates/t1"\n' +
        `${position === 'field' ? 'children' : 'A'}:\n  F:\n    datatype: ${JSON.stringify(type)}\n` +
        SHAPES[shape].yaml,
    ).instance;

const READ = { JSON: fromJson, YAML: fromYaml };

const jsonType = (instance: TemplateInstance): unknown =>
  (CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(instance) as any).F['@type'];

const yamlDatatypeLine = (instance: TemplateInstance, compact: boolean): string | undefined =>
  CedarWriters.yaml()
    .getStrict()
    .getTemplateInstanceWriter()
    .getAsYamlString(instance, compact)
    .match(/^ *datatype: .*$/m)?.[0]
    .trim();

/** The datatype as the JSON writer, the YAML writer and the compact YAML writer write it. */
const written = (instance: TemplateInstance) => ({
  json: jsonType(instance),
  yaml: yamlDatatypeLine(instance, false),
  compact: yamlDatatypeLine(instance, true),
});

/** Every combination of a datatype spelling with a value shape, a position and a source format. */
const combinations = <T extends unknown[]>(rows: T[]): [...T, string, Position, keyof typeof READ][] =>
  rows.flatMap((row) =>
    Object.keys(SHAPES).flatMap((shape) =>
      POSITIONS.flatMap((position) =>
        (['JSON', 'YAML'] as const).map((format) => [...row, shape, position, format] as [...T, string, Position, keyof typeof READ]),
      ),
    ),
  );

describe('XSD datatype spelling in the instance writers', () => {
  // The plain-scalar policy lists the first three names and not the other four. The last differs from
  // xsd:dateTime only in case, and XSD names are case-sensitive.
  const PREFIXED: [string, string, string][] = [
    [XSD + 'string', 'xsd:string', 'datatype: xsd:string'],
    [XSD + 'anyURI', 'xsd:anyURI', 'datatype: xsd:anyURI'],
    [XSD + 'int', 'xsd:int', 'datatype: xsd:int'],
    [XSD + 'integer', 'xsd:integer', 'datatype: "xsd:integer"'],
    [XSD + 'boolean', 'xsd:boolean', 'datatype: "xsd:boolean"'],
    [XSD + 'nonNegativeInteger', 'xsd:nonNegativeInteger', 'datatype: "xsd:nonNegativeInteger"'],
    [XSD + 'DateTime', 'xsd:DateTime', 'datatype: "xsd:DateTime"'],
  ];

  test.each(combinations(PREFIXED))(
    'writes %s as %s (YAML %s) on a %s %s read from %s',
    (iri, prefixed, yamlLine, shape, position, format) => {
      expect(written(READ[format](iri, shape, position))).toEqual({ json: prefixed, yaml: yamlLine, compact: yamlLine });
    },
  );

  const ALREADY_PREFIXED = PREFIXED.map(([, prefixed, yamlLine]): [string, string] => [prefixed, yamlLine]);

  test.each(combinations(ALREADY_PREFIXED))('keeps %s (YAML %s) on a %s %s read from %s', (prefixed, yamlLine, shape, position, format) => {
    expect(written(READ[format](prefixed, shape, position))).toEqual({ json: prefixed, yaml: yamlLine, compact: yamlLine });
  });

  const AS_WRITTEN: [string][] = [
    // The namespace has no local name, and a bare xsd: is not an IRI.
    [XSD],
    // The namespace ends at its #, so neither of these lies inside it.
    ['http://www.w3.org/2001/XMLSchema-datatypes#integer'],
    ['https://www.w3.org/2001/XMLSchema#integer'],
    // A datatype outside XSD altogether.
    ['https://example.org/type'],
  ];

  test.each(combinations(AS_WRITTEN))('writes %s as it is on a %s %s read from %s', (iri, shape, position, format) => {
    const yamlLine = `datatype: "${iri}"`;
    expect(written(READ[format](iri, shape, position))).toEqual({ json: iri, yaml: yamlLine, compact: yamlLine });
  });

  test('a datatype written prefixed reads back unchanged through YAML', () => {
    const yamlWriter = CedarWriters.yaml().getStrict().getTemplateInstanceWriter();
    for (const compact of [false, true]) {
      const yaml = yamlWriter.getAsYamlString(fromJson(XSD + 'integer', 'literal', 'field'), compact);
      const readers = compact ? CedarYamlReaders.getStrictForCompact() : CedarYamlReaders.getStrict();
      const reread = readers.getTemplateInstanceReader().readFromString(yaml).instance;

      expect(jsonType(reread)).toBe('xsd:integer');
      expect(yamlWriter.getAsYamlString(reread, compact)).toBe(yaml);
    }
  });

  test('the value writer a consumer calls spells a built value the same way', () => {
    const id = 'https://example.org/x';
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataTypedAtom('42', XSD + 'integer'))).toEqual({
      '@value': '42',
      '@type': 'xsd:integer',
    });
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataControlledAtom(id, 'X', XSD + 'anyURI'))).toEqual({
      '@id': id,
      'rdfs:label': 'X',
      '@type': 'xsd:anyURI',
    });
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataLinkAtom(id, XSD + 'anyURI'))).toEqual({
      '@id': id,
      '@type': 'xsd:anyURI',
    });
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataLabelAtom('X', XSD + 'string'))).toEqual({
      'rdfs:label': 'X',
      '@type': 'xsd:string',
    });
    expect(JsonTemplateInstanceWriter.writeValueNode(new InstanceDataNotationAtom('n', XSD + 'string'))).toEqual({
      '@type': 'xsd:string',
      'skos:notation': 'n',
    });
  });
});
