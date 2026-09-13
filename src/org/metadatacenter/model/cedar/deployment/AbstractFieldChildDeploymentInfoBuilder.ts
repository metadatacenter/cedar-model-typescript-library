import { TemplateChild } from '../types/basic-types/TemplateChild';
import { TemplateField } from '../field/TemplateField';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';
import { AbstractFieldChildDeploymentInfo } from './AbstractFieldChildDeploymentInfo';

/**
 * The builder of a dynamic field's deployment, and the only builder offering
 * `withContinuePreviousLine` and `withValueRecommendationEnabled` — an element child is
 * built by `ChildDeploymentInfoElementBuilder`, which descends from the dynamic builder
 * and so has neither method to call.
 */
export class AbstractFieldChildDeploymentInfoBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  protected hidden: boolean = false;
  protected requiredValue: boolean = false;
  protected recommendedValue: boolean = false;
  protected continuePreviousLine: boolean = false;
  protected valueRecommendationEnabled: boolean = false;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withHidden(hidden: boolean): this {
    this.hidden = hidden;
    return this;
  }

  /**
   * Whether the child's field type keeps a requirement at all.
   *
   * An attribute-value field does not, so the two setters decline it rather than storing something
   * no writer emits — the Java library's `AttributeValueField.Builder` has answered the same way for
   * as long as it has had those methods, by making them no-ops.
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

  protected override setCommonData(info: AbstractDynamicChildDeploymentInfo) {
    super.setCommonData(info);
    if (info instanceof AbstractFieldChildDeploymentInfo) {
      info.hidden = this.hidden;
      info.requiredValue = this.requiredValue;
      info.recommendedValue = this.recommendedValue;
      info.continuePreviousLine = this.continuePreviousLine;
      info.valueRecommendationEnabled = this.valueRecommendationEnabled;
    }
  }
}
