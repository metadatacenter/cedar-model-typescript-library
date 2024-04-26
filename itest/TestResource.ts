import * as path from 'path';
import { CedarArtifactType } from '../src';

export class TestResource {
  private readonly type: string;
  private readonly num: number;

  private constructor(type: string, num: number) {
    this.type = type;
    this.num = num;
  }

  public static artifact(num: number, type: CedarArtifactType): TestResource {
    if (type === CedarArtifactType.TEMPLATE) {
      return this.template(num);
    } else if (type === CedarArtifactType.TEMPLATE_ELEMENT) {
      return this.element(num);
    } else if (type === CedarArtifactType.TEMPLATE_FIELD) {
      return this.field(num);
    } else {
      throw new Error(`Unknown artifact type:${type}`);
    }
  }

  public static template(num: number): TestResource {
    return new TestResource('template', num);
  }

  static field(num: number): TestResource {
    return new TestResource('field', num);
  }

  static element(num: number): TestResource {
    return new TestResource('element', num);
  }

  static instance(num: number): TestResource {
    return new TestResource('instance', num);
  }

  public toString(): string {
    return ' - ' + this.type + '-' + this.num;
  }

  public getDirectory() {
    return path.join(process.env.CEDAR_HOME || '', this.getDirectoryFromCedarHomeRoot());
  }

  public getDirectoryFromCedarHomeRoot() {
    return path.join('cedar-test-artifacts', 'artifacts', this.type + 's', this.getPadNum());
  }

  private getPadNum() {
    return this.num.toString().padStart(3, '0');
  }

  getFile(suffix: string) {
    return this.type + '-' + this.getPadNum() + suffix;
  }
}
