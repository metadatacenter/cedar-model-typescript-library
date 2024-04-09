import { TemplateChild } from '../types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysSingle } from './ChildDeploymentInfoAlwaysSingle';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';

export class ChildDeploymentInfoAlwaysSingleBuilder extends AbstractChildDeploymentInfoBuilder {
  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public build(): ChildDeploymentInfoAlwaysSingle {
    const info: ChildDeploymentInfoAlwaysSingle = new ChildDeploymentInfoAlwaysSingle(this.name);
    this.setCommonData(info);
    return info;
  }
}
