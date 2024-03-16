import { JsonNode, JsonNodeClass } from '../../model/cedar/types/basic-types/JsonNode';
import { URI } from '../../model/cedar/types/wrapped-types/URI';

export class ReaderUtil {
  public static getString(node: JsonNode, key: string): string | null {
    if (Object.hasOwn(node, key)) {
      return node[key] as string;
    } else {
      return null;
    }
  }

  public static getStringOrEmpty(node: JsonNode, key: string): string {
    if (Object.hasOwn(node, key)) {
      return node[key] as string;
    } else {
      return '';
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

  static getNumberOrZero(node: JsonNode, key: string): number {
    if (Object.hasOwn(node, key)) {
      return node[key] as number;
    } else {
      return 0;
    }
  }

  public static getNode(node: JsonNode, key: string): JsonNode {
    if (Object.hasOwn(node, key)) {
      return node[key] as JsonNode;
    } else {
      return JsonNodeClass.getEmpty();
    }
  }

  public static getNodeOrNull(node: JsonNode, key: string): JsonNode | null {
    if (Object.hasOwn(node, key)) {
      return node[key] as JsonNode;
    } else {
      return null;
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
    //return JSON.parse(JSON.stringify(obj));
    return this.deepUnfreeze(obj);
  }

  public static deepUnfreeze(object: any): any {
    if (object === null || (typeof object !== 'object' && typeof object !== 'function')) {
      return object;
    }

    // Create a shallow clone for array or object
    const clone = Array.isArray(object) ? object.slice() : { ...object };

    Object.getOwnPropertyNames(clone).forEach((prop) => {
      clone[prop] = this.deepUnfreeze(clone[prop]);
    });

    return clone;
  }

  public static deepFreeze<T extends object>(object: T): T {
    Object.freeze(object);
    Object.getOwnPropertyNames(object).forEach((prop) => {
      const propValue = object[prop as keyof T];
      if (propValue !== null && (typeof propValue === 'object' || typeof propValue === 'function') && !Object.isFrozen(propValue)) {
        this.deepFreeze(propValue as T);
      }
    });
    return object;
  }

  public static getNodeList(node: JsonNode, key: string): Array<JsonNode> {
    if (Object.hasOwn(node, key) && Array.isArray(node[key])) {
      return node[key] as Array<JsonNode>;
    } else {
      return JsonNodeClass.getEmptyList();
    }
  }

  static getURI(node: JsonNode, key: string): URI {
    return new URI(this.getStringOrEmpty(node, key));
  }

  static deleteNodeKey(node: JsonNode, key: string) {
    if (Object.hasOwn(node, key)) {
      delete node[key];
    }
  }
}
