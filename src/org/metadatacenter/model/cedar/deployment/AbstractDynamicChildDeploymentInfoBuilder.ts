import { NullableString } from '../types/basic-types/NullableString';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';

export class AbstractDynamicChildDeploymentInfoBuilder extends AbstractChildDeploymentInfoBuilder {
  protected iri: NullableString = null;
  protected requiredValue: boolean = false;
  protected recommendedValue: boolean = false;
  protected hidden: boolean = false;
  protected continuePreviousLine: boolean = false;
  protected valueRecommendationEnabled: boolean = false;

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

  public withRecommendedValue(recommendedValue: boolean): this {
    this.recommendedValue = recommendedValue;
    return this;
  }

  public withHidden(hidden: boolean): this {
    this.hidden = hidden;
    return this;
  }

  public withContinuePreviousLine(continuePreviousLine: boolean): this {
    this.continuePreviousLine = continuePreviousLine;
    return this;
  }
  public withValueRecommendationEnabled(enabled: boolean): this {
    this.valueRecommendationEnabled = enabled;
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
    info.recommendedValue = this.recommendedValue;
    info.hidden = this.hidden;
    info.continuePreviousLine = this.continuePreviousLine;
    info.valueRecommendationEnabled = this.valueRecommendationEnabled;
  }
}
