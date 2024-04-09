import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { TemplateField } from '../field/TemplateField';
import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';

export class AbstractChildDeploymentInfoBuilder {
  protected readonly child: TemplateChild | null = null;
  protected readonly name: string = '';
  protected label: NullableString = null;
  protected description: NullableString = null;
  protected iri: NullableString = null;
  protected atType: CedarArtifactType = CedarArtifactType.NULL;
  protected uiInputType: UiInputType = UiInputType.NULL;
  protected requiredValue: boolean = false;
  protected hidden: boolean = false;

  constructor(child: TemplateChild, name: string) {
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

  public build(): AbstractChildDeploymentInfo {
    const info: ChildDeploymentInfo = new ChildDeploymentInfo(this.name);
    this.setCommonData(info);
    return info;
  }

  protected setCommonData(info: AbstractChildDeploymentInfo) {
    info.label = this.label;
    info.description = this.description;
    info.iri = this.iri;
    info.atType = this.atType;
    info.uiInputType = this.uiInputType;
    info.requiredValue = this.requiredValue;
    info.hidden = this.hidden;

    if (this.child != null) {
      info.atType = this.child.cedarArtifactType;
      if (this.child instanceof TemplateField) {
        info.uiInputType = this.child.cedarFieldType.getUiInputType();
      }
    }
  }
}
