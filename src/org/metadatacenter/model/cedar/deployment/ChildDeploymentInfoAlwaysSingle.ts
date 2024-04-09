import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysSingle extends AbstractChildDeploymentInfo {
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
