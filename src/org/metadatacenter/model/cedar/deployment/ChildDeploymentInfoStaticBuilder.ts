import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';
import { ChildDeploymentInfoStatic } from './ChildDeploymentInfoStatic';

export class ChildDeploymentInfoStaticBuilder extends AbstractChildDeploymentInfoBuilder {
  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public build(): ChildDeploymentInfoStatic {
    const info: ChildDeploymentInfoStatic = new ChildDeploymentInfoStatic(this.name);
    super.setCommonData(info);
    return info;
  }

  // protected setCommonData(info: AbstractDynamicChildDeploymentInfo) {
  //   super.setCommonData(info);
  //   info.label = this.label;
  //   info.description = this.description;
  //   info.iri = this.iri;
  //   info.requiredValue = this.requiredValue;
  //   info.hidden = this.hidden;
  // }
}
