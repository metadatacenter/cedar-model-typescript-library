import * as fs from 'fs';
import * as path from 'path';
import { CedarReaders, CedarWriters, JsonNode } from '../../../../src';

/**
 * An attribute's property IRI is the server's to assign, and this library does not assign it.
 *
 * A user names an attribute while filling a form, so nothing could have minted an IRI for it earlier:
 * the name did not exist until then. What a draft carries is the attribute's value at the instance root
 * and no `@context` term at all, which is a shape the model permits — an instance's `@context` requires
 * the standard prefixes and the system keys, and no attribute name. The server fills the term on upload.
 *
 * A library that invented one would be asserting an identity nothing assigned, and would do it in the
 * one place a reader cannot tell an invention from a value the document carried. This pins the absence:
 * a term missing on the way in is missing on the way out, and the value it belongs to survives either
 * way. `PropertyIri` mints for an ordinary child that declares no IRI of its own, deriving it from the
 * child's name; an attribute is not that, and nothing should reach for it here.
 */
const CORPUS = path.resolve(__dirname, '../../../../cedar-test-artifacts/artifacts/cee-suite/013/instance-013.json');
const CONTEXT = '@context';

const instance = (): JsonNode => JSON.parse(fs.readFileSync(CORPUS, 'utf8'));

/** Every attribute an attribute-value field names: the field's value is the list of them. */
const attributeNames = (document: JsonNode): string[] =>
  Object.values(document).flatMap((value) =>
    Array.isArray(value) && value.length > 0 && value.every((entry) => typeof entry === 'string') ? (value as string[]) : [],
  );

const roundTrip = (document: JsonNode): JsonNode => {
  const read = CedarReaders.json().getStrict().getTemplateInstanceReader().readFromObject(document).instance;
  return CedarWriters.json().getStrict().getTemplateInstanceWriter().getAsJsonNode(read);
};

describe("an attribute's property IRI", () => {
  test('the corpus instance names attributes, so this tests something', () => {
    expect(attributeNames(instance()).length).toBeGreaterThan(0);
  });

  test('is not invented for an attribute the document gives no term', () => {
    const document = instance();
    const attributes = attributeNames(document);
    attributes.forEach((name) => delete (document[CONTEXT] as JsonNode)[name]);

    const written = roundTrip(document);

    attributes.forEach((name) => {
      expect((written[CONTEXT] as JsonNode)[name]).toBeUndefined();
      expect(written[name]).toBeDefined();
    });
  });

  test('is written back unchanged when the document carries one', () => {
    const document = instance();
    const attributes = attributeNames(document);
    const assigned = Object.fromEntries(attributes.map((name) => [name, (document[CONTEXT] as JsonNode)[name]]));

    const written = roundTrip(document);

    attributes.forEach((name) => {
      expect((written[CONTEXT] as JsonNode)[name]).toBe(assigned[name]);
    });
  });
});
