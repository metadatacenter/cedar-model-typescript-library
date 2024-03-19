import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { ChildDeploymentInfo } from '../deployment/ChildDeploymentInfo';
import { TemplateElement } from './TemplateElement';

export class TemplateElementBuilder extends AbstractArtifactBuilder {
  private children: Array<[TemplateChild, ChildDeploymentInfo]> = [];

  public addChild(child: TemplateChild, deploymentInfo: ChildDeploymentInfo): TemplateElementBuilder {
    this.children.push([child, deploymentInfo]);
    return this;
  }

  public build(): TemplateElement {
    const templateElement: TemplateElement = TemplateElement.buildEmptyWithNullValues();
    super.buildInternal(templateElement);

    this.children.forEach(([child, deploymentInfo]: [TemplateChild, ChildDeploymentInfo]) => {
      templateElement.addChild(child, deploymentInfo);
    });

    return templateElement;
  }
}
