import { isAlias, isMap, isScalar, isSeq, parseAllDocuments, Scalar } from 'yaml';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonSourcePolicy } from '../../../policy/JsonSourcePolicy';
import { ExactDecimal } from '../../../policy/NumericPolicy';

/** A number or boolean in a YAML mapping: the value, the text it was read from, and whether YAML typed it as an integer. */
interface Spelling {
  value: unknown;
  text: string;
  integer: boolean;
}

/** The source text of each number and boolean a parsed mapping holds, with the value read from it. */
const spellings = new WeakMap<object, Map<string, Spelling>>();

const INT_TAG = 'tag:yaml.org,2002:int';
const INTEGER = /^(?:[-+]?[0-9]+|0o[0-7]+|0x[0-9a-fA-F]+)$/;

/** The record of the value at `key`, while the mapping still holds the value read from its text. */
function spellingOf(mapping: JsonNode, key: string): Spelling | null {
  const spelling = spellings.get(mapping)?.get(key);
  return spelling !== undefined && Object.is(spelling.value, mapping[key]) ? spelling : null;
}

/**
 * The text a number or boolean in a parsed YAML mapping was written as, for a position that holds a
 * literal rather than a number, while the mapping still holds the value read from that text.
 */
export function yamlSpelling(mapping: JsonNode, key: string): string | null {
  return spellingOf(mapping, key)?.text ?? null;
}

/**
 * How the number or boolean at `key` in a parsed YAML mapping was written, or null where the mapping
 * holds no value read from YAML text there. `integer` says whether YAML typed it as an integer. YAML
 * 1.2's core schema types `3`, `-3`, `0o17` and `0x1F` as integers, and `3.0`, `3e0` and `!!float 3`
 * as floats, whatever value each denotes. Java's reader holds an integer only where YAML typed one.
 */
export function yamlNumberSpelling(mapping: JsonNode, key: string): { text: string; integer: boolean } | null {
  const spelling = spellingOf(mapping, key);
  return spelling === null ? null : { text: spelling.text, integer: spelling.integer };
}

/** YAML 1.2 core values with exact numbers, literal mapping keys and bounded, acyclic alias expansion. */
export class YamlSourcePolicy {
  public static parse(source: string): JsonNode {
    const documents = parseAllDocuments(source, { version: '1.2', schema: 'core', uniqueKeys: false });
    if (documents.length !== 1) throw new SyntaxError('Expected one YAML document');
    const document = documents[0];
    if (document.errors.length || document.warnings.length) throw new SyntaxError('Invalid or unsupported YAML syntax');
    const active = new Set<object>();
    let remaining = 1_000_000;
    const allowed = new Set(['str', 'bool', 'null', 'int', 'float', 'seq', 'map'].map((t) => 'tag:yaml.org,2002:' + t));
    function read(node: unknown, depth: number): unknown {
      if (node === null) return null;
      if (!node || typeof node !== 'object' || --remaining < 0 || depth > 50 || active.has(node))
        throw new SyntaxError('YAML alias expansion, nesting limit or cycle');
      active.add(node);
      try {
        if (isAlias(node)) return read(node.resolve(document), depth + 1);
        const tag = 'tag' in node ? (node.tag as string | undefined) : undefined;
        if (tag && !allowed.has(tag)) throw new SyntaxError('Unsupported YAML tag');
        if (isMap(node) && (!tag || tag.endsWith(':map'))) {
          const result: Record<string, unknown> = {};
          for (const pair of node.items) {
            if (!isScalar(pair.key)) throw new SyntaxError('Artifact mapping keys must be scalar strings');
            if (pair.key.tag && !allowed.has(pair.key.tag)) throw new SyntaxError('Unsupported YAML key tag');
            const key = pair.key.source ?? String(pair.key.value ?? '');
            if (Object.hasOwn(result, key)) throw new SyntaxError('Duplicate YAML mapping key');
            const value = read(pair.value, depth + 1);
            Object.defineProperty(result, key, { value, enumerable: true, writable: true, configurable: true });
            const scalar = isAlias(pair.value) ? pair.value.resolve(document) : pair.value;
            if ((typeof value === 'number' || typeof value === 'boolean' || ExactDecimal.isExact(value)) && isScalar(scalar)) {
              const text = scalar.source ?? String(value);
              const integer = typeof value !== 'boolean' && (scalar.tag ? scalar.tag === INT_TAG : INTEGER.test(text));
              const recorded = spellings.get(result) ?? new Map<string, Spelling>();
              spellings.set(result, recorded.set(key, { value, text, integer }));
            }
          }
          return result;
        }
        if (isSeq(node) && (!tag || tag.endsWith(':seq'))) return node.items.map((n) => read(n, depth + 1));
        if (isScalar(node)) {
          const text = node.source ?? '';
          if (tag?.endsWith(':str') || (!tag && node.type !== Scalar.PLAIN)) return text;
          const scalar = tag?.slice('tag:yaml.org,2002:'.length);
          if ((!scalar || scalar === 'null') && /^(?:~|null|Null|NULL|)$/.test(text)) return null;
          if ((!scalar || scalar === 'bool') && /^(?:true|True|TRUE|false|False|FALSE)$/.test(text)) return text.toLowerCase() === 'true';
          if ((!scalar || scalar === 'int') && /^(?:0o[0-7]+|0x[0-9a-fA-F]+)$/.test(text))
            return JsonSourcePolicy.sourceNumber(BigInt(text).toString());
          if ((!scalar || scalar === 'int') && /^[-+]?[0-9]+$/.test(text)) return JsonSourcePolicy.sourceNumber(text);
          if ((!scalar || scalar === 'float') && /^[-+]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][-+]?[0-9]+)?$/.test(text))
            return JsonSourcePolicy.sourceNumber(text);
          if (scalar || /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/.test(text)) throw new SyntaxError('Invalid YAML scalar');
          return text;
        }
        throw new SyntaxError('Unsupported YAML value');
      } finally {
        active.delete(node);
      }
    }
    const result = read(document.contents, 0);
    if (!isMap(document.contents)) throw new SyntaxError('Expected a YAML mapping');
    return result as JsonNode;
  }
}
