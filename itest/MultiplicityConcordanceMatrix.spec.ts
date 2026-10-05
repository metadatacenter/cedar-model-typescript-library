import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as YAML from 'yaml';
import { CedarReaders, CedarWriters, InstanceInflater, JsonNode } from '../src';

/**
 * Every kind of repeated child, with every combination of stated bounds, in a template and in an
 * element, as the Java library writes and fills it.
 *
 * The writers and inflaters of the two libraries each decided how many occurrences a child takes,
 * and they disagreed. This inflater gave a missing repeated child an empty list, so an instance it
 * inflated failed its own template wherever the template's lower bound was above zero. Both writers
 * raised a maximum below the minimum to the minimum, which rewrote what an author stated and turned
 * a maximum of 0, CEDAR's "no upper bound", into a limit. Java refuses such a child, and this library
 * now does too.
 *
 * A case is its kind's base template with the child wrapped in a list stating the case's bounds;
 * Java asserts that this is exactly what it writes, so the template read here is Java's own output.
 */
type Bounds = { minItems?: number; maxItems?: number } | null;
type Case = {
  id: string;
  base: string;
  container: 'template' | 'element';
  refused: boolean;
  bounds: Bounds;
  yaml?: string;
  inflatedOccurrences?: number | null;
};
type Fixture = { bases: Record<string, JsonNode>; sparseInstance: JsonNode; cases: Case[] };

const directory = path.join(__dirname, 'resources/concordance');
const bytes = fs.readFileSync(path.join(directory, 'java-multiplicity-matrix.json'));
const fixture = JSON.parse(bytes.toString()) as Fixture;
const lock = JSON.parse(fs.readFileSync(path.join(directory, 'java-multiplicity-matrix-lock.json'), 'utf8'));
const jsonReaders = CedarReaders.json().getStrict();
const yamlReaders = CedarReaders.yaml().getStrict();
const jsonWriters = CedarWriters.json().getStrict();
const yamlWriters = CedarWriters.yaml().getStrict();
const CHILD = 'child';
const GROUP = 'group';

/** The properties the child sits among: the template's, or its element's. */
const parentProperties = (template: any, container: string): any =>
  container === 'template' ? template.properties : template.properties[GROUP].properties;

/** The case's template: its base, with the child wrapped in a list stating its bounds. */
function withBounds(row: Case): JsonNode {
  const template = structuredClone(fixture.bases[row.base]) as any;
  const properties = parentProperties(template, row.container);
  if (row.bounds !== null) {
    properties[CHILD] = { type: 'array', ...row.bounds, items: properties[CHILD] };
  }
  return template;
}

/** What the child's definition says about how many it takes, in the shape a case records. */
function boundsOf(template: any, container: string): Bounds {
  const child = parentProperties(template, container)[CHILD];
  if (child.type !== 'array') return null;
  const bounds: { minItems?: number; maxItems?: number } = {};
  if ('minItems' in child) bounds.minItems = child.minItems;
  if ('maxItems' in child) bounds.maxItems = child.maxItems;
  return bounds;
}

it('pins Java fixture provenance', () => {
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(lock.sha256);
  expect(lock.javaCommit).toMatch(/^[a-f0-9]{40}$/);
  expect(fixture.cases).toHaveLength(lock.caseCount);
  expect(new Set(fixture.cases.map((c) => c.id)).size).toBe(fixture.cases.length);
});

for (const row of fixture.cases) {
  describe(row.id, () => {
    if (row.refused) {
      it('is refused, as Java refuses it', () => {
        expect(() => jsonReaders.getTemplateReader().readFromObject(withBounds(row))).toThrow(/minItems/);
      });
      return;
    }
    it('Java JSON → TS model → JSON is what Java wrote', () => {
      const template = jsonReaders.getTemplateReader().readFromObject(withBounds(row)).template;
      expect(jsonWriters.getTemplateWriter().getAsJsonNode(template)).toEqual(withBounds(row));
    });
    it('the YAML is what Java writes, and reads back to the same bounds', () => {
      const template = jsonReaders.getTemplateReader().readFromObject(withBounds(row)).template;
      expect(YAML.parse(yamlWriters.getTemplateWriter().getAsYamlString(template))).toEqual(YAML.parse(row.yaml!));
      const read = yamlReaders.getTemplateReader().readFromString(row.yaml!).template;
      expect(boundsOf(jsonWriters.getTemplateWriter().getAsJsonNode(read), row.container)).toEqual(row.bounds);
    });
    it('the inflater fills the child as Java does', () => {
      const template = jsonReaders.getTemplateReader().readFromObject(withBounds(row)).template;
      const instance = jsonReaders.getTemplateInstanceReader().readFromObject(structuredClone(fixture.sparseInstance)).instance;
      const inflated = jsonWriters.getTemplateInstanceWriter().getAsJsonNode(InstanceInflater.inflate(instance, template)) as any;
      const slot = row.container === 'template' ? inflated[CHILD] : inflated[GROUP][CHILD];
      if (row.inflatedOccurrences === null) {
        expect(Array.isArray(slot)).toBe(false);
      } else {
        expect(slot).toHaveLength(row.inflatedOccurrences!);
      }
    });
  });
}
