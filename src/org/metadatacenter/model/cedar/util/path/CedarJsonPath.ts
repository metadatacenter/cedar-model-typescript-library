export class CedarJsonPath {
  private readonly path: Array<string | number>;

  constructor(...pathComponents: Array<string | number>) {
    this.path = pathComponents;
  }

  equal(another: CedarJsonPath): boolean {
    if (this.path.length !== another.path.length) return false;
    return this.path.every((component, index) => component === another.path[index]);
  }

  add(...pathComponents: Array<string | number>): CedarJsonPath {
    return new CedarJsonPath(...this.path, ...pathComponents);
  }

  join(another: CedarJsonPath): CedarJsonPath {
    return new CedarJsonPath(...this.path, ...another.path);
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
}
