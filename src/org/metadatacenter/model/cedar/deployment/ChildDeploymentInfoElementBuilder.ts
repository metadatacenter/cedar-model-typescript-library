import { NullableNumber } from '../types/basic-types/NullableNumber';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';
import { ChildDeploymentInfoElement } from './ChildDeploymentInfoElement';

/** Builds the deployment of an element child, which has a cardinality and no line placement. */
export class ChildDeploymentInfoElementBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  private multiInstance: boolean = false;
  private minItems: NullableNumber = null;
  private maxItems: NullableNumber = null;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withMultiInstance(multiInstance: boolean): this {
    this.multiInstance = multiInstance;
    return this;
  }

  public withMinItems(minItems: NullableNumber): this {
    this.minItems = minItems;
    return this;
  }

  public withMaxItems(maxItems: NullableNumber): this {
    this.maxItems = maxItems;
    return this;
  }

  public override build(): ChildDeploymentInfoElement {
    const info: ChildDeploymentInfoElement = new ChildDeploymentInfoElement(this.name);
    this.setCommonData(info);
    info.multiInstance = this.multiInstance;
    info.minItems = this.minItems;
    info.maxItems = this.maxItems;
    return info;
  }
}
