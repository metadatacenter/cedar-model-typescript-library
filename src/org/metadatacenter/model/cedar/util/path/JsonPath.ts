export class JsonPath {
  private readonly path: Array<string | number>;

  constructor(...pathComponents: Array<string | number>) {
    this.path = pathComponents;
  }

  equal(another: JsonPath): boolean {
    if (this.path.length !== another.path.length) return false;
    return this.path.every((component, index) => component === another.path[index]);
  }

  add(...pathComponents: Array<string | number>): JsonPath {
    return new JsonPath(...this.path, ...pathComponents);
  }

  join(another: JsonPath): JsonPath {
    return new JsonPath(...this.path, ...another.path);
  }

  toString(): string {
    let result = '';
    this.path.forEach((component) => {
      if (typeof component === 'number') {
        result += `/[${component}]`;
      } else {
        result += `/${component}`;
      }
    });
    return result + '/';
  }

  toJSON() {
    return this.toString();
  }

  // Add this method to get the last component of the path
  getLastComponent(): string | number | null {
    if (this.path.length === 0) {
      return null;
    }
    return this.path[this.path.length - 1];
  }
}
