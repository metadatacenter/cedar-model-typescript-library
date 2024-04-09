import { NullableNumber } from '../types/basic-types/NullableNumber';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractDynamicChildDeploymentInfoBuilder } from './AbstractDynamicChildDeploymentInfoBuilder';

export class ChildDeploymentInfoBuilder extends AbstractDynamicChildDeploymentInfoBuilder {
  private multiInstance: boolean = false;
  private minItems: NullableNumber = null;
  private maxItems: NullableNumber = null;

  constructor(child: TemplateChild, name: string) {
    super(child, name);
  }

  public withMultiInstance(multiInstance: boolean): ChildDeploymentInfoBuilder {
    this.multiInstance = multiInstance;
    return this;
  }

  public withMinItems(minItems: NullableNumber): ChildDeploymentInfoBuilder {
    this.minItems = minItems;
    return this;
  }

  public withMaxItems(maxItems: NullableNumber): ChildDeploymentInfoBuilder {
    this.maxItems = maxItems;
    return this;
  }

  public build(): ChildDeploymentInfo {
    const info = new ChildDeploymentInfo(this.name);
    this.setCommonData(info);
    info.multiInstance = this.multiInstance;
    info.minItems = this.minItems;
    info.maxItems = this.maxItems;
    return info;
  }
}
