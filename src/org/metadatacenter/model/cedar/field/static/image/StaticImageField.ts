import { TemplateField } from '../../TemplateField';
import { ChildDeploymentInfoStaticBuilder } from '../../../deployment/ChildDeploymentInfoStaticBuilder';

export interface StaticImageField extends TemplateField {
  set content(content: string | null);

  get content(): string | null;

  createDeploymentBuilder(childName: string): ChildDeploymentInfoStaticBuilder;
}
