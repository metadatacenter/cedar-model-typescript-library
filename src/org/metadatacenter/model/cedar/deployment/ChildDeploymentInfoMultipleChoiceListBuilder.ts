import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';
import { ChildDeploymentInfoMultipleChoiceList } from './ChildDeploymentInfoMultipleChoiceList';

export class ChildDeploymentInfoMultipleChoiceListBuilder extends AbstractChildDeploymentInfoBuilder {
  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public build(): ChildDeploymentInfoMultipleChoiceList {
    const info: ChildDeploymentInfoMultipleChoiceList = new ChildDeploymentInfoMultipleChoiceList(this.name);
    this.setCommonData(info);
    return info;
  }
}
