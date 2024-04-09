import { TemplateChild } from '../types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysMultiple } from './ChildDeploymentInfoAlwaysMultiple';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';

export class ChildDeploymentInfoAlwaysMultipleBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public build(): ChildDeploymentInfoAlwaysMultiple {
    const info: ChildDeploymentInfoAlwaysMultiple = new ChildDeploymentInfoAlwaysMultiple(this.name);
    this.setCommonData(info);
    return info;
  }
}
