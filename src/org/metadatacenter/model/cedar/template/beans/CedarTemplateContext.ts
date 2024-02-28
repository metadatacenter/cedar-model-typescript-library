import { Node } from '../../types/Node';
import { MapOfStringToString } from '../../types/MapOfStringToString';
import { MapOfStringToMapOfStringToString } from '../../types/MapOfStringToMapOfStringToString';

export class CedarTemplateContext {
  private namespaces: MapOfStringToString = new MapOfStringToString();
  private typeDefinitions: MapOfStringToMapOfStringToString = new MapOfStringToMapOfStringToString();

  private constructor() {}

  public static EMPTY = new CedarTemplateContext();

  toJSON() {
    return {
      ...this.namespaces.toJSON(),
      ...this.typeDefinitions.toJSON(),
    };
  }

  static fromNode(node: Node): CedarTemplateContext {
    const r = new CedarTemplateContext();
    Object.entries(node).forEach(([key, value]) => {
      if (typeof value === 'string') {
        r.namespaces.set(key, value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        const valueObj = value as Record<string, string>;
        const typeMap = new MapOfStringToString(Object.entries(valueObj));
        r.typeDefinitions.set(key, typeMap);
      }
    });

    return r;
  }
}
