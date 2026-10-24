import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonPath } from '../../../model/cedar/util/path/JsonPath';
import { CedarModel } from '../../../model/cedar/constants/CedarModel';
import { BioportalTermTypeJsonValues } from '../../../model/cedar/types/bioportal-types/BioportalTermType';
import { ExactDecimal } from '../../../policy/NumericPolicy';
import { IdentifierPolicy } from '../../../policy/IdentifierPolicy';
import { JsonSourcePolicy } from '../../../policy/JsonSourcePolicy';
import { TextPolicy } from '../../../policy/TextPolicy';
import { ReaderUtil } from '../ReaderUtil';

/** A check of the value one key of a term constraint states. `at` is the path to the constraint. */
type Check = (entry: JsonNode, key: string, at: JsonPath) => void;

const V = CedarModel.ValueConstraints;

/** The value at `key`, or undefined where the node states none. */
const own = (node: JsonNode, key: string): unknown => (Object.hasOwn(node, key) ? node[key] : undefined);

/** Whether `value` is a JSON object, which an array and a number held exactly are not. */
const isObject = (value: unknown): value is JsonNode =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !ExactDecimal.isExact(value);

const shown = (value: unknown): string => JsonSourcePolicy.stringify(value) ?? 'undefined';

const missing = (key: string, at: JsonPath, expected: string): Error =>
  new Error(`Missing ${key} at ${at.add(key).toPointer()}. Expected ${expected}.`);

const invalid = (key: string, value: unknown, at: JsonPath, expected: string): Error =>
  new Error(`Invalid ${key} ${shown(value)} at ${at.add(key).toPointer()}. Expected ${expected}.`);

/** A string the constraint must state, as Java's `readRequiredString` reads one. It may be empty. */
const requiredString: Check = (entry, key, at) => {
  const value = own(entry, key);
  if (value === undefined) throw missing(key, at, 'a string');
  if (typeof value !== 'string') throw invalid(key, value, at, 'a string');
};

/** A string the constraint may state, as Java's `readString` reads one. Null is none. */
const optionalString: Check = (entry, key, at) => {
  const value = own(entry, key);
  if (value !== undefined && value !== null && typeof value !== 'string') throw invalid(key, value, at, 'a string');
};

/** An absolute IRI the constraint must state, as Java's `readRequiredAbsoluteUri` reads one. */
const requiredIdentifier: Check = (entry, key, at) => {
  const value = own(entry, key);
  if (value === undefined) throw missing(key, at, 'an absolute IRI');
  if (typeof value !== 'string' || value === '') throw invalid(key, value, at, 'an absolute IRI');
  IdentifierPolicy.assertIdentifier(value, at.add(key).toPointer());
};

/** An IRI the constraint may state, as Java's `readUri` reads one. Null and the empty string are none. */
const optionalIri: Check = (entry, key, at) => {
  const value = own(entry, key);
  if (value === undefined || value === null || value === '') return;
  if (typeof value !== 'string') throw invalid(key, value, at, 'a URI');
  IdentifierPolicy.assertIri(value, at.add(key).toPointer());
};

const optionalInt: Check = (entry, key, at) => {
  ReaderUtil.getJsonJavaIntOrNull(entry, key, at);
};

const requiredInt: Check = (entry, key, at) => {
  ReaderUtil.getRequiredJsonJavaInt(entry, key, at);
};

/** A class's term type, which Java matches ignoring case. */
const termType: Check = (entry, key, at) => {
  const types: string[] = Object.values(BioportalTermTypeJsonValues);
  const expected = types.join(' or ');
  const value = own(entry, key);
  if (value === undefined) throw missing(key, at, expected);
  if (typeof value !== 'string' || !types.some((type) => TextPolicy.equalsIgnoreCase(type, value))) {
    throw invalid(key, value, at, expected);
  }
};

/**
 * The snapshot a constraint is pinned to. A version that is not an object means the newest, as Java
 * reads it. An object must state a non-empty `id` that is not blank.
 */
const version: Check = (entry, key, at) => {
  const value = own(entry, key);
  if (!isObject(value)) return;
  const versionAt = at.add(key);
  requiredString(value, V.versionId, versionAt);
  const id = value[V.versionId] as string;
  if (id === '') throw invalid(V.versionId, id, versionAt, 'a non-empty string');
  if (TextPolicy.isBlank(id)) throw invalid(V.versionId, id, versionAt, 'a string that is not blank');
  optionalString(value, V.versionEffectiveDate, versionAt);
  optionalString(value, V.versionDeclaredVersion, versionAt);
};

/** The source-explicit keys every kind of constraint may state, in the order Java reads them. */
const SOURCE: ReadonlyArray<[string, Check]> = [
  [V.iri, optionalIri],
  [V.sourceSystem, optionalString],
  [V.version, version],
];

/** Each list of term constraints and the checks of its entries, in the order Java reads them. */
const LISTS: ReadonlyArray<[string, ReadonlyArray<[string, Check]>]> = [
  [
    CedarModel.ontologies,
    [[V.uri, requiredIdentifier], [V.acronym, requiredString], [V.name, requiredString], [V.numTerms, optionalInt], ...SOURCE],
  ],
  [
    CedarModel.valueSets,
    [[V.uri, requiredIdentifier], [V.name, requiredString], [V.vsCollection, requiredString], [V.numTerms, optionalInt], ...SOURCE],
  ],
  [
    CedarModel.classes,
    [
      [V.uri, requiredIdentifier],
      [V.prefLabel, requiredString],
      [V.type, termType],
      [V.label, requiredString],
      [V.source, requiredString],
      ...SOURCE,
    ],
  ],
  [
    CedarModel.branches,
    [
      [V.uri, requiredIdentifier],
      [V.source, requiredString],
      [V.acronym, requiredString],
      [V.name, requiredString],
      [V.maxDepth, requiredInt],
      ...SOURCE,
    ],
  ],
];

/**
 * These checks judge a field's term constraints as the Java JSON reader judges them, on a field of
 * any kind.
 *
 * Java reads `ontologies`, `valueSets`, `classes` and `branches` wherever a field states
 * `_valueConstraints`, whatever kind of field it is, and refuses a malformed entry. Only a
 * controlled-term field keeps them. Every other kind, static and attribute-value fields included,
 * drops them, so its JSON is written without them. The reader of any other kind reads nothing from
 * them, so these checks alone give that kind Java's verdict. The controlled-term reader refuses some
 * malformed entries as it reads them, each with the message it always gave. It asks first that each
 * entry be an object, and applies the whole of these checks after its reads to refuse the rest.
 *
 * A list that is absent, null or not a list states no constraint, as in Java. Each entry must be an
 * object, and must state each key its kind requires.
 */
export abstract class JsonTermConstraintChecks {
  /** Refuse a term constraint Java refuses, naming the key and the path to it. */
  public static assertReadable(fieldSourceObject: JsonNode, path: JsonPath): void {
    JsonTermConstraintChecks.forEachEntry(fieldSourceObject, path, (entry, checks, entryAt) => {
      for (const [key, check] of checks) check(entry, key, entryAt);
    });
  }

  /** Refuse a term constraint that is not an object, naming the path to it. */
  public static assertEntriesAreObjects(fieldSourceObject: JsonNode, path: JsonPath): void {
    JsonTermConstraintChecks.forEachEntry(fieldSourceObject, path, () => undefined);
  }

  /** Visit each term constraint the field states, refusing one that is not an object. */
  private static forEachEntry(
    fieldSourceObject: JsonNode,
    path: JsonPath,
    visit: (entry: JsonNode, checks: ReadonlyArray<[string, Check]>, entryAt: JsonPath) => void,
  ): void {
    const valueConstraints = own(fieldSourceObject, CedarModel.valueConstraints);
    if (!isObject(valueConstraints)) return;
    const at = path.add(CedarModel.valueConstraints);
    for (const [list, checks] of LISTS) {
      const entries = own(valueConstraints, list);
      if (!Array.isArray(entries)) continue;
      entries.forEach((entry: unknown, index: number) => {
        const entryAt = at.add(list, index);
        if (!isObject(entry)) {
          throw new Error(`Invalid ${list} entry ${shown(entry)} at ${entryAt.toPointer()}. Expected an object.`);
        }
        visit(entry, checks, entryAt);
      });
    }
  }
}
