import { TemplateChild } from '../types/basic-types/TemplateChild';
import { Template } from './Template';
import { AbstractArtifactBuilder } from '../AbstractArtifacBuilder';
import { ChildDeploymentInfo } from '../deployment/ChildDeploymentInfo';

export class TemplateBuilder extends AbstractArtifactBuilder {
  private header: string | null = null;
  private footer: string | null = null;
  private schema_identifier: string | null = null;
  private instanceTypeSpecification: string | null = null;

  private children: Array<[TemplateChild, ChildDeploymentInfo]> = [];

  public withHeader(header: string): TemplateBuilder {
    this.header = header;
    return this;
  }

  public withFooter(footer: string): TemplateBuilder {
    this.footer = footer;
    return this;
  }

  public withSchemaIdentifier(schema_identifier: string): TemplateBuilder {
    this.schema_identifier = schema_identifier;
    return this;
  }

  public withInstanceTypeSpecification(instanceTypeSpecification: string): TemplateBuilder {
    this.instanceTypeSpecification = instanceTypeSpecification;
    return this;
  }

  public addChild(child: TemplateChild, deploymentInfo: ChildDeploymentInfo): TemplateBuilder {
    this.children.push([child, deploymentInfo]);
    return this;
  }

  public build(): Template {
    const template = Template.buildEmptyWithNullValues();
    super.buildInternal(template);

    template.header = this.header;
    template.footer = this.footer;
    template.schema_identifier = this.schema_identifier;
    template.instanceTypeSpecification = this.instanceTypeSpecification;

    this.children.forEach(([child, deploymentInfo]: [TemplateChild, ChildDeploymentInfo]) => {
      template.addChild(child, deploymentInfo);
    });

    return template;
  }
}
