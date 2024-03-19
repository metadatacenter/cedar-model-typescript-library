import { AbstractArtifact } from './AbstractArtifact';
import { ContainerArtifactChildrenInfo } from './deployment/ContainerArtifactChildrenInfo';
import { TemplateChild } from './types/basic-types/TemplateChild';
import { AdditionalProperties } from './types/wrapped-types/AdditionalProperties';
import { ChildDeploymentInfo } from './deployment/ChildDeploymentInfo';

export abstract class AbstractContainerArtifact extends AbstractArtifact {
  // Children
  private childrenInfo: ContainerArtifactChildrenInfo = new ContainerArtifactChildrenInfo();
  private childMap: Map<string, TemplateChild> = new Map<string, TemplateChild>();

  addChild(templateChild: TemplateChild, deploymentInfo: ChildDeploymentInfo): void {
    this.childrenInfo.add(deploymentInfo);
    this.childMap.set(deploymentInfo.name, templateChild);
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
}
