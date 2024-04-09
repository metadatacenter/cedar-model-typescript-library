import { TemplateChild } from '../types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysMultiple } from './ChildDeploymentInfoAlwaysMultiple';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';

export class ChildDeploymentInfoAlwaysMultipleBuilder extends AbstractChildDeploymentInfoBuilder {
  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public build(): ChildDeploymentInfoAlwaysMultiple {
    const info: ChildDeploymentInfoAlwaysMultiple = new ChildDeploymentInfoAlwaysMultiple(this.name);
    this.setCommonData(info);
    return info;
  }
}
