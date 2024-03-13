import { CedarContainerChildInfo } from './CedarContainerChildInfo';
import { CedarArtifactType } from './CedarArtifactType';
import { JsonSchema } from '../../constants/JsonSchema';
import { UiInputType } from './UiInputType';
import { NullableString } from '../basic-types/NullableString';

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

  get(name: string): CedarContainerChildInfo | null {
    return this.nameMap.get(name) ?? null;
  }

  public getChildrenNames(): Array<string> {
    return Array.from(this.nameMap.keys());
  }

  public getChildrenNamesForRequired(): Array<string> {
    return Array.from(this.nameMap.entries())
      .filter(
        ([_, childInfo]) =>
          childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE,
      )
      .map(([name, _]) => name);
  }

  public getPropertyLabelMap(): Record<string, NullableString> {
    const labelMap: { [key: string]: NullableString } = {};
    this.childList.forEach((childInfo) => {
      labelMap[childInfo.name] = childInfo.label;
    });
    return labelMap;
  }

  public getPropertyDescriptionMap(): Record<string, NullableString> {
    const descriptionMap: { [key: string]: NullableString } = {};
    this.childList.forEach((childInfo) => {
      descriptionMap[childInfo.name] = childInfo.description;
    });
    return descriptionMap;
  }
  public getNonStaticIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    this.childList.forEach((childInfo) => {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD) {
        iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
      }
    });
    return iriMap;
  }

  public getNonStaticNonAttributeValueIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    this.childList.forEach((childInfo) => {
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        iriMap[childInfo.name] = { [JsonSchema.enum]: [childInfo.iri] };
      }
    });
    return iriMap;
  }

  hasAttributeValue(): boolean {
    return this.childList.some((childInfo) => {
      return childInfo.uiInputType === UiInputType.ATTRIBUTE_VALUE;
    });
  }
}
