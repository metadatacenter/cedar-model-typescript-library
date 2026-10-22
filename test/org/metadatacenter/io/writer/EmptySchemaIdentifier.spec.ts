import { CedarBuilders, CedarReaders, CedarWriters, JsonNode } from '../../../../../src';
import { AbstractSchemaArtifact } from '../../../../../src/org/metadatacenter/model/cedar/AbstractSchemaArtifact';

/**
 * An empty identifier, `identifier: ""`, is read and kept by both readers in both libraries. The
 * Java JSON renderer leaves it out, since the meta-schema requires a stated `schema:identifier` to
 * be non-empty, and the TypeScript JSON writer now does the same. The Java YAML renderer writes it
 * as it was read, and so does the TypeScript YAML writer, in full and compact form alike. A blank
 * identifier is not empty, and both writers keep it.
 */
type Kind = 'template' | 'element' | 'field';

const HEADER: Record<Kind, string> = {
  template: 'type: template\nname: "T"\nid: "https://repo.metadatacenter.org/templates/t1"\n',
  element: 'type: element\nname: "E"\nid: "https://repo.metadatacenter.org/template-elements/e1"\n',
  field: 'type: text-field\nname: "F"\nid: "https://repo.metadatacenter.org/template-fields/f1"\n',
};
const METADATA = 'modelVersion: 1.6.0\nversion: 0.0.1\nstatus: draft\n';

const childYaml = (type: string, identifier: string) =>
  'children:\n' +
  `  - key: "C"\n    type: ${type}\n    name: "C"\n` +
  `    id: "https://repo.metadatacenter.org/${type === 'element' ? 'template-elements' : 'template-fields'}/c1"\n` +
  `    modelVersion: 1.6.0\n    identifier: ${JSON.stringify(identifier)}\n`;

/** Each place an identifier can be: on the artifact itself, or on a child a container holds. */
const PLACES: Record<string, { kind: Kind; yaml: (identifier: string) => string; child: boolean }> = {
  'a template': { kind: 'template', yaml: (i) => HEADER.template + METADATA + `identifier: ${JSON.stringify(i)}\n`, child: false },
  'an element': { kind: 'element', yaml: (i) => HEADER.element + METADATA + `identifier: ${JSON.stringify(i)}\n`, child: false },
  'a field': { kind: 'field', yaml: (i) => HEADER.field + METADATA + `identifier: ${JSON.stringify(i)}\n`, child: false },
  'a static field': {
    kind: 'field',
    yaml: (i) =>
      'type: static-section-break\nname: "S"\nid: "https://repo.metadatacenter.org/template-fields/s1"\n' +
      METADATA +
      `identifier: ${JSON.stringify(i)}\n`,
    child: false,
  },
  'a field in a template': { kind: 'template', yaml: (i) => HEADER.template + METADATA + childYaml('text-field', i), child: true },
  'an element in a template': { kind: 'template', yaml: (i) => HEADER.template + METADATA + childYaml('element', i), child: true },
  'a field in an element': { kind: 'element', yaml: (i) => HEADER.element + METADATA + childYaml('text-field', i), child: true },
};

const readYaml = (kind: Kind, yaml: string, compact = false): AbstractSchemaArtifact => {
  const readers = compact ? CedarReaders.yaml().getStrictForCompact() : CedarReaders.yaml().getStrict();
  if (kind === 'template') return readers.getTemplateReader().readFromString(yaml).template;
  if (kind === 'element') return readers.getTemplateElementReader().readFromString(yaml).element;
  return readers.getTemplateFieldReader().readFromString(yaml).field;
};

const readJson = (kind: Kind, json: JsonNode): AbstractSchemaArtifact => {
  const readers = CedarReaders.json().getStrict();
  if (kind === 'template') return readers.getTemplateReader().readFromObject(json).template;
  if (kind === 'element') return readers.getTemplateElementReader().readFromObject(json).element;
  return readers.getTemplateFieldReader().readFromObject(json).field;
};

const writeJson = (artifact: AbstractSchemaArtifact): JsonNode =>
  JSON.parse(
    CedarWriters.json()
      .getStrict()
      .getWriterForArtifact(artifact)
      .getAsJsonString(artifact as never),
  );

const writeYaml = (kind: Kind, artifact: AbstractSchemaArtifact, compact: boolean): string => {
  const writers = CedarWriters.yaml().getStrict();
  const writer =
    kind === 'template'
      ? writers.getTemplateWriter()
      : kind === 'element'
        ? writers.getTemplateElementWriter()
        : writers.getFieldWriterForField(artifact as never);
  return writer.getAsYamlString(artifact as never, compact);
};

/** The JSON node that carries the identifier: the artifact's own, or its child's. */
const holder = (json: JsonNode, child: boolean): JsonNode => (child ? ((json['properties'] as JsonNode)['C'] as JsonNode) : json);

const identifierLines = (yaml: string): string[] => yaml.split('\n').filter((line) => line.trim().startsWith('identifier:'));

describe('an empty schema identifier', () => {
  test.each(Object.keys(PLACES))('is left out of the JSON written for %s read from YAML', (place) => {
    const { kind, yaml, child } = PLACES[place];

    expect(Object.keys(holder(writeJson(readYaml(kind, yaml(''))), child))).not.toContain('schema:identifier');
  });

  test.each(Object.keys(PLACES))('is left out of the JSON written for %s read from JSON', (place) => {
    const { kind, yaml, child } = PLACES[place];
    const source = writeJson(readYaml(kind, yaml('ABC')));
    holder(source, child)['schema:identifier'] = '';

    expect(Object.keys(holder(writeJson(readJson(kind, source)), child))).not.toContain('schema:identifier');
  });

  test('is left out of the JSON written for an artifact built with one', () => {
    const field = CedarBuilders.textFieldBuilder().withSchemaName('F').withSchemaIdentifier('').build();
    const template = CedarBuilders.templateBuilder()
      .withSchemaName('T')
      .withSchemaIdentifier('')
      .addChild(field, field.createDeploymentBuilder('C').build())
      .build();
    const json = writeJson(template);

    expect(Object.keys(json)).not.toContain('schema:identifier');
    expect(Object.keys(holder(json, true))).not.toContain('schema:identifier');
  });

  test.each(Object.keys(PLACES))('is kept in the YAML written for %s, full and compact', (place) => {
    const { kind, yaml } = PLACES[place];
    for (const compact of [false, true]) {
      const written = writeYaml(kind, readYaml(kind, yaml('')), compact);

      expect(identifierLines(written).map((line) => line.trim())).toEqual(['identifier: ""']);
      expect(writeYaml(kind, readYaml(kind, written, compact), compact)).toBe(written);
    }
  });

  test.each([' ', 'ABC'])('does not cover %j, which both writers keep', (identifier) => {
    for (const place of Object.keys(PLACES)) {
      const { kind, yaml, child } = PLACES[place];
      const artifact = readYaml(kind, yaml(identifier));

      expect(holder(writeJson(artifact), child)['schema:identifier']).toBe(identifier);
      expect(identifierLines(writeYaml(kind, artifact, false)).map((line) => line.trim())).toEqual([
        `identifier: ${JSON.stringify(identifier)}`,
      ]);
    }
  });
});
