import { assertItemBounds } from './ItemBounds';
import { NullableNumber } from '../types/basic-types/NullableNumber';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { ChildDeploymentInfoAlwaysMultiple } from './ChildDeploymentInfoAlwaysMultiple';
import { AbstractFieldChildDeploymentInfoBuilder } from './AbstractFieldChildDeploymentInfoBuilder';
import { TemplateField } from '../field/TemplateField';
import { CedarFieldType } from '../types/cedar-types/CedarFieldType';

export class ChildDeploymentInfoAlwaysMultipleBuilder extends AbstractFieldChildDeploymentInfoBuilder {
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
    assertItemBounds(this.name, this.declaredMinItems, this.declaredMaxItems);
    // Whoever fills in an instance names its attributes, so no template can require some. The Java
    // library's attribute-value field refuses the same minimum.
    const attributeValue = this.child instanceof TemplateField && this.child.cedarFieldType === CedarFieldType.ATTRIBUTE_VALUE;
    if (attributeValue && this.declaredMinItems !== null && this.declaredMinItems > 0) {
      throw new Error(`minItems must be zero in attribute-value field ${this.name}`);
    }
    const info: ChildDeploymentInfoAlwaysMultiple = new ChildDeploymentInfoAlwaysMultiple(this.name);
    this.setCommonData(info);
    info.declaredMinItems = this.declaredMinItems;
    info.declaredMaxItems = this.declaredMaxItems;
    return info;
  }
}
