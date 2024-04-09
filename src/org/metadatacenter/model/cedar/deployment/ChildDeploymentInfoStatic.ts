import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export class ChildDeploymentInfoStatic extends AbstractChildDeploymentInfo {
  public static empty(): ChildDeploymentInfoStatic {
    return new ChildDeploymentInfoStatic('');
  }

  constructor(name: string) {
    super(name);
  }

  isMultiInAnyWay(): boolean {
    return false;
  }
}
