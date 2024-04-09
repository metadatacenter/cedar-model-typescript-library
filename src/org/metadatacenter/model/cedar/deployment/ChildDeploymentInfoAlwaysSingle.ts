import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysSingle extends AbstractDynamicChildDeploymentInfo {
  public static empty(): ChildDeploymentInfoAlwaysSingle {
    return new ChildDeploymentInfoAlwaysSingle('');
  }

  constructor(name: string) {
    super(name);
  }

  isMultiInAnyWay(): boolean {
    return false;
  }
}
