import { JsonNode } from './types/basic-types/JsonNode';

const reserved = new Set(['xsd', 'pav', 'bibo', 'oslc', 'schema', 'skos', 'rdfs', '_annotations']);
function isPrefix(key: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) && !reserved.has(key);
}
function isObject(value: unknown): value is JsonNode {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function ordered<T>(value: T): T {
  if (Array.isArray(value)) return value.map(ordered) as T;
  if (isObject(value))
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, ordered(value[key])]),
    ) as T;
  return value;
}

/** Namespace-bound metadata on the schema itself, independent of instance context constraints. */
export class SchemaExtensions {
  private readonly namespaces: Record<string, string>;
  private readonly values: JsonNode;

  constructor(prefixes: Record<string, string> = {}, properties: JsonNode = {}) {
    for (const [key, iri] of Object.entries(prefixes)) {
      if (!isPrefix(key) || typeof iri !== 'string' || !/^[A-Za-z][A-Za-z0-9+.-]*:[^\s]*$/.test(iri)) {
        throw new Error(`Invalid schema extension prefix: ${key}`);
      }
    }
    for (const key of Object.keys(properties)) {
      const colon = key.indexOf(':');
      if (colon < 1 || colon === key.length - 1 || !Object.hasOwn(prefixes, key.slice(0, colon))) {
        throw new Error(`Unbound schema extension property: ${key}`);
      }
    }
    this.namespaces = ordered(prefixes);
    this.values = ordered(properties);
  }

  get prefixes(): Record<string, string> {
    return { ...this.namespaces };
  }
  get properties(): JsonNode {
    return ordered(this.values);
  }
  get isEmpty(): boolean {
    return Object.keys(this.namespaces).length === 0 && Object.keys(this.values).length === 0;
  }

  static fromJson(source: JsonNode): SchemaExtensions {
    const context = isObject(source['@context']) ? source['@context'] : {};
    const prefixes = Object.fromEntries(
      Object.entries(context).filter(([key, value]) => isPrefix(key) && typeof value === 'string'),
    ) as Record<string, string>;
    const properties = Object.fromEntries(
      Object.entries(source).filter(([key]) => {
        const colon = key.indexOf(':');
        return colon > 0 && Object.hasOwn(prefixes, key.slice(0, colon));
      }),
    );
    return new SchemaExtensions(prefixes, properties);
  }

  static fromYaml(source: JsonNode): SchemaExtensions {
    if (!Object.hasOwn(source, 'extensions')) return new SchemaExtensions();
    const block = source.extensions;
    if (!isObject(block) || Object.keys(block).length !== 2 || !isObject(block.prefixes) || !isObject(block.properties)) {
      throw new Error('extensions requires prefixes and properties objects');
    }
    return new SchemaExtensions(block.prefixes as Record<string, string>, block.properties);
  }

  applyJson(rendering: JsonNode): JsonNode {
    rendering['@context'] = { ...(rendering['@context'] as JsonNode), ...this.prefixes };
    Object.assign(rendering, this.properties);
    return rendering;
  }

  applyYaml(rendering: JsonNode): JsonNode {
    if (!this.isEmpty) rendering.extensions = { prefixes: this.prefixes, properties: this.properties };
    return rendering;
  }
}
