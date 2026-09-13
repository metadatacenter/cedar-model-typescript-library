import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export class ChildDeploymentInfoStatic extends AbstractChildDeploymentInfo {
  private _hidden: boolean = false;

  public static empty(): ChildDeploymentInfoStatic {
    return new ChildDeploymentInfoStatic('');
  }

  constructor(name: string) {
    super(name);
  }

  override get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
  }

  isMultiInAnyWay(): boolean {
    return false;
  }
}
