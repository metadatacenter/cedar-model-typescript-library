export class JsonPath {
  private readonly path: Array<string | number>;

  public static ANY: string = '*';

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

  // noinspection JSUnusedGlobalSymbols
  toJSON() {
    return this.toString();
  }

  getLastComponent(): string | number | null {
    if (this.path.length === 0) {
      return null;
    }
    return this.path[this.path.length - 1];
  }

  endsIn(...pathComponents: Array<string | number>): boolean {
    // console.log(this.toString(), pathComponents);
    for (let i = 1; i <= pathComponents.length; i++) {
      if (i > this.path.length) {
        // console.log('RET FALSE 1');
        return false;
      }
      const pc = pathComponents[pathComponents.length - i];
      // console.log('--> ' + pc);
      if (this.path[this.path.length - i] !== pc && pc != JsonPath.ANY) {
        // console.log('RET FALSE 2');
        return false;
      }
    }
    // console.log('RET TRUE');
    return true;
  }
}
