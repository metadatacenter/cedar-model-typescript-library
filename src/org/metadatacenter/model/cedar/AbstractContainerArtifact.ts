import { AbstractArtifact } from './AbstractArtifact';
import { ContainerArtifactChildrenInfo } from './deployment/ContainerArtifactChildrenInfo';
import { TemplateChild } from './types/basic-types/TemplateChild';
import { AdditionalProperties } from './types/wrapped-types/AdditionalProperties';

export abstract class AbstractContainerArtifact extends AbstractArtifact {
  // Children
  public childrenInfo: ContainerArtifactChildrenInfo = new ContainerArtifactChildrenInfo();
  public children: Array<TemplateChild> = [];

  addChild(templateChild: TemplateChild): void {
    this.children.push(templateChild);
  }

  getAdditionalProperties(): AdditionalProperties {
    if (this.childrenInfo.hasAttributeValue()) {
      return AdditionalProperties.ALLOW_ATTRIBUTE_VALUE;
    } else {
      return AdditionalProperties.FALSE;
    }
  }
}
