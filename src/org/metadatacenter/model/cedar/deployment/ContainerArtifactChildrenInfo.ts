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

  /**
   * What the container says about how its children are labelled, and nothing more.
   *
   * A key here names a child, so a key naming none of them — which real templates carry — is dropped
   * on the way through, along with the whole entry it stood for. What was also dropped, less
   * defensibly, was the distinction between a child the container labels and one it does not: a child
   * with no label of its own got the field's own name written in as if the container had asked for it,
   * and a child with no description got an empty string. The container declares these or it does not.
   */
  public getPropertyLabelMap(_container: AbstractContainerArtifact): Record<string, NullableString> {
    const labelMap: { [key: string]: NullableString } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (childInfo.label !== null) {
        labelMap[childInfo.name] = childInfo.label;
      }
    });
    return labelMap;
  }

  /** As the labels above: what the container declares, with nothing filled in for what it does not. */
  public getPropertyDescriptionMap(_container: AbstractContainerArtifact): Record<string, NullableString> {
    const descriptionMap: { [key: string]: NullableString } = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (childInfo.description !== null) {
        descriptionMap[childInfo.name] = childInfo.description;
      }
    });
    return descriptionMap;
  }

  /**
   * Each child's property IRI, as a plain mapping of name to IRI.
   *
   * Only ordinary children contribute required instance context entries. Attribute-value
   * groups may declare optional schema mappings, but their attributes supply the instance terms.
   * Missing IRIs are assigned by the repository, never invented here.
   */
  public getChildIriMap(): Record<string, string> {
    return this.collectChildIris(false);
  }

  private collectChildIris(includeAttributeValue: boolean): Record<string, string> {
    const iriMap: Record<string, string> = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (
        childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD &&
        (includeAttributeValue || childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE)
      ) {
        if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
          // A child with no IRI of its own gets no mapping. The IRI is identity, so the repository
          // assigns it when the artifact is uploaded, as it assigns an attribute's; deriving one from
          // the child's name asserted an identity nothing had assigned, and one that would change the
          // moment the author renamed the child.
          if (childInfo.iri !== null) {
            iriMap[childInfo.name] = childInfo.iri;
          }
        }
      }
    });
    return iriMap;
  }

  /**
   * The ordinary children requiring a property IRI, in the order the container declares them.
   *
   * `_ui.order` is what an author decides, so it is the order a rendering states. Taking these
   * names from `Object.keys` of the IRI map instead put every child whose name looks like an
   * array index first, in numeric order, because that is how JavaScript enumerates an object's
   * keys — so a template with children named `14` and `18` came back with them hoisted ahead of
   * the rest, and no longer matched what `cedar-artifact-library` writes from the same document.
   */
  public getChildNamesWithIri(): Array<string> {
    const mapped = this.getChildIriMap();
    return this.getChildrenNames().filter((name) => Object.prototype.hasOwnProperty.call(mapped, name));
  }

  /**
   * The same mapping in the shape a template's `@context` block takes.
   *
   * `{ name: { enum: [iri] } }`, which is what the JSON writer splats straight
   * into `properties.@context.properties`, including optional attribute-value group mappings.
   */
  public getIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    // Schema declarations preserve group IRIs without making them required instance terms.
    const plain = this.collectChildIris(true);
    Object.keys(plain).forEach((name) => {
      iriMap[name] = { [JsonSchema.enum]: [plain[name]] };
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
