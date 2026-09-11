import { NullableString } from '../types/basic-types/NullableString';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { AbstractChildDeploymentInfoBuilder } from './AbstractChildDeploymentInfoBuilder';
import { TemplateField } from '../field/TemplateField';

export class AbstractDynamicChildDeploymentInfoBuilder extends AbstractChildDeploymentInfoBuilder {
  protected iri: NullableString = null;
  protected requiredValue: boolean = false;
  protected recommendedValue: boolean = false;
  protected continuePreviousLine: boolean = false;
  protected valueRecommendationEnabled: boolean = false;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withIri(iri: NullableString): this {
    this.iri = iri;
    return this;
  }

  /**
   * Whether the child's field type keeps a requirement at all.
   *
   * An attribute-value field does not, so the two setters below decline it rather
   * than storing something no writer emits — the Java library's
   * `AttributeValueField.Builder` has answered the same way for as long as it has
   * had those methods, by making them no-ops.
   */
  private get recordsRequirement(): boolean {
    return !(this.child instanceof TemplateField) || this.child.cedarFieldType.recordsRequirement;
  }

  public withRequiredValue(requiredValue: boolean): this {
    if (this.recordsRequirement) {
      this.requiredValue = requiredValue;
    }
    return this;
  }

  public withRecommendedValue(recommendedValue: boolean): this {
    if (this.recordsRequirement) {
      this.recommendedValue = recommendedValue;
    }
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
    info.continuePreviousLine = this.continuePreviousLine;
    info.valueRecommendationEnabled = this.valueRecommendationEnabled;
  }
}
