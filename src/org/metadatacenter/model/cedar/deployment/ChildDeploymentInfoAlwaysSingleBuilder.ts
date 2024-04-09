import { TemplateChild } from '../types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysSingle } from './ChildDeploymentInfoAlwaysSingle';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';

export class ChildDeploymentInfoAlwaysSingleBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public build(): ChildDeploymentInfoAlwaysSingle {
    const info: ChildDeploymentInfoAlwaysSingle = new ChildDeploymentInfoAlwaysSingle(this.name);
    this.setCommonData(info);
    return info;
  }
}
