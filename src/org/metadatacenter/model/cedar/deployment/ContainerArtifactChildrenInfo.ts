import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { JsonSchema } from '../constants/JsonSchema';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';
import { AbstractChildDeploymentInfo } from './AbstractChildDeploymentInfo';
import { AbstractDynamicChildDeploymentInfo } from './AbstractDynamicChildDeploymentInfo';
import { AbstractContainerArtifact } from '../AbstractContainerArtifact';

export class ContainerArtifactChildrenInfo {
  private childNameList: Array<string> = [];
  private childMap: Map<string, AbstractChildDeploymentInfo> = new Map<string, AbstractChildDeploymentInfo>();

  add(childInfo: AbstractChildDeploymentInfo) {
    this.childNameList.push(childInfo.name);
    this.childMap.set(childInfo.name, childInfo);
  }

  get children(): Array<AbstractChildDeploymentInfo> {
    return this.childNameList.map((name) => this.childMap.get(name)!);
  }

  has(name: string) {
    return this.childMap.has(name);
  }

  get(name: string): AbstractChildDeploymentInfo | null {
    return this.childMap.get(name) ?? null;
  }

  public getChildrenNames(): Array<string> {
    return Array.from(this.childMap.keys());
  }

  public getChildrenNamesForRequiredInProperties(): Array<string> {
    const result: Array<string> = [];
    for (const [name, childInfo] of this.childMap.entries()) {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        result.push(name);
      }
    }
    return result;
  }

  public getChildrenNamesForRequired(): Array<string> {
    const result: Array<string> = [];
    for (const [name, childInfo] of this.childMap.entries()) {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        result.push(name);
      }
    }
    return result;
  }

  public getOnlyElementNamesForPropertiesContextRequired(): Array<string> {
    const result: Array<string> = [];
    for (const [name, childInfo] of this.childMap.entries()) {
      if (childInfo.atType === CedarArtifactType.TEMPLATE_ELEMENT) {
        result.push(name);
      }
    }
    return result;
  }

  public getPropertyLabelMap(container: AbstractContainerArtifact): Record<string, NullableString> {
    const labelMap: { [key: string]: NullableString } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (childInfo.label !== null) {
        labelMap[childInfo.name] = childInfo.label;
      } else {
        const child = container.getChild(childName);
        if (child !== null && child.schema_name !== null) {
          labelMap[childInfo.name] = child.schema_name;
        }
      }
    });
    return labelMap;
  }

  public getPropertyDescriptionMap(_container: AbstractContainerArtifact): Record<string, NullableString> {
    const descriptionMap: { [key: string]: NullableString } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (childInfo.description !== null) {
        descriptionMap[childInfo.name] = childInfo.description;
      } else {
        descriptionMap[childInfo.name] = '';
      }
    });
    return descriptionMap;
  }

  public getIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
          if (childInfo.iri !== null) {
            iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
          } else {
            //TODO: Generate a random UUID here
            const iri = 'https://schema.metadatacenter.org/properties/' + encodeURIComponent(childInfo.name).replace(/%20/g, '+');
            iriMap[childInfo.name] = { [JsonSchema.enum]: [iri] };
          }
        }
      }
    });
    return iriMap;
  }

  // public getNonStaticNonAttributeValueIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
  //   const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
  //   this.childNameList.forEach((childName) => {
  //     const childInfo = this.getChildInfo(childName);
  //     if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
  //       if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
  //         iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
  //       }
  //     }
  //   });
  //   return iriMap;
  // }

  hasAttributeValue(): boolean {
    for (const childInfo of this.childMap.values()) {
      if (childInfo.uiInputType === UiInputType.ATTRIBUTE_VALUE) {
        return true;
      }
    }
    return false;
  }

  private getChildInfo(name: string): AbstractChildDeploymentInfo {
    return this.childMap.get(name)!;
  }
}
