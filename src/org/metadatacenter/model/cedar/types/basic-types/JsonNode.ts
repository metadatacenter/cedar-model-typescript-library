export interface JsonNode {
  [key: string]: string | number | boolean | object | null | undefined;
}

export abstract class JsonNodeClass {
  [key: string]: string | number | boolean | object | null | undefined;

  static getEmpty(): JsonNode {
    return {};
  }
}
