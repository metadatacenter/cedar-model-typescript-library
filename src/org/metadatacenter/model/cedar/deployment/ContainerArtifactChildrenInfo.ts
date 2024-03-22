import { ChildDeploymentInfo } from './ChildDeploymentInfo';
import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { JsonSchema } from '../constants/JsonSchema';
import { UiInputType } from '../types/wrapped-types/UiInputType';
import { NullableString } from '../types/basic-types/NullableString';

export class ContainerArtifactChildrenInfo {
  private childNameList: Array<string> = [];
  private childMap: Map<string, ChildDeploymentInfo> = new Map<string, ChildDeploymentInfo>();

  add(childInfo: ChildDeploymentInfo) {
    this.childNameList.push(childInfo.name);
    this.childMap.set(childInfo.name, childInfo);
  }

  get children(): Array<ChildDeploymentInfo> {
    return this.childNameList.map((name) => this.childMap.get(name)!);
  }

  has(name: string) {
    return this.childMap.has(name);
  }

  get(name: string): ChildDeploymentInfo | null {
    return this.childMap.get(name) ?? null;
  }

  public getChildrenNames(): Array<string> {
    return Array.from(this.childMap.keys());
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

  public getPropertyLabelMap(): Record<string, NullableString> {
    const labelMap: { [key: string]: NullableString } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChild(childName);
      labelMap[childInfo.name] = childInfo.label;
    });
    return labelMap;
  }

  public getPropertyDescriptionMap(): Record<string, NullableString> {
    const descriptionMap: { [key: string]: NullableString } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChild(childName);
      descriptionMap[childInfo.name] = childInfo.description;
    });
    return descriptionMap;
  }
  public getNonStaticIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChild(childName);
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
      }
    });
    return iriMap;
  }

  public getNonStaticNonAttributeValueIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChild(childName);
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
      }
    });
    return iriMap;
  }

  hasAttributeValue(): boolean {
    for (const childInfo of this.childMap.values()) {
      if (childInfo.uiInputType === UiInputType.ATTRIBUTE_VALUE) {
        return true;
      }
    }
    return false;
  }

  private getChild(name: string): ChildDeploymentInfo {
    return this.childMap.get(name)!;
  }
}
