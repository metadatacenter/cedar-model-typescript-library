import { AbstractFieldChildDeploymentInfo } from './AbstractFieldChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysSingle extends AbstractFieldChildDeploymentInfo {
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
