export class TestResource {
  private readonly type: string;
  private readonly num: number;

  private constructor(type: string, num: number) {
    this.type = type;
    this.num = num;
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
    return '../../../cedar-test-artifacts/artifacts/' + this.type + 's' + '/' + this.getPadNum();
  }

  private getPadNum() {
    return this.num.toString().padStart(3, '0');
  }

  getFile(suffix: string) {
    return this.type + '-' + this.getPadNum() + suffix;
  }
}
