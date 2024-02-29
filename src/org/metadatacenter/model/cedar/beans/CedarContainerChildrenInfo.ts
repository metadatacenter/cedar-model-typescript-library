import { CedarContainerChildInfo } from './CedarContainerChildInfo';
import { CedarArtifactType } from './CedarArtifactTypeValue';
import { JsonSchema } from '../constants/JsonSchema';

export class CedarContainerChildrenInfo {
  private childList: Array<CedarContainerChildInfo> = [];
  private nameMap = new Map<string, CedarContainerChildInfo>();

  add(childInfo: CedarContainerChildInfo) {
    this.childList.push(childInfo);
    this.nameMap.set(childInfo.name, childInfo);
  }

  get children(): Array<CedarContainerChildInfo> {
    return this.childList;
  }

  has(name: string) {
    return this.nameMap.has(name);
  }

  get(name: string) {
    return this.nameMap.get(name);
  }

  public getChildrenNames(): Array<string> {
    return Array.from(this.nameMap.keys());
  }

  public getNonStaticChildrenNames(): Array<string> {
    return Array.from(this.nameMap.entries())
      .filter(([_, childInfo]) => childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD)
      .map(([name, _]) => name);
  }

  public getPropertyLabelMap(): { [key: string]: string | null } {
    const labelMap: { [key: string]: string | null } = {};
    this.childList.forEach((childInfo) => {
      labelMap[childInfo.name] = childInfo.label;
    });
    return labelMap;
  }

  public getPropertyDescriptionMap(): { [key: string]: string | null } {
    const descriptionMap: { [key: string]: string | null } = {};
    this.childList.forEach((childInfo) => {
      descriptionMap[childInfo.name] = childInfo.description;
    });
    return descriptionMap;
  }
  public getNonStaticIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    this.childList.forEach((childInfo) => {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
      }
    });
    return iriMap;
  }

  public getChildrenDefinitions(): { [key: string]: any } {
    const childrenMap: { [key: string]: any } = {};
    this.childList.forEach((childInfo) => {
      childrenMap[childInfo.name] = { 'Child definition': 'here' };
    });
    return childrenMap;
  }
}
