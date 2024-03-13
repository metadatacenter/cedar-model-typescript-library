import { CedarAbstractArtifact } from './CedarAbstractArtifact';
import { CedarContainerChildrenInfo } from './types/beans/CedarContainerChildrenInfo';
import { CedarTemplateChild } from './types/basic-types/CedarTemplateChild';
import { AdditionalProperties } from './types/beans/AdditionalProperties';

export abstract class CedarContainerAbstractArtifact extends CedarAbstractArtifact {
  // Children
  public childrenInfo: CedarContainerChildrenInfo = new CedarContainerChildrenInfo();
  public children: Array<CedarTemplateChild> = [];

  addChild(templateChild: CedarTemplateChild): void {
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
