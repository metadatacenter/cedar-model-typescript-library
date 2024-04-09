import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { TemplateElement } from './TemplateElement';
import { AbstractChildDeploymentInfo } from '../deployment/AbstractChildDeploymentInfo';

export class TemplateElementBuilder extends AbstractArtifactBuilder {
  private children: Array<[TemplateChild, AbstractChildDeploymentInfo]> = [];

  public addChild(child: TemplateChild, deploymentInfo: AbstractChildDeploymentInfo): TemplateElementBuilder {
    this.children.push([child, deploymentInfo]);
    return this;
  }

  public build(): TemplateElement {
    const templateElement: TemplateElement = TemplateElement.buildEmptyWithNullValues();
    super.buildInternal(templateElement);

    this.children.forEach(([child, deploymentInfo]: [TemplateChild, AbstractChildDeploymentInfo]) => {
      templateElement.addChild(child, deploymentInfo);
    });

    return templateElement;
  }
}
