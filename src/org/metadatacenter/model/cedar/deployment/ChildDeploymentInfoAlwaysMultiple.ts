import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysMultiple extends AbstractDynamicChildDeploymentInfo {
  public static empty(): ChildDeploymentInfoAlwaysMultiple {
    return new ChildDeploymentInfoAlwaysMultiple('');
  }

  constructor(name: string) {
    super(name);
  }

  isMultiInAnyWay(): boolean {
    return true;
  }
}
