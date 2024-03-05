export interface Node {
  [key: string]: string | number | boolean | object | null | undefined;
}
export class NodeClass {
  [key: string]: string | number | boolean | object | null | undefined;
  static EMPTY: Node = {};
}
