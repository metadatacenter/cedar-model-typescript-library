import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { TemplateField } from '../field/TemplateField';
import { NullableString } from '../types/basic-types/NullableString';
import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';

export abstract class AbstractChildDeploymentInfoBuilder {
  protected readonly child: TemplateChild | null = null;
  protected readonly name: string = '';
  protected atType: CedarArtifactType = CedarArtifactType.NULL;
  protected uiInputType: UiInputType = UiInputType.NULL;

  protected label: NullableString = null;
  protected description: NullableString = null;

  protected constructor(child: TemplateChild, name: string) {
    this.child = child;
    this.name = name;
  }

  public withLabel(label: NullableString): this {
    this.label = label;
    return this;
  }

  public withDescription(description: NullableString): this {
    this.description = description;
    return this;
  }

  abstract build(): AbstractChildDeploymentInfo;

  protected setCommonData(info: AbstractChildDeploymentInfo) {
    info.label = this.label;
    info.description = this.description;

    info.atType = this.atType;
    info.uiInputType = this.uiInputType;

    if (this.child != null) {
      info.atType = this.child.cedarArtifactType;
      if (this.child instanceof TemplateField) {
        info.uiInputType = this.child.cedarFieldType.getUiInputType();
      }
    }
  }
}
