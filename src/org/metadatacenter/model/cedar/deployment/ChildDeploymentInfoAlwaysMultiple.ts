import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export class ChildDeploymentInfoAlwaysMultiple extends AbstractChildDeploymentInfo {
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
