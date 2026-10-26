import { JsonNode } from '../../../model/cedar/types/basic-types/JsonNode';
import { YamlKeys } from '../../../model/cedar/constants/YamlKeys';
import { carryYamlSpellings } from './YamlSourcePolicy';

/**
 * Which keys of a YAML document the reader used, so that a key it never used is refused rather than
 * silently dropped, as the Java library's reader refuses it.
 *
 * A YAML author who misspells a key, `descripton:` for `description:`, would otherwise see the
 * document accepted and the value gone, where the same mistake in JSON is refused with its path. The
 * document is copied, and each mapping of the copy records the keys the reader asks for, whether or
 * not the mapping holds them. A mapping whose keys the reader iterates, such as `children`,
 * annotations or an attribute-value group, has all its keys counted as used, since those keys are
 * names the document chooses. After the read, the first key nothing used is reported with its path.
 */

/** The keys the reader asked for, by the mapping of the copy that was asked. */
const asked = new WeakMap<object, Set<string>>();

/** The mapping of the copy behind each mapping the reader is given. */
const targets = new WeakMap<object, Record<string, unknown>>();

let paused = 0;

/** The names a type check asks of any object, which no YAML key of an artifact has. */
const PROBES: ReadonlySet<string> = new Set(['cedarExactDecimal', 'toJSON']);

function mark(target: Record<string, unknown>, key: string | symbol): void {
  if (paused === 0 && typeof key === 'string' && !PROBES.has(key)) {
    asked.get(target)?.add(key);
  }
}

const handler: ProxyHandler<Record<string, unknown>> = {
  get(target, key, receiver) {
    mark(target, key);
    return Reflect.get(target, key, receiver);
  },
  has(target, key) {
    mark(target, key);
    return Reflect.has(target, key);
  },
  getOwnPropertyDescriptor(target, key) {
    mark(target, key);
    return Reflect.getOwnPropertyDescriptor(target, key);
  },
  ownKeys(target) {
    Object.keys(target).forEach((key) => mark(target, key));
    return Reflect.ownKeys(target);
  },
};

/** A YAML mapping as the source policy reads one: a plain object, not a list or an exact number. */
function isPlainMapping(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function copy(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(copy);
  }
  if (!isPlainMapping(value)) {
    return value;
  }
  const target: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    Object.defineProperty(target, key, { value: copy(entry), enumerable: true, writable: true, configurable: true });
  }
  asked.set(target, new Set());
  const proxy = new Proxy(target, handler);
  targets.set(proxy, target);
  carryYamlSpellings(value, proxy);
  return proxy;
}

export class YamlKeyTracking {
  /** Whether `node` is part of a document whose read is already counting its keys. */
  public static isTracked(node: unknown): boolean {
    return typeof node === 'object' && node !== null && targets.has(node);
  }

  /**
   * Read `source` and refuse a key the read did not use. A mapping already being counted is part of a
   * document read from further up, which checks it once that read is done, so it is read as it is.
   */
  public static read<T>(source: JsonNode, path: string, read: (tracked: JsonNode) => T): T {
    if (YamlKeyTracking.isTracked(source) || !isPlainMapping(source)) {
      return read(source);
    }
    const tracked = copy(source) as JsonNode;
    const result = read(tracked);
    YamlKeyTracking.requireUsed(tracked, path);
    return result;
  }

  /**
   * A copy of `source` whose mappings count the keys read from them, for a test that reads it and then
   * asks which keys were read. A reader given the copy reads it as part of a document already counted,
   * so it refuses no key itself.
   */
  public static track(source: JsonNode): JsonNode {
    return YamlKeyTracking.isTracked(source) ? source : (copy(source) as JsonNode);
  }

  /** Run `work` without counting the keys it reads, for a walk that checks values rather than reading them. */
  public static untracked<T>(work: () => T): T {
    paused++;
    try {
      return work();
    } finally {
      paused--;
    }
  }

  /** Count `key` of `node` as used, for a reader that inspects a mapping without asking for that key. */
  public static use(node: unknown, key: string): void {
    const target = typeof node === 'object' && node !== null ? targets.get(node) : undefined;
    if (target !== undefined) {
      asked.get(target)?.add(key);
    }
  }

  /**
   * The keys asked for in each mapping of a document read with tracking, by its JSON Pointer in the
   * document. The parity test compares them with the Java library's.
   */
  public static askedKeys(root: unknown): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    const walk = (node: unknown, pointer: string): void => {
      if (Array.isArray(node)) {
        node.forEach((entry, index) => walk(entry, `${pointer}/${index}`));
        return;
      }
      const target = typeof node === 'object' && node !== null ? targets.get(node) : undefined;
      if (target === undefined) {
        return;
      }
      result[pointer] = [...(asked.get(target) ?? [])].sort();
      Object.keys(target).forEach((key) => walk(target[key], `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`));
    };
    walk(root, '');
    return result;
  }

  /**
   * Refuse the first key of `node` that the reader did not use. Paths follow the reader's own: a
   * schema artifact's child is under `children` by its key, and a list entry adds its index.
   */
  private static requireUsed(node: unknown, path: string): void {
    if (Array.isArray(node)) {
      node.forEach((entry, index) => YamlKeyTracking.requireUsed(entry, `${path}[${index}]`));
      return;
    }
    const target = typeof node === 'object' && node !== null ? targets.get(node) : undefined;
    if (target === undefined) {
      return;
    }
    const used = asked.get(target) ?? new Set<string>();
    for (const key of Object.keys(target)) {
      if (!used.has(key)) {
        throw new Error(`Unknown key "${key}" at ${path}/${key}; it is not part of this artifact's YAML form.`);
      }
      const value = target[key];
      if (key === YamlKeys.children && Array.isArray(value)) {
        value.forEach((child, index) => {
          const name = typeof child === 'object' && child !== null ? targets.get(child)?.[YamlKeys.key] : undefined;
          YamlKeyTracking.requireUsed(child, typeof name === 'string' ? `${path}/${key}/${name}` : `${path}/${key}[${index}]`);
        });
      } else {
        YamlKeyTracking.requireUsed(value, `${path}/${key}`);
      }
    }
  }
}
