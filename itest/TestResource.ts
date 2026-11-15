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
    } else if (type === CedarArtifactType.TEMPLATE_INSTANCE) {
      return this.instance(num);
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
    if (this.type == 'cee-suite' || this.type == 'cee-suite-instance') {
      return path.join('cedar-test-artifacts', 'artifacts', 'cee-suite', this.getPadNum());
    }
    return path.join('cedar-test-artifacts', 'artifacts', this.type + 's', this.getPadNum());
  }

  private getPadNum() {
    return this.num.toString().padStart(3, '0');
  }

  getFile(suffix: string) {
    if (this.type == 'cee-suite') {
      return 'template' + '-' + this.getPadNum() + suffix;
    }
    if (this.type == 'cee-suite-instance') {
      return 'instance' + '-' + this.getPadNum() + suffix;
    }
    return this.type + '-' + this.getPadNum() + suffix;
  }

  getInstanceFile(suffix: string) {
    return 'instance' + '-' + this.getPadNum() + suffix;
  }

  static ceeSuite(num: number): TestResource {
    return new TestResource('cee-suite', num);
  }

  /** The instance of a CEE suite case, beside its template in the case's directory. */
  static ceeSuiteInstance(num: number): TestResource {
    return new TestResource('cee-suite-instance', num);
  }

  /** The case identifier the parity scripts and the Java corpus verifiers use: `cee-template-001`. */
  public getCaseId(): string {
    if (this.type == 'cee-suite') return `cee-template-${this.getPadNum()}`;
    if (this.type == 'cee-suite-instance') return `cee-instance-${this.getPadNum()}`;
    return `${this.type}-${this.getPadNum()}`;
  }
}
