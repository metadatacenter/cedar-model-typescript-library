import { NullableString } from '../types/basic-types/NullableString';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';

export class AbstractDynamicChildDeploymentInfoBuilder extends AbstractChildDeploymentInfoBuilder {
  protected iri: NullableString = null;
  protected requiredValue: boolean = false;
  protected hidden: boolean = false;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withIri(iri: NullableString): this {
    this.iri = iri;
    return this;
  }

  public withRequiredValue(requiredValue: boolean): this {
    this.requiredValue = requiredValue;
    return this;
  }

  public withHidden(hidden: boolean): this {
    this.hidden = hidden;
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
    info.requiredValue = this.requiredValue;
    info.hidden = this.hidden;
  }
}
