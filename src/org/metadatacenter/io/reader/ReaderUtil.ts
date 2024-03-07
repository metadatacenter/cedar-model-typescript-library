import { JsonNode } from '../../model/cedar/util/types/JsonNode';

export class ReaderUtil {
  public static getString(node: JsonNode, key: string): string | null {
    if (Object.hasOwn(node, key)) {
      return node[key] as string;
    } else {
      return null;
    }
  }

  public static getBoolean(node: JsonNode, key: string): boolean {
    if (Object.hasOwn(node, key)) {
      return node[key] as boolean;
    } else {
      return false;
    }
  }

  static getNumber(node: JsonNode, key: string): number | null {
    if (Object.hasOwn(node, key)) {
      return node[key] as number;
    } else {
      return null;
    }
  }

  public static getNode(node: JsonNode, key: string): JsonNode {
    if (Object.hasOwn(node, key)) {
      return node[key] as JsonNode;
    } else {
      return {};
    }
  }

  public static getStringList(node: JsonNode, key: string): Array<string> {
    if (Object.hasOwn(node, key) && Array.isArray(node[key])) {
      return node[key] as Array<string>;
    } else {
      return [];
    }
  }

  static getStringMap(node: JsonNode, key: string): Map<string, string> {
    if (Object.hasOwn(node, key) && typeof node[key] === 'object' && !Array.isArray(node[key]) && node[key] !== null) {
      const obj = node[key] as JsonNode;
      const entries: [string, string][] = Object.entries(obj as Record<string, string>);
      const map: Map<string, string> = new Map<string, string>();
      for (const [k, v] of entries) {
        map.set(k, v);
      }
      return map;
    } else {
      return new Map();
    }
  }

  public static deepClone(obj: object) {
    return JSON.parse(JSON.stringify(obj));
  }

  public static deepFreeze(object: any) {
    Object.freeze(object);
    Object.getOwnPropertyNames(object).forEach((prop) => {
      if (
        object[prop] !== null &&
        (typeof object[prop] === 'object' || typeof object[prop] === 'function') &&
        !Object.isFrozen(object[prop])
      ) {
        this.deepFreeze(object[prop]);
      }
    });
  }

  public static getNodeList(node: JsonNode, key: string): Array<JsonNode> {
    if (Object.hasOwn(node, key) && Array.isArray(node[key])) {
      return node[key] as Array<JsonNode>;
    } else {
      return [];
    }
  }
}
