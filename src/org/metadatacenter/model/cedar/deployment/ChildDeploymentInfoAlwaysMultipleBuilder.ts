import { NullableNumber } from '../types/basic-types/NullableNumber';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysMultiple } from './ChildDeploymentInfoAlwaysMultiple';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';

export class ChildDeploymentInfoAlwaysMultipleBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  private declaredMinItems: NullableNumber = null;
  private declaredMaxItems: NullableNumber = null;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  /**
   * These fields are multiple by nature, so a template usually leaves the
   * bounds out and the deployment info supplies the default. When one is
   * stated, it has to survive the trip through here — dropping it was how a
   * declared `minItems` got rewritten on the way back out.
   */
  public withMinItems(minItems: NullableNumber): this {
    this.declaredMinItems = minItems;
    return this;
  }

  public withMaxItems(maxItems: NullableNumber): this {
    this.declaredMaxItems = maxItems;
    return this;
  }

  public build(): ChildDeploymentInfoAlwaysMultiple {
    const info: ChildDeploymentInfoAlwaysMultiple = new ChildDeploymentInfoAlwaysMultiple(this.name);
    this.setCommonData(info);
    info.declaredMinItems = this.declaredMinItems;
    info.declaredMaxItems = this.declaredMaxItems;
    return info;
  }
}
