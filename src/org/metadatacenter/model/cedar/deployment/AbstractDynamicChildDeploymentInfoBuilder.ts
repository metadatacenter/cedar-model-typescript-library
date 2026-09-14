import { NullableString } from '../types/basic-types/NullableString';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';

export class AbstractDynamicChildDeploymentInfoBuilder extends AbstractChildDeploymentInfoBuilder {
  protected iri: NullableString = null;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withIri(iri: NullableString): this {
    this.iri = iri;
    return this;
  }

  public build(): AbstractDynamicChildDeploymentInfo {
    const info: ChildDeploymentInfo = new ChildDeploymentInfo(this.name);
    this.setCommonData(info);
    return info;
  }

  protected setCommonData(info: AbstractDynamicChildDeploymentInfo) {
    super.setCommonData(info);
    info.iri = this.iri;
  }
}
