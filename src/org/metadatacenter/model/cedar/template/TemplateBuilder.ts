import { TemplateChild } from '../types/basic-types/TemplateChild';
import { Template } from './Template';
import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { AbstractChildDeploymentInfo } from '../deployment/AbstractChildDeploymentInfo';

export class TemplateBuilder extends AbstractArtifactBuilder {
  private header: string | null = null;
  private footer: string | null = null;
  private instanceTypeSpecification: string | null = null;

  private children: Array<[TemplateChild, AbstractChildDeploymentInfo]> = [];

  public withHeader(header: string): TemplateBuilder {
    this.header = header;
    return this;
  }

  public withFooter(footer: string): TemplateBuilder {
    this.footer = footer;
    return this;
  }

  public withInstanceTypeSpecification(instanceTypeSpecification: string): TemplateBuilder {
    this.instanceTypeSpecification = instanceTypeSpecification;
    return this;
  }

  public addChild(child: TemplateChild, deploymentInfo: AbstractChildDeploymentInfo): TemplateBuilder {
    this.children.push([child, deploymentInfo]);
    return this;
  }

  public build(): Template {
    const template: Template = Template.buildEmptyWithNullValues();
    super.buildInternal(template);

    template.header = this.header;
    template.footer = this.footer;
    template.instanceTypeSpecification = this.instanceTypeSpecification;

    this.children.forEach(([child, deploymentInfo]: [TemplateChild, AbstractChildDeploymentInfo]) => {
      template.addChild(child, deploymentInfo);
    });

    return template;
  }
}
