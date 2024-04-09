import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoAlwaysSingleBuilder } from '../../../deployment/ChildDeploymentInfoAlwaysSingleBuilder';

export interface StaticImageField extends TemplateField {
  set content(content: string | null);

  get content(): string | null;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoAlwaysSingleBuilder;
}
