import { CedarArtifactType } from '../types/cedar-types/CedarArtifactType';
import { PropertyIri } from '../types/wrapped-types/PropertyIri';
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
   * The IRI a child is addressed by in an instance's `@context`. Declared by the
   * template where there is one, minted from the child's name where there is
   * not — which is the interesting part, and the reason a consumer cannot simply
   * read `childInfo.iri` and be done.
   *
   * Static fields and attribute-value fields are absent: neither is a property
   * of the instance. A static field renders and holds nothing; an attribute-value
   * field's *attributes* become properties, under names the template does not
   * know.
   *
   * This is the model-level answer. `getIRIMap` wraps the same thing in the shape
   * JSON Schema wants it in, which is a serialisation concern — a consumer that
   * only wants the IRIs had to reach through `[JsonSchema.enum][0]` to get at
   * them, and reaching into a JSON shape is exactly what asking the model is
   * supposed to replace.
   */
  public getChildIriMap(): Record<string, string> {
    const iriMap: Record<string, string> = {};
    this.childNameList.forEach((childName) => {
      const childInfo = this.getChildInfo(childName);
      if (childInfo.atType !== CedarArtifactType.STATIC_TEMPLATE_FIELD && childInfo.uiInputType !== UiInputType.ATTRIBUTE_VALUE) {
        if (childInfo instanceof AbstractDynamicChildDeploymentInfo) {
          iriMap[childInfo.name] = childInfo.iri !== null ? childInfo.iri : PropertyIri.forName(childInfo.name);
        }
      }
    });
    return iriMap;
  }

  /**
   * The same mapping in the shape a template's `@context` block takes.
   *
   * `{ name: { enum: [iri] } }`, which is what the JSON writer splats straight
   * into `properties.@context.properties`. Derived from `getChildIriMap` so the
   * two cannot disagree.
   */
  public getIRIMap(): { [key: string]: { [key in typeof JsonSchema.enum]: Array<NullableString> } } {
    const iriMap: { [key: string]: { [key in typeof JsonSchema.enum]: Array<string | null> } } = {};
    const plain = this.getChildIriMap();
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
