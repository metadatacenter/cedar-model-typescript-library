import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';
import { AbstractFieldChildDeploymentInfo } from './AbstractFieldChildDeploymentInfo';

/**
 * The builder of a dynamic field's deployment, and the only builder offering
 * `withContinuePreviousLine` — an element child is built by
 * `ChildDeploymentInfoElementBuilder`, which descends from the dynamic builder
 * and so has no such method to call.
 */
export class AbstractFieldChildDeploymentInfoBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  protected continuePreviousLine: boolean = false;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withContinuePreviousLine(continuePreviousLine: boolean): this {
    this.continuePreviousLine = continuePreviousLine;
    return this;
  }

  protected override setCommonData(info: AbstractDynamicChildDeploymentInfo) {
    super.setCommonData(info);
    if (info instanceof AbstractFieldChildDeploymentInfo) {
      info.continuePreviousLine = this.continuePreviousLine;
    }
  }
}
