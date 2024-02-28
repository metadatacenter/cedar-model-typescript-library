import { Node } from '../model/cedar/types/Node';

export class ReaderUtil {
  public static getString(node: Node, key: string): string | null {
    if (Object.hasOwn(node, key)) {
      return node[key] as string;
    } else {
      return null;
    }
  }

  public static getBoolean(node: Node, key: string): boolean {
    if (Object.hasOwn(node, key)) {
      return node[key] as boolean;
    } else {
      return false;
    }
  }

  public static getNode(node: Node, key: string): Node {
    if (Object.hasOwn(node, key)) {
      return node[key] as Node;
    } else {
      return {};
    }
  }

  public static getStringList(node: Node, key: string): Array<string> {
    if (Object.hasOwn(node, key) && Array.isArray(node[key])) {
      return node[key] as Array<string>;
    } else {
      return [];
    }
  }

  static getStringMap(node: Node, key: string): Map<string, string> {
    if (Object.hasOwn(node, key) && typeof node[key] === 'object' && !Array.isArray(node[key]) && node[key] !== null) {
      const obj = node[key] as Node;
      const entries: [string, string][] = Object.entries(obj as Record<string, string>);
      const map: Map<string, string> = new Map<string, string>();
      for (const [k, v] of entries) {
        if (typeof v === 'string') {
          map.set(k, v);
        }
      }
      return map;
    } else {
      return new Map();
    }
  }
}
