import { ExactDecimal, NumericPolicy, NumericValue } from './NumericPolicy';
import { javaPlainDecimal } from '../io/writer/yaml/JavaPlainDecimal';
import { JsonNode } from '../model/cedar/types/basic-types/JsonNode';

/** The text of each number a parsed object holds that was written with a fraction or an exponent. */
const decimalSpellings = new WeakMap<object, Map<string, { value: unknown; text: string }>>();

/** Raw JSON boundary. Duplicate decoded keys and rounded or nonfinite source numbers are never accepted silently. */
export class JsonSourcePolicy {
  /**
   * The text of the number at `key` in a parsed JSON object where it was written with a fraction or an
   * exponent, as `3.0` or `3e0` is, and null otherwise. Java's reader holds such a number as a decimal
   * whatever value it denotes, and holds an integer only where the text wrote one.
   */
  public static decimalSpelling(object: JsonNode, key: string): string | null {
    const spelling = decimalSpellings.get(object)?.get(key);
    return spelling !== undefined && Object.is(spelling.value, object[key]) ? spelling.text : null;
  }

  public static sourceNumber(text: string): NumericValue {
    const value = NumericPolicy.value(text);
    return typeof value === 'number' && NumericPolicy.compare(text, javaPlainDecimal(value)) !== 0 ? ExactDecimal.forValue(text) : value;
  }

  public static parse(source: string): JsonNode {
    let position = 0;
    /** The text of the number token just read, where it has a fraction or an exponent. */
    let decimalText: string | null = null;
    const whitespace = () => {
      while (/[ \t\n\r]/.test(source[position] ?? '\0')) position++;
    };
    const fail = (): never => {
      throw new SyntaxError(`Invalid JSON at position ${position}`);
    };
    function string(): string {
      const start = position++;
      for (;;) {
        if (position >= source.length) return fail();
        const c = source[position++];
        if (c === '"') return JSON.parse(source.slice(start, position)) as string;
        if (c === '\\') position++;
        else if (c.charCodeAt(0) < 32) return fail();
      }
    }
    function value(depth: number): unknown {
      if (depth > 1000) throw new RangeError('JSON nesting limit exceeded');
      whitespace();
      const c = source[position];
      if (c === '"') return string();
      if (c === '{' || c === '[') {
        position++;
        const object: Record<string, unknown> = {};
        const array: unknown[] = [];
        const end = c === '{' ? '}' : ']';
        whitespace();
        if (source[position] !== end)
          for (;;) {
            whitespace();
            if (c === '{') {
              if (source[position] !== '"') return fail();
              const key = string();
              if (Object.hasOwn(object, key)) throw new SyntaxError('Duplicate JSON mapping key');
              whitespace();
              if (source[position++] !== ':') return fail();
              decimalText = null;
              const child = value(depth + 1);
              Object.defineProperty(object, key, { value: child, enumerable: true, writable: true, configurable: true });
              if (decimalText !== null && (typeof child === 'number' || ExactDecimal.isExact(child))) {
                const recorded = decimalSpellings.get(object) ?? new Map<string, { value: unknown; text: string }>();
                decimalSpellings.set(object, recorded.set(key, { value: child, text: decimalText }));
              }
            } else array.push(value(depth + 1));
            whitespace();
            if (source[position] === end) break;
            if (source[position++] !== ',') return fail();
          }
        position++;
        return c === '{' ? object : array;
      }
      for (const [token, result] of [
        ['true', true],
        ['false', false],
        ['null', null],
      ] as const) {
        if (source.startsWith(token, position)) {
          position += token.length;
          return result;
        }
      }
      const number = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(source.slice(position));
      if (!number) return fail();
      if (number[0].length > 1000) throw new RangeError('JSON number length limit exceeded');
      position += number[0].length;
      decimalText = /[.eE]/.test(number[0]) ? number[0] : null;
      return JsonSourcePolicy.sourceNumber(number[0]);
    }
    const result = value(0);
    whitespace();
    if (position !== source.length) fail();
    if (result === null || typeof result !== 'object' || Array.isArray(result) || result instanceof ExactDecimal)
      throw new SyntaxError('Expected a JSON object');
    return result as JsonNode;
  }

  /** Own a JSON tree while preserving exact numeric atoms across independent bundles. */
  public static clone<T>(source: T): T {
    const active = new Set<object>();
    function copy(value: unknown): unknown {
      if (ExactDecimal.isExact(value)) return ExactDecimal.forValue(String(value));
      if (value === null || value === undefined || typeof value === 'string' || typeof value === 'boolean') return value;
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value !== 'object' || active.has(value)) throw new TypeError('Expected acyclic JSON data');
      active.add(value);
      try {
        if (Array.isArray(value)) return value.map(copy);
        if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
          throw new TypeError('Expected a JSON object');
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, copy(child)]));
      } finally {
        active.delete(value);
      }
    }
    return copy(source) as T;
  }

  /** Exact numeric tokens on every supported browser, without depending on JSON.rawJSON. */
  public static stringify(value: unknown, indent = 0): string {
    const gap = ' '.repeat(Math.max(0, Math.min(10, indent)));
    const active = new Set<object>();
    function write(value: unknown, depth: number): string | undefined {
      if (ExactDecimal.isExact(value)) return value.toString();
      if (typeof value === 'number') return javaPlainDecimal(value);
      if (typeof value === 'string' || typeof value === 'boolean' || value === null) return JSON.stringify(value);
      if (typeof value === 'undefined') return undefined;
      if (typeof value !== 'object') throw new TypeError('Expected a JSON value');
      if (depth > 1000 || active.has(value)) throw new TypeError('Cyclic JSON value or nesting limit exceeded');
      active.add(value);
      try {
        const list = Array.isArray(value);
        const items: string[] = [];
        if (list) for (const child of value) items.push(write(child, depth + 1) ?? 'null');
        else
          for (const key of Object.keys(value)) {
            const child = write((value as Record<string, unknown>)[key], depth + 1);
            if (child !== undefined) items.push(JSON.stringify(key) + (gap ? ': ' : ':') + child);
          }
        const [open, close] = list ? ['[', ']'] : ['{', '}'];
        return !items.length
          ? open + close
          : gap
            ? open + '\n' + gap.repeat(depth + 1) + items.join(',\n' + gap.repeat(depth + 1)) + '\n' + gap.repeat(depth) + close
            : open + items.join(',') + close;
      } finally {
        active.delete(value);
      }
    }
    const result = write(value, 0);
    if (result === undefined) throw new TypeError('Expected a JSON value');
    return result;
  }
}
