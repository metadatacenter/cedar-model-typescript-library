import { isDeepStrictEqual } from 'node:util';
import { YamlValues } from '../../src/org/metadatacenter/model/cedar/constants/YamlValues';

/**
 * Compares the JSON this library writes straight from an artifact with the JSON it writes after the
 * artifact has been through its own YAML, and sorts every difference into a known family or none.
 *
 * The YAML reader reference tests compare YAML with YAML, and the JSON gates compare JSON with JSON,
 * so a reader and a writer that agree on a wrong reading of an absent key pass them all. Writing JSON
 * from both paths and comparing it is what exposes such a reading.
 */

/**
 * The differences the YAML form is known to produce. A difference outside them is a defect.
 *
 * - `schemaText`: YAML does not carry a schema artifact's JSON Schema `title` and `description`, so
 *   the trip regenerates them.
 * - `ontologyAddress`: YAML identifies a BioPortal ontology by its acronym, and the reader rebuilds
 *   the address as `https://data.bioontology.org/ontologies/<acronym>`.
 * - `uiEntryFilled`: YAML has no place for an absent `_ui.propertyLabels` or
 *   `_ui.propertyDescriptions` entry, so the trip fills it from the child's own label or description.
 * - `instanceCompletion`: a YAML instance states neither an empty value nor a property IRI, and the
 *   instance is completed against its template on the way back. Empty content is dropped, or
 *   re-added where the stored instance omitted a child, an empty value takes its datatype from the
 *   template, and every `@context` property IRI is the template's. An element instance holding
 *   nothing but an identifier loses the identifier, since the element itself is dropped.
 * - `numberSpelling`: YAML writes a number in its shortest spelling, so a number can come back with
 *   the same value written another way: a decimal bound stored as `5.0` comes back as `5`. The two
 *   are equal as decimals. A JavaScript number keeps no spelling, so this library writes `5.0` as
 *   `5` on both paths and its own trip does not show the family. Java's does.
 */
export type TripFamily = 'schemaText' | 'ontologyAddress' | 'uiEntryFilled' | 'instanceCompletion' | 'numberSpelling';

export interface TripDifference {
  path: string;
  direct: unknown;
  viaYaml: unknown;
  family: TripFamily | null;
}

type JsonObject = Record<string, unknown>;
type Segment = string | number;

const isObject = (value: unknown): value is JsonObject => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number';
const keysOf = (a: JsonObject, b: JsonObject): string[] => [...new Set([...Object.keys(a), ...Object.keys(b)])];
const pointer = (segments: Segment[]): string => segments.map((s) => '/' + String(s).replace(/~/g, '~0').replace(/\//g, '~1')).join('');
const endsWith = (segments: Segment[], tail: Segment[]): boolean =>
  segments.length >= tail.length && tail.every((s, i) => s === '*' || s === segments[segments.length - tail.length + i]);

/** A literal value with no `@value`, or an IRI value with nothing in it. */
export const isEmptyValue = (value: unknown): boolean =>
  isObject(value) &&
  (Object.keys(value).length === 0 ||
    (value['@value'] === null && Object.keys(value).every((key) => key === '@value' || key === '@type' || key === '@language')));

// An element instance holds children by name. A value holds only JSON-LD keywords and prefixed terms.
const isElementInstance = (value: JsonObject): boolean =>
  '@context' in value || Object.keys(value).some((key) => !key.startsWith('@') && !key.includes(':'));

// Every child is empty. An attribute-value field lists its attributes' names, and counts as empty when
// every attribute it names is.
const holdsNothing = (element: JsonObject): boolean =>
  Object.entries(element).every(([key, child]) => {
    if (key === '@context' || key === '@id') return true;
    if (Array.isArray(child) && child.length > 0 && child.every(isString)) return child.every((name) => isEmptyContent(element[name]));
    return isEmptyContent(child);
  });

/**
 * What completion can drop or re-add: an empty value, a list of them (none included), or an element
 * instance with no identifier whose children are all empty in turn.
 */
export const isEmptyContent = (value: unknown): boolean => {
  if (isEmptyValue(value)) return true;
  if (Array.isArray(value)) return value.every(isEmptyContent);
  return isObject(value) && isElementInstance(value) && (value['@id'] === undefined || value['@id'] === null) && holdsNothing(value);
};

export function compareSchemaTrip(direct: unknown, viaYaml: unknown): TripDifference[] {
  const out: TripDifference[] = [];
  walkSchema(direct, viaYaml, [], out);
  return out;
}

export function compareInstanceTrip(direct: unknown, viaYaml: unknown): TripDifference[] {
  const out: TripDifference[] = [];
  walkInstance(direct, viaYaml, [], out);
  return out;
}

function record(out: TripDifference[], at: Segment[], direct: unknown, viaYaml: unknown, family: TripFamily | null) {
  out.push({ path: pointer(at), direct, viaYaml, family });
}

function schemaFamily(parent: JsonObject, at: Segment[], direct: unknown, viaYaml: unknown): TripFamily | null {
  const key = at[at.length - 1];
  if ('$schema' in parent && (key === 'title' || key === 'description') && isString(direct) && isString(viaYaml)) {
    return 'schemaText';
  }
  if (endsWith(at, ['_ui', 'propertyLabels', '*']) || endsWith(at, ['_ui', 'propertyDescriptions', '*'])) {
    return direct === undefined && isString(viaYaml) ? 'uiEntryFilled' : null;
  }
  if (endsWith(at, ['_valueConstraints', 'ontologies', '*', 'uri']) && isString(direct) && isString(viaYaml)) {
    const acronym = YamlValues.Controlled.bioPortalOntologyAddress.exec(direct)?.[1];
    return acronym !== undefined && viaYaml === `https://data.bioontology.org/ontologies/${acronym}` ? 'ontologyAddress' : null;
  }
  return null;
}

function walkSchema(direct: unknown, viaYaml: unknown, at: Segment[], out: TripDifference[]) {
  if (isDeepStrictEqual(direct, viaYaml)) return;
  if (isObject(direct) && isObject(viaYaml)) {
    for (const key of keysOf(direct, viaYaml)) {
      const here = [...at, key];
      if (isDeepStrictEqual(direct[key], viaYaml[key])) continue;
      const family = schemaFamily(direct, here, direct[key], viaYaml[key]);
      if (family) record(out, here, direct[key], viaYaml[key], family);
      else walkSchema(direct[key], viaYaml[key], here, out);
    }
    return;
  }
  if (Array.isArray(direct) && Array.isArray(viaYaml) && direct.length === viaYaml.length) {
    direct.forEach((item, i) => walkSchema(item, viaYaml[i], [...at, i], out));
    return;
  }
  record(out, at, direct, viaYaml, valueFamily(direct, viaYaml));
}

// Two values the walk cannot descend into, which differ as JSON.
function valueFamily(direct: unknown, viaYaml: unknown): TripFamily | null {
  return isNumber(direct) && isNumber(viaYaml) && direct === viaYaml ? 'numberSpelling' : null;
}

function walkInstance(direct: unknown, viaYaml: unknown, at: Segment[], out: TripDifference[]) {
  if (isDeepStrictEqual(direct, viaYaml)) return;
  if (isObject(direct) && isObject(viaYaml)) {
    for (const key of keysOf(direct, viaYaml)) {
      const here = [...at, key];
      const [x, y] = [direct[key], viaYaml[key]];
      if (isDeepStrictEqual(x, y)) continue;
      if (key === '@context' && isObject(x) && isObject(y)) {
        compareContext(direct, viaYaml, x, y, here, out);
      } else if ((x === undefined || isEmptyContent(x)) && (y === undefined || isEmptyContent(y))) {
        record(out, here, x, y, 'instanceCompletion');
      } else if (key === '@id' && y === null && isElementInstance(direct) && holdsNothing(direct) && holdsNothing(viaYaml)) {
        // An element holding nothing is dropped with its identifier, and completion re-adds it without one.
        record(out, here, x, y, 'instanceCompletion');
      } else if (Array.isArray(x) && Array.isArray(y) && x.length > 0 && x.every(isString) && y.every(isString)) {
        compareAttributeNames(direct, x, y, here, out);
      } else {
        walkInstance(x, y, here, out);
      }
    }
    return;
  }
  if (Array.isArray(direct) && Array.isArray(viaYaml)) {
    const emptyAt = (values: unknown[]) => values.flatMap((value, i) => (isEmptyContent(value) ? [i] : []));
    const [empties, emptiesViaYaml] = [emptyAt(direct), emptyAt(viaYaml)];
    if (!isDeepStrictEqual(empties, emptiesViaYaml) || empties.some((i) => !isDeepStrictEqual(direct[i], viaYaml[i]))) {
      record(out, at, `empty at ${JSON.stringify(empties)}`, `empty at ${JSON.stringify(emptiesViaYaml)}`, 'instanceCompletion');
    }
    const [kept, keptViaYaml] = [direct.filter((v) => !isEmptyContent(v)), viaYaml.filter((v) => !isEmptyContent(v))];
    if (kept.length !== keptViaYaml.length) {
      record(out, at, direct, viaYaml, null);
      return;
    }
    kept.forEach((item, i) => walkInstance(item, keptViaYaml[i], [...at, i], out));
    return;
  }
  record(out, at, direct, viaYaml, valueFamily(direct, viaYaml));
}

// A property's IRI is the template's on the YAML path. Any other `@context` entry has to survive.
function compareContext(
  container: JsonObject,
  containerViaYaml: JsonObject,
  context: JsonObject,
  contextViaYaml: JsonObject,
  at: Segment[],
  out: TripDifference[],
) {
  for (const key of keysOf(context, contextViaYaml)) {
    const [x, y] = [context[key], contextViaYaml[key]];
    if (isDeepStrictEqual(x, y)) continue;
    const property = (key in container || key in containerViaYaml) && (x === undefined || isString(x)) && (y === undefined || isString(y));
    record(out, [...at, key], x, y, property ? 'instanceCompletion' : null);
  }
}

// An attribute-value field lists the names of its attributes. One whose value is empty is dropped.
function compareAttributeNames(container: JsonObject, names: string[], namesViaYaml: string[], at: Segment[], out: TripDifference[]) {
  const dropped = names.filter((name) => !namesViaYaml.includes(name));
  const onlyEmptiesDropped =
    dropped.every((name) => isEmptyValue(container[name])) &&
    isDeepStrictEqual(
      names.filter((name) => !dropped.includes(name)),
      namesViaYaml,
    );
  record(out, at, names, namesViaYaml, onlyEmptiesDropped ? 'instanceCompletion' : null);
}
