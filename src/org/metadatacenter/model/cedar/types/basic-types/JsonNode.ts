export abstract class JsonNode {
  [key: string]: string | number | boolean | object | null | undefined;

  static getEmpty(): JsonNode {
    return {};
  }

  static getEmptyList(): Array<JsonNode> {
    return [];
  }

  static hasEntries(node: JsonNode): boolean {
    return Object.keys(node).length > 0;
  }
}
