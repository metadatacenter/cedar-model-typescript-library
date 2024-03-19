import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';
import { NullableNumber } from '../types/basic-types/NullableNumber';
import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { TemplateChild } from '../types/basic-types/TemplateChild';
import { TemplateField } from '../field/TemplateField';

export class ChildDeploymentInfoBuilder {
  private readonly child: TemplateChild | null = null;
  private readonly name: string = '';
  private label: NullableString = null;
  private description: NullableString = null;
  private iri: NullableString = null;
  private atType: CedarArtifactType = CedarArtifactType.NULL;
  private uiInputType: UiInputType = UiInputType.NULL;
  private multiInstance: boolean = false;
  private minItems: NullableNumber = null;
  private maxItems: NullableNumber = null;
  private requiredValue: boolean = false;
  private hidden: boolean = false;

  constructor(child: TemplateChild, name: string) {
    this.child = child;
    this.name = name;
  }

  public withLabel(label: NullableString): ChildDeploymentInfoBuilder {
    this.label = label;
    return this;
  }

  public withDescription(description: NullableString): ChildDeploymentInfoBuilder {
    this.description = description;
    return this;
  }

  public withIri(iri: NullableString): ChildDeploymentInfoBuilder {
    this.iri = iri;
    return this;
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

  public withRequiredValue(requiredValue: boolean): ChildDeploymentInfoBuilder {
    this.requiredValue = requiredValue;
    return this;
  }

  public withHidden(hidden: boolean): ChildDeploymentInfoBuilder {
    this.hidden = hidden;
    return this;
  }

  public build(): ChildDeploymentInfo {
    const info = new ChildDeploymentInfo(this.name);
    info.label = this.label;
    info.description = this.description;
    info.iri = this.iri;
    info.atType = this.atType;
    info.uiInputType = this.uiInputType;
    info.multiInstance = this.multiInstance;
    info.minItems = this.minItems;
    info.maxItems = this.maxItems;
    info.requiredValue = this.requiredValue;
    info.hidden = this.hidden;

    if (this.child != null) {
      info.atType = this.child.cedarArtifactType;
      if (this.child instanceof TemplateField) {
        info.uiInputType = this.child.cedarFieldType.getUiInputType();
      }
    }

    return info;
  }
}
