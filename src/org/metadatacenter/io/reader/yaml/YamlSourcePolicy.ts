import { isAlias, isMap, isScalar, isSeq, parseAllDocuments, Scalar } from 'yaml';
import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { JsonSourcePolicy } from '../../../policy/JsonSourcePolicy';

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
            Object.defineProperty(result, key, {
              value: read(pair.value, depth + 1),
              enumerable: true,
              writable: true,
              configurable: true,
            });
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
