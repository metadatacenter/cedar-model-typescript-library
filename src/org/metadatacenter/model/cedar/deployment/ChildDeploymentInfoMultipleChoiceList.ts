import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export class ChildDeploymentInfoMultipleChoiceList extends AbstractChildDeploymentInfo {
  public static empty(): ChildDeploymentInfoMultipleChoiceList {
    return new ChildDeploymentInfoMultipleChoiceList('');
  }

  constructor(name: string) {
    super(name);
  }

  isMultiInAnyWay(): boolean {
    return true;
  }
}
