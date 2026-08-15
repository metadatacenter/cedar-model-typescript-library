import { TemplateChild } from '../types/basic-types/TemplateChild';
import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { TemplateElement } from './TemplateElement';
import { AbstractChildDeploymentInfo } from '../deployment/AbstractChildDeploymentInfo';

export class TemplateElementBuilder extends AbstractArtifactBuilder {
  private children: Array<[TemplateChild, AbstractChildDeploymentInfo]> = [];
  private instanceTypeSpecification: string | null = null;

  /** The type an instance of this element declares itself to be. */
  public withInstanceTypeSpecification(instanceTypeSpecification: string): TemplateElementBuilder {
    this.instanceTypeSpecification = instanceTypeSpecification;
    return this;
  }

  public addChild(child: TemplateChild, deploymentInfo: AbstractChildDeploymentInfo): TemplateElementBuilder {
    this.children.push([child, deploymentInfo]);
    return this;
  }

  public build(): TemplateElement {
    const templateElement: TemplateElement = TemplateElement.buildEmptyWithNullValues();
    super.buildInternal(templateElement);
    templateElement.instanceTypeSpecification = this.instanceTypeSpecification;

    this.children.forEach(([child, deploymentInfo]: [TemplateChild, AbstractChildDeploymentInfo]) => {
      templateElement.addChild(child, deploymentInfo);
    });

    return templateElement;
  }
}
