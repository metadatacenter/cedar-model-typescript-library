export interface JsonNode {
  [key: string]: string | number | boolean | object | null | undefined;
}
export class JsonNodeClass {
  [key: string]: string | number | boolean | object | null | undefined;
  static EMPTY: JsonNode = {};
}
