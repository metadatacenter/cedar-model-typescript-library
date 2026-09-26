import { AbstractSchemaArtifact } from './AbstractSchemaArtifact';
import { ContainerArtifactChildrenInfo } from './deployment/ContainerArtifactChildrenInfo';
import { TemplateChild } from './types/basic-types/TemplateChild';
import { AdditionalProperties } from './types/wrapped-types/AdditionalProperties';
import { TemplateElement } from './element/TemplateElement';
import { TemplateField } from './field/TemplateField';
import { CedarArtifactType } from './types/cedar-types/CedarArtifactType';
import { AbstractChildDeploymentInfo } from './deployment/AbstractChildDeploymentInfo';
import { CedarFieldType } from './types/cedar-types/CedarFieldType';
import { ReservedNames } from './ReservedNames';

export abstract class AbstractContainerArtifact extends AbstractSchemaArtifact {
  // Children
  private childrenInfo: ContainerArtifactChildrenInfo = new ContainerArtifactChildrenInfo();
  private childMap: Map<string, TemplateChild> = new Map<string, TemplateChild>();
  private instanceTypes: string[] = [];

  get instanceTypeSpecifications(): string[] {
    return [...this.instanceTypes];
  }
  set instanceTypeSpecifications(types: string[]) {
    if (
      !Array.isArray(types) ||
      types.some((type) => typeof type !== 'string' || !/^[a-z][a-z0-9+.-]*:\S+$/i.test(type)) ||
      new Set(types).size !== types.length
    ) {
      throw new Error('Instance types must be unique absolute IRIs');
    }
    this.instanceTypes = [...types];
  }

  /** Compatibility accessor for callers authoring one type. */
  get instanceTypeSpecification(): string | null {
    return this.instanceTypeSpecifications[0] ?? null;
  }
  set instanceTypeSpecification(value: string | null) {
    this.instanceTypeSpecifications = value === null ? [] : [value];
  }

  addChild(templateChild: TemplateChild, deploymentInfo: AbstractChildDeploymentInfo): void {
    AbstractContainerArtifact.refuseReservedChildName(this, templateChild, deploymentInfo.name);
    this.childrenInfo.add(deploymentInfo);
    this.childMap.set(deploymentInfo.name, templateChild);
  }

  /** A child may not take a name {@link ReservedNames} reserves, nor an attribute-value field its parent's YAML keys. */
  private static refuseReservedChildName(parent: AbstractContainerArtifact, child: TemplateChild, name: string): void {
    const attributeValue =
      child.cedarArtifactType === CedarArtifactType.TEMPLATE_FIELD &&
      (child as TemplateField).cedarFieldType === CedarFieldType.ATTRIBUTE_VALUE;
    const kind = parent.cedarArtifactType === CedarArtifactType.TEMPLATE ? 'template' : 'element';
    if (attributeValue ? ReservedNames.isReservedAttributeValueFieldName(name, kind) : ReservedNames.isReservedName(name)) {
      throw new Error(`Child name "${name}" is reserved for CEDAR instance metadata.`);
    }
  }

  getChildrenInfo(): ContainerArtifactChildrenInfo {
    return this.childrenInfo;
  }

  getAdditionalProperties(): AdditionalProperties {
    if (this.childrenInfo.hasAttributeValue()) {
      return AdditionalProperties.ALLOW_ATTRIBUTE_VALUE;
    } else {
      return AdditionalProperties.FALSE;
    }
  }

  getChild(childName: string): TemplateChild | null {
    return this.childMap.get(childName) ?? null;
  }

  getElement(childName: string): TemplateElement | null {
    const templateChild: TemplateChild | null = this.getChild(childName);
    if (templateChild !== null && templateChild.cedarArtifactType === CedarArtifactType.TEMPLATE_ELEMENT) {
      return templateChild as TemplateElement;
    }
    return null;
  }

  getField(childName: string): TemplateField | null {
    const templateChild: TemplateChild | null = this.getChild(childName);
    if (templateChild !== null && templateChild.cedarArtifactType === CedarArtifactType.TEMPLATE_FIELD) {
      return templateChild as TemplateField;
    }
    return null;
  }

  getChildInfo(childName: string): AbstractChildDeploymentInfo | null {
    return this.childrenInfo.get(childName);
  }
}
